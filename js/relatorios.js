// =====================================================
// RELATÓRIOS - ERP CRÉDITO
// =====================================================

// ------------------------------
// Dados reais (emprestimosERP)
// ------------------------------

function formatarDataRelatorio(data) {

    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// O status do contrato ("Em Atraso") é definido manualmente e quase
// nunca é atualizado sozinho. Quem realmente sabe se tem parcela
// vencida é o módulo de Recebimentos (atualizado automaticamente pela
// data) — por isso "temParcelaAtrasada" tem prioridade aqui.
function normalizarStatus(status, temParcelaAtrasada) {

    if (status === "Quitado" || status === "Finalizado") return "Quitado";
    if (temParcelaAtrasada || status === "Em Atraso") return "Atrasado";
    return "Em Aberto";

}

// A comissão do parceiro só é considerada paga quando dada baixa
// manualmente na tela de Parceiros (independente do status do empréstimo).
function comissaoContratoPaga(numeroContrato) {

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const emprestimo = emprestimos.find(e => e.contrato === numeroContrato);

    return !!(emprestimo && emprestimo.comissaoParceiroPaga);

}

// A comissão é calculada sobre o saldo devedor ATUAL do contrato (não o
// valor original) — diminui conforme o cliente vai amortizando.
function baseComissaoRelatorio(numeroContrato) {

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const emprestimo = emprestimos.find(e => e.contrato === numeroContrato);

    if (!emprestimo) return 0;

    return emprestimo.saldoDevedor != null
        ? Number(emprestimo.saldoDevedor)
        : Number(emprestimo.valor || 0);

}

// Valor da comissão do parceiro sobre um contrato: sempre uma FATIA dos
// juros que o contrato de fato gera, nunca mais que isso (um contrato
// de 0% de juros não gera comissão nenhuma, mesmo que o parceiro tenha
// um % cadastrado).
function comissaoParceiroRelatorio(numeroContrato, parceiro) {

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const emprestimo = emprestimos.find(e => e.contrato === numeroContrato);

    if (!emprestimo) return 0;

    return jurosParceiroContrato(emprestimo, parceiro);

}

// A comissão do parceiro só conta como "paga dentro do período" se a data
// em que foi dada baixa (dataPagamentoComissaoParceiro, gravada em
// parceiros.js) cair dentro do intervalo selecionado no filtro "Período".
function comissaoPagaNoPeriodo(numeroContrato, inicio, fim) {

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const emprestimo = emprestimos.find(e => e.contrato === numeroContrato);

    if (!emprestimo || !emprestimo.comissaoParceiroPaga) return false;

    const data = emprestimo.dataPagamentoComissaoParceiro;

    if (inicio && (!data || data < inicio)) return false;
    if (fim && (!data || data > fim)) return false;

    return true;

}

// Pagamentos reais (historicoRecebimentosERP) dos contratos presentes em
// "lista", dentro do intervalo de datas selecionado — é a fonte de
// verdade pra saber quanto já foi de fato recebido (e não uma estimativa).
function pagamentosDoPeriodo(lista, inicio, fim) {

    const contratos = new Set(lista.map(item => item.contrato));

    const historico = JSON.parse(localStorage.getItem("historicoRecebimentosERP")) || [];

    return historico.filter(pagamento => {

        if (!contratos.has(pagamento.contrato)) return false;

        if (inicio && (!pagamento.dataPagamento || pagamento.dataPagamento < inicio)) return false;
        if (fim && (!pagamento.dataPagamento || pagamento.dataPagamento > fim)) return false;

        return true;

    });

}

function construirRelatorios() {

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];
    const recebimentos = JSON.parse(localStorage.getItem("recebimentosERP")) || [];
    const historico = JSON.parse(localStorage.getItem("historicoRecebimentosERP")) || [];

    return emprestimos.map(emprestimo => {

        const valor = Number(emprestimo.valor || 0);
        const totalReceber = Number(emprestimo.totalReceber || valor);
        const juros = totalReceber - valor;

        // Total já pago de fato nesse contrato (capital + juros), somado
        // a partir do histórico real de recebimentos — não uma estimativa
        // via saldo devedor (que só reflete o principal e não se move em
        // parcelas só-de-juros).
        const recebido = historico
            .filter(h => h.contrato === emprestimo.contrato)
            .reduce((soma, h) => soma + Number(h.valorRecebido || 0), 0);

        const temParcelaAtrasada = recebimentos.some(
            r => r.contrato === emprestimo.contrato && r.status === "Atrasado"
        );

        return {
            data: formatarDataRelatorio(emprestimo.dataContrato),
            dataISO: emprestimo.dataContrato || "",
            cliente: emprestimo.cliente || "-",
            contrato: emprestimo.contrato || "-",
            parceiro: emprestimo.parceiro || "-",
            valor,
            juros,
            recebido,
            status: normalizarStatus(emprestimo.status, temParcelaAtrasada)
        };

    });

}

let relatorios = construirRelatorios();

// ------------------------------
// Inicialização
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {

    carregarClientes();

    carregarParceiros();

    carregarTabela(relatorios);

    configurarAbas();

    configurarBotoes();

    atualizarCards(relatorios);

    atualizarResumoTela(relatorios);

    gerarRankingParceiros(relatorios);

    gerarRankingClientes(relatorios);

    carregarGraficos();

    configurarPeriodoEmprestadoJuros();

});

// =====================================================
// CARREGAR TABELA
// =====================================================

function carregarTabela(lista){

    const tbody = document.getElementById("listaRelatorios");

    tbody.innerHTML = "";

    lista.forEach(item=>{

        tbody.innerHTML += `
        <tr>

            <td>${item.data}</td>

            <td>${item.cliente}</td>

            <td>${item.contrato}</td>

            <td>${item.parceiro}</td>

            <td>${formatarMoeda(item.valor)}</td>

            <td>${formatarMoeda(item.juros)}</td>

            <td>${formatarMoeda(item.recebido)}</td>

            <td>${statusHTML(item.status)}</td>

        </tr>
        `;

    });

}

// =====================================================
// STATUS
// =====================================================

function statusHTML(status){

    if(status==="Quitado"){

        return `<span class="status quitado">${status}</span>`;

    }

    if(status==="Atrasado"){

        return `<span class="status atraso">${status}</span>`;

    }

    return `<span class="status aberto">${status}</span>`;

}

// =====================================================
// FORMATAÇÃO
// =====================================================

function formatarMoeda(valor){

    return Number(valor || 0).toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}

// =====================================================
// ABAS
// =====================================================

// Quais seções cada aba mostra. "Visão Geral" mostra tudo; as outras
// mostram só o que faz sentido pro contexto delas.
const secoesPorAba = {

    "Visão Geral": ["secaoCards", "secaoTabela", "secaoPeriodo", "secaoResumo", "secaoRankings", "secaoGraficos"],
    "Financeiro": ["secaoCards", "secaoPeriodo", "secaoResumo", "secaoGraficos"],
    "Clientes & Parceiros": ["secaoCards", "secaoRankings"],
    "Operacional": ["secaoTabela", "secaoPeriodo"]

};

function aplicarAba(nomeAba){

    const secoesParaMostrar = secoesPorAba[nomeAba] || secoesPorAba["Visão Geral"];

    Object.values(secoesPorAba)
        .flat()
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .forEach(function(idSecao){

            const secao = document.getElementById(idSecao);

            if (!secao) return;

            secao.style.display = secoesParaMostrar.includes(idSecao) ? "" : "none";

        });

}

function configurarAbas(){

    const abas=document.querySelectorAll(".aba");

    abas.forEach(aba=>{

        aba.addEventListener("click",()=>{

            abas.forEach(a=>a.classList.remove("ativa"));

            aba.classList.add("ativa");

            // Remove os emojis pra comparar só o texto ("📊 Visão Geral" -> "Visão Geral").
            const nomeAba = aba.textContent.trim().replace(/^\S+\s*/, "");

            aplicarAba(nomeAba);

        });

    });

    // Começa mostrando tudo (aba "Visão Geral", que já vem marcada como ativa no HTML).
    aplicarAba("Visão Geral");

}

// =====================================================
// BOTÕES
// =====================================================

function configurarBotoes(){

    const botoes=document.querySelectorAll(".botoes-relatorio button");

    botoes.forEach(botao=>{

        botao.addEventListener("click",()=>{

            const texto=botao.innerText.trim();

            switch(texto){

                case "Filtrar":

                    filtrarRelatorio();

                    break;

                case "Limpar":

                    limparFiltros();

                    break;

                case "Excel":

                    exportarExcel();

                    break;

                case "PDF":

                    exportarPDF();

                    break;

                case "Imprimir":

                    imprimirRelatorio();

                    break;

            }

        });

    });

}

// =====================================================
// FILTRAR
// =====================================================

// Calcula a data inicial/final (em ISO "aaaa-mm-dd") a partir da opção
// escolhida no seletor "Período". Para "Personalizado", usa os campos
// Data Inicial/Data Final preenchidos manualmente.
function calcularIntervaloPeriodo() {

    const periodo = document.getElementById("periodo").value;
    const hojeISO = obterHojeISO();

    if (periodo === "Personalizado") {

        return {
            inicio: document.getElementById("dataInicial").value || null,
            fim: document.getElementById("dataFinal").value || null
        };

    }

    const hoje = new Date(hojeISO + "T00:00:00");

    switch (periodo) {

        case "Todos":
            return { inicio: null, fim: null };

        case "Hoje":
            return { inicio: hojeISO, fim: hojeISO };

        case "Esta Semana": {

            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());

            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + 6);

            return {
                inicio: paraISOLocal(inicioSemana),
                fim: paraISOLocal(fimSemana)
            };

        }

        case "Este Mês":
            return { inicio: hojeISO.slice(0, 7) + "-01", fim: hojeISO };

        case "Últimos 30 Dias": {

            const inicio30 = new Date(hoje);
            inicio30.setDate(hoje.getDate() - 30);

            return { inicio: paraISOLocal(inicio30), fim: hojeISO };

        }

        case "Este Ano":
            return { inicio: hojeISO.slice(0, 4) + "-01-01", fim: hojeISO };

        default:
            return { inicio: null, fim: null };

    }

}

function filtrarRelatorio(){

    let lista=[...relatorios];

    const status=document.getElementById("status").value;

    const parceiro=document.getElementById("parceiro").value;

    const cliente=document.getElementById("cliente").value;

    const tipo=document.getElementById("tipoRelatorio").value;

    if(status!=="Todos"){

        lista=lista.filter(item=>item.status===status);

    }

    if(cliente!=="Todos"){

        lista=lista.filter(item=>nomesIguais(item.cliente, cliente));

    }

    if(parceiro!=="Todos"){

        lista=lista.filter(item=>nomesIguais(item.parceiro, parceiro));

    }

    // "Tipo" recorta o recorte de dados mais próximo do que cada opção
    // representa. As demais opções (Financeiro, Clientes, Parceiros,
    // Recebimentos, Caixa) usam a mesma base de dados dos contratos —
    // por isso não recortam linhas, só a Inadimplência tem um recorte
    // de fato (contratos atrasados).
    if (tipo === "Inadimplência") {

        lista = lista.filter(item => item.status === "Atrasado");

    }

    // "listaParaPagamentos" tem os mesmos filtros de cliente/parceiro/
    // status/tipo, mas SEM cortar pela data do contrato — um contrato
    // antigo pode ter recebido um pagamento dentro do período escolhido,
    // e isso não pode sumir dos cards de "já recebido" só porque o
    // contrato em si é de antes do período.
    const listaParaPagamentos = [...lista];

    const { inicio, fim } = calcularIntervaloPeriodo();

    if (inicio) {
        lista = lista.filter(item => item.dataISO && item.dataISO >= inicio);
    }

    if (fim) {
        lista = lista.filter(item => item.dataISO && item.dataISO <= fim);
    }

    carregarTabela(lista);

    atualizarCards(lista, listaParaPagamentos);

    atualizarResumoTela(lista, listaParaPagamentos);

    gerarRankingParceiros(lista);

    gerarRankingClientes(lista);

}

// =====================================================
// LIMPAR
// =====================================================

function limparFiltros(){

    document.getElementById("status").selectedIndex=0;

    document.getElementById("cliente").selectedIndex=0;

    document.getElementById("parceiro").selectedIndex=0;

    document.getElementById("tipoRelatorio").selectedIndex=0;

    document.getElementById("periodo").value = "Todos";

    document.getElementById("dataInicial").value = "";
    document.getElementById("dataFinal").value = "";

    carregarTabela(relatorios);

    atualizarCards(relatorios, relatorios);

    atualizarResumoTela(relatorios, relatorios);

    gerarRankingParceiros(relatorios);

    gerarRankingClientes(relatorios);

}

// =====================================================
// ATUALIZAÇÃO DOS CARDS
// =====================================================

// "lista" define quais contratos entram no Total Emprestado/Saldo em
// Aberto/Clientes/Inadimplentes (respeita o filtro de Período também).
// "listaParaPagamentos" define quais contratos entram no Total Recebido/
// Lucro (Juros)/Comissões Pagas — sem o corte por data do contrato, já
// que quem decide se entra ou não no período ali é a data do PAGAMENTO.
function atualizarCards(lista, listaParaPagamentos){

    listaParaPagamentos = listaParaPagamentos || lista;

    const parceirosCadastrados = JSON.parse(localStorage.getItem("parceirosERP")) || [];

    const { inicio, fim } = calcularIntervaloPeriodo();

    let emprestado = 0;
    let aberto = 0;

    let clientes = new Set();

    let inadimplentes = 0;

    lista.forEach(item=>{

        emprestado += item.valor;

        clientes.add(String(item.cliente || "").trim().toLowerCase());

        // "Saldo em Aberto" é o saldo devedor (principal) ainda em
        // aberto dos contratos não quitados — mesma conta do "Capital em
        // Aberto" do Dashboard, pra sempre baterem entre si.
        if(item.status!=="Quitado"){

            aberto += baseComissaoRelatorio(item.contrato);

        }

        if(item.status==="Atrasado"){

            inadimplentes++;

        }

    });

    // "Total Recebido" e "Lucro (Juros)" vêm do histórico REAL de
    // recebimentos (não de uma estimativa), filtrado pelo período
    // selecionado — assim dá pra comparar julho x agosto só trocando o
    // filtro "Período" (ou usando "Personalizado").
    const pagamentos = pagamentosDoPeriodo(listaParaPagamentos, inicio, fim);

    const recebido = pagamentos.reduce((soma, p) => soma + Number(p.valorRecebido || 0), 0);
    const juros = pagamentos.reduce((soma, p) => soma + Number(p.jurosPago || 0), 0);

    const parceirosAtivos = parceirosCadastrados.filter(p => p.status === "Ativo").length;

    let comissoesPagas = 0;

    listaParaPagamentos.forEach(item => {

        if (!comissaoPagaNoPeriodo(item.contrato, inicio, fim)) return;

        const parceiro = parceirosCadastrados.find(p => nomesIguais(p.nome, item.parceiro));

        if (parceiro) {
            comissoesPagas += comissaoParceiroRelatorio(item.contrato, parceiro);
        }

    });

    const cards = document.querySelectorAll(".cardRelatorio h2");

    if(cards.length >= 8){

        cards[0].innerHTML = formatarMoeda(emprestado);
        cards[1].innerHTML = formatarMoeda(recebido);
        cards[2].innerHTML = formatarMoeda(juros);
        cards[3].innerHTML = formatarMoeda(aberto);
        cards[4].innerHTML = clientes.size;
        cards[5].innerHTML = inadimplentes;
        cards[6].innerHTML = parceirosAtivos;

        cards[7].innerHTML = formatarMoeda(comissoesPagas);

    }

}

// =====================================================
// ATUALIZAÇÃO DO RESUMO
// =====================================================

function atualizarResumoTela(lista, listaParaPagamentos){

    listaParaPagamentos = listaParaPagamentos || lista;

    const parceirosCadastrados = JSON.parse(localStorage.getItem("parceirosERP")) || [];

    const { inicio, fim } = calcularIntervaloPeriodo();

    let emprestado=0;
    let aberto=0;

    let clientes=new Set();

    let inadimplentes=0;

    lista.forEach(item=>{

        emprestado+=item.valor;

        clientes.add(String(item.cliente || "").trim().toLowerCase());

        if(item.status!=="Quitado"){

            aberto += baseComissaoRelatorio(item.contrato);

        }

        if(item.status==="Atrasado"){

            inadimplentes++;

        }

    });

    let comissoesPagas = 0;
    let comissoesPendentes = 0;

    listaParaPagamentos.forEach(item => {

        const parceiro = parceirosCadastrados.find(p => nomesIguais(p.nome, item.parceiro));
        const comissao = parceiro ? comissaoParceiroRelatorio(item.contrato, parceiro) : 0;

        if (comissaoPagaNoPeriodo(item.contrato, inicio, fim)) {
            comissoesPagas += comissao;
        } else if (!comissaoContratoPaga(item.contrato)) {
            comissoesPendentes += comissao;
        }

    });

    const pagamentos = pagamentosDoPeriodo(listaParaPagamentos, inicio, fim);

    const recebido = pagamentos.reduce((soma, p) => soma + Number(p.valorRecebido || 0), 0);
    const juros = pagamentos.reduce((soma, p) => soma + Number(p.jurosPago || 0), 0);

    const parceirosAtivos = parceirosCadastrados.filter(p => p.status === "Ativo").length;

    const linhas=document.querySelectorAll(".linhaResumo strong");

    if(linhas.length>=13){

        linhas[0].innerHTML=formatarMoeda(emprestado);
        linhas[1].innerHTML=formatarMoeda(recebido);
        linhas[2].innerHTML=formatarMoeda(juros);
        linhas[3].innerHTML=formatarMoeda(aberto);

        linhas[4].innerHTML=formatarMoeda(
            lista.length ? emprestado/lista.length : 0
        );

        linhas[5].innerHTML=lista.length;
        linhas[6].innerHTML=lista.filter(x=>x.status==="Quitado").length;
        linhas[7].innerHTML=lista.filter(x=>x.status!=="Quitado").length;
        linhas[8].innerHTML=clientes.size;
        linhas[9].innerHTML=inadimplentes;
        linhas[10].innerHTML=parceirosAtivos;
        linhas[11].innerHTML=formatarMoeda(comissoesPagas);
        linhas[12].innerHTML=formatarMoeda(comissoesPendentes);

    }

}

// =====================================================
// CARREGA CLIENTES
// =====================================================

// Remove duplicatas que só diferem por maiúsculas/minúsculas ou
// espaços nas pontas, mantendo a primeira grafia encontrada.
function nomesUnicos(lista) {

    const vistos = new Map();

    lista.forEach(nome => {

        const chave = String(nome || "").trim().toLowerCase();

        if (chave && !vistos.has(chave)) {
            vistos.set(chave, nome);
        }

    });

    return [...vistos.values()];

}

function carregarClientes(){

    const select=document.getElementById("cliente");

    const clientes = nomesUnicos(relatorios.map(x=>x.cliente));

    clientes.forEach(cliente=>{

        let option=document.createElement("option");

        option.value=cliente;

        option.textContent=cliente;

        select.appendChild(option);

    });

}

// =====================================================
// CARREGA PARCEIROS
// =====================================================

function carregarParceiros(){

    const select=document.getElementById("parceiro");

    const parceiros = nomesUnicos(relatorios.map(x=>x.parceiro));

    parceiros.forEach(parceiro=>{

        let option=document.createElement("option");

        option.value=parceiro;

        option.textContent=parceiro;

        select.appendChild(option);

    });

}

// =====================================================
// RANKING PARCEIROS
// =====================================================

function gerarRankingParceiros(lista){

    const tbody = document.getElementById("rankingParceiros");

    if (!tbody) return;

    const grupos = {};

    lista.forEach(item => {

        if (!item.parceiro || item.parceiro === "-") return;

        // Agrupa por nome normalizado (sem diferenciar maiúsculas/
        // minúsculas ou espaços), mas mantém a primeira grafia vista
        // pra exibir.
        const chave = String(item.parceiro).trim().toLowerCase();

        if (!grupos[chave]) {
            grupos[chave] = { nome: item.parceiro, clientes: new Set(), contratos: 0, valor: 0 };
        }

        grupos[chave].clientes.add(String(item.cliente || "").trim().toLowerCase());
        grupos[chave].contratos++;
        grupos[chave].valor += item.valor;

    });

    const ranking = Object.values(grupos)
        .map(dados => ({
            nome: dados.nome,
            clientes: dados.clientes.size,
            contratos: dados.contratos,
            valor: dados.valor
        }))
        .sort((a, b) => b.valor - a.valor);

    tbody.innerHTML = "";

    ranking.forEach(item => {

        tbody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.clientes}</td>
                <td>${item.contratos}</td>
                <td>${formatarMoeda(item.valor)}</td>
            </tr>
        `;

    });

}

// =====================================================
// TOP CLIENTES
// =====================================================

function gerarRankingClientes(lista){

    const tbody = document.getElementById("rankingClientes");

    if (!tbody) return;

    const grupos = {};

    lista.forEach(item => {

        const chave = String(item.cliente || "").trim().toLowerCase();

        if (!grupos[chave]) {
            grupos[chave] = { nome: item.cliente, contratos: 0, valor: 0 };
        }

        grupos[chave].contratos++;
        grupos[chave].valor += item.valor;

    });

    const ranking = Object.values(grupos)
        .map(dados => ({
            nome: dados.nome,
            contratos: dados.contratos,
            valor: dados.valor
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

    tbody.innerHTML = "";

    ranking.forEach(item => {

        tbody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.contratos}</td>
                <td>${formatarMoeda(item.valor)}</td>
            </tr>
        `;

    });

}

// =====================================================
// GRÁFICOS
// =====================================================

function carregarGraficos(){

    // Reservado para integração futura com uma biblioteca de gráficos.

}

// =====================================================
// EMPRESTADO x JUROS RECEBIDOS POR PERÍODO (MÊS/SEMANA)
// =====================================================

let agrupamentoPeriodoAtual = "mes";

// Chave "aaaa-mm" a partir de uma data "aaaa-mm-dd".
function chaveMes(dataISO) {

    return dataISO.slice(0, 7);

}

// Chave = domingo (início) da semana daquela data, no formato "aaaa-mm-dd".
// Mesma convenção de semana (começando no domingo) usada nos filtros
// de Recebimentos.
function chaveSemana(dataISO) {

    const data = new Date(dataISO + "T00:00:00");

    const domingo = new Date(data);
    domingo.setDate(data.getDate() - data.getDay());

    return domingo.toISOString().split("T")[0];

}

function rotuloPeriodo(chave, agrupamento) {

    if (agrupamento === "semana") {

        const domingo = new Date(chave + "T00:00:00");
        const sabado = new Date(domingo);
        sabado.setDate(domingo.getDate() + 6);

        const formatar = d => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

        return `Semana de ${formatar(domingo)} a ${formatar(sabado)}/${sabado.getFullYear()}`;

    }

    const [ano, mes] = chave.split("-");

    const nomesMes = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return `${nomesMes[Number(mes) - 1]}/${ano}`;

}

function renderizarEmprestadoJurosPorPeriodo(agrupamento) {

    const tbody = document.getElementById("listaEmprestadoJuros");

    if (!tbody) return;

    const chaveDe = agrupamento === "semana" ? chaveSemana : chaveMes;

    const periodos = {};

    function periodoDe(chave) {

        if (!periodos[chave]) {
            periodos[chave] = { emprestado: 0, juros: 0, capital: 0, contratos: 0 };
        }

        return periodos[chave];

    }

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    emprestimos.forEach(emprestimo => {

        if (!emprestimo.dataContrato) return;

        const chave = chaveDe(emprestimo.dataContrato);

        const p = periodoDe(chave);

        p.emprestado += Number(emprestimo.valor || 0);
        p.contratos++;

    });

    const historicoPagamentos = JSON.parse(localStorage.getItem("historicoRecebimentosERP")) || [];

    historicoPagamentos.forEach(pagamento => {

        if (!pagamento.dataPagamento) return;

        const chave = chaveDe(pagamento.dataPagamento);

        const p = periodoDe(chave);

        p.juros += Number(pagamento.jurosPago || 0);
        p.capital += Number(pagamento.amortizacao || 0);

    });

    const chavesOrdenadas = Object.keys(periodos).sort((a, b) => b.localeCompare(a));

    tbody.innerHTML = "";

    if (chavesOrdenadas.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Nenhum dado encontrado.
                </td>
            </tr>
        `;

        atualizarTotaisEmprestadoJuros(0, 0, 0, 0);

        return;

    }

    let totalContratos = 0;
    let totalEmprestado = 0;
    let totalJuros = 0;
    let totalCapital = 0;

    chavesOrdenadas.forEach(chave => {

        const p = periodos[chave];

        totalContratos += p.contratos;
        totalEmprestado += p.emprestado;
        totalJuros += p.juros;
        totalCapital += p.capital;

        tbody.innerHTML += `
            <tr>
                <td>${rotuloPeriodo(chave, agrupamento)}</td>
                <td>${p.contratos}</td>
                <td>${formatarMoeda(p.emprestado)}</td>
                <td>${formatarMoeda(p.juros)}</td>
                <td>${formatarMoeda(p.capital)}</td>
            </tr>
        `;

    });

    atualizarTotaisEmprestadoJuros(totalContratos, totalEmprestado, totalJuros, totalCapital);

}

function atualizarTotaisEmprestadoJuros(contratos, emprestado, juros, capital) {

    const elContratos = document.getElementById("totalEmprestadoJurosContratos");
    const elEmprestado = document.getElementById("totalEmprestadoJurosEmprestado");
    const elJuros = document.getElementById("totalEmprestadoJurosJuros");
    const elCapital = document.getElementById("totalEmprestadoJurosCapital");

    if (elContratos) elContratos.textContent = contratos;
    if (elEmprestado) elEmprestado.textContent = formatarMoeda(emprestado);
    if (elJuros) elJuros.textContent = formatarMoeda(juros);
    if (elCapital) elCapital.textContent = formatarMoeda(capital);

}

function configurarPeriodoEmprestadoJuros() {

    const btnMes = document.getElementById("btnPeriodoMes");
    const btnSemana = document.getElementById("btnPeriodoSemana");

    function selecionar(agrupamento) {

        agrupamentoPeriodoAtual = agrupamento;

        btnMes.classList.toggle("btnAzul", agrupamento === "mes");
        btnMes.classList.toggle("btnCinza", agrupamento !== "mes");

        btnSemana.classList.toggle("btnAzul", agrupamento === "semana");
        btnSemana.classList.toggle("btnCinza", agrupamento !== "semana");

        renderizarEmprestadoJurosPorPeriodo(agrupamento);

    }

    btnMes?.addEventListener("click", () => selecionar("mes"));
    btnSemana?.addEventListener("click", () => selecionar("semana"));

    renderizarEmprestadoJurosPorPeriodo(agrupamentoPeriodoAtual);

}

// =====================================================
// EXPORTAÇÃO
// =====================================================

function exportarExcel(){

    exportarTabelaCSV("listaRelatorios", "relatorio.csv", true);

}

function exportarPDF(){

    alert("Exportação para PDF será implementada.");

}

function imprimirRelatorio(){

    window.print();

}
