function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// ================================
// LOCAL STORAGE
// ================================

function carregar(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvar(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

// ================================
// ID ÚNICO
// ================================

function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ================================
// COMPARAÇÃO DE NOMES
// ================================

// Compara nomes (cliente/parceiro) ignorando maiúsculas/minúsculas e
// espaços nas pontas, já que o mesmo nome pode ter sido digitado com
// grafias diferentes em telas diferentes (cadastro rápido x cadastro completo).
function nomesIguais(a, b) {

    return String(a || "").trim().toLowerCase() ===
        String(b || "").trim().toLowerCase();

}

// Juros do período atual de uma parcela, calculado NA HORA a partir do
// saldo devedor e da taxa — nunca confia no campo "valorJuros" gravado,
// que só é atualizado quando um pagamento é registrado e pode ficar
// desatualizado (ex: se o saldo do empréstimo for corrigido por outro
// caminho). Contratos sem juros (taxa 0%) corretamente somam R$0.
function jurosAtualDaParcela(item) {

    return Number(item.saldoDevedor || 0) * (Number(item.taxaJuros || 0) / 100);

}

// ================================
// COMISSÃO DO PARCEIRO
// ================================

// A comissão do parceiro pode ser definida contrato a contrato (campo
// "Comissão do Parceiro" no cadastro do empréstimo, quantos pontos dos
// juros ficam com o parceiro). Se o contrato não tiver esse valor
// definido (contratos antigos), usa como padrão o % cadastrado no
// parceiro.
function percentualComissaoContrato(emprestimo, parceiro) {

    if (emprestimo.comissaoParceiro != null && emprestimo.comissaoParceiro !== "") {
        return Number(emprestimo.comissaoParceiro) || 0;
    }

    return Number(parceiro?.comissao || 0);

}

// Base sobre a qual a comissão é calculada: o saldo devedor ATUAL do
// contrato (não o valor original). Conforme o cliente vai amortizando
// o empréstimo, a comissão do parceiro sobre aquele contrato também
// diminui, refletindo o que ainda está de fato "em aberto".
function baseComissao(emprestimo) {

    return emprestimo.saldoDevedor != null
        ? Number(emprestimo.saldoDevedor)
        : Number(emprestimo.valor || 0);

}

// Valor da comissão do parceiro sobre um contrato: sempre uma FATIA dos
// juros que o contrato de fato gera (saldo x taxa), nunca mais que isso.
// Sem esse limite, um contrato sem juros (0%) ainda geraria comissão
// pelo % cadastrado no parceiro — o que não faz sentido, já que a
// comissão é "X pontos dos juros", e sem juros não tem o que dividir.
function jurosParceiroContrato(emprestimo, parceiro) {

    const saldo = baseComissao(emprestimo);
    const taxaTotal = Number(emprestimo.juros || 0);
    const jurosTotal = saldo * (taxaTotal / 100);

    const percentual = percentualComissaoContrato(emprestimo, parceiro);
    const bruto = saldo * (percentual / 100);

    return Math.min(bruto, jurosTotal);

}

// Situação da comissão de um contrato:
// - "Pago": já foi dada baixa manualmente (comissaoParceiroPaga)
// - "Atrasado": a data de vencimento do empréstimo já passou e não foi paga
// - "Pendente": ainda não venceu e não foi paga
function situacaoComissao(emprestimo) {

    if (emprestimo.comissaoParceiroPaga) return "Pago";

    const hoje = obterHojeISO();
    const vencimento = emprestimo.primeiroVencimento || emprestimo.dataContrato;

    if (vencimento && vencimento < hoje) return "Atrasado";

    return "Pendente";

}

// ================================
// MOEDA
// ================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// ================================
// DATA
// ================================

function formatarData(data) {

    if (!data) return "";

    return new Date(data).toLocaleDateString("pt-BR");

}

// ================================
// NÚMERO
// ================================

function numero(valor) {

    return Number(valor || 0);

}

// ================================
// CONFIRMAÇÃO
// ================================

function confirmar(mensagem) {

    return confirm(mensagem);

}

/*=========================================
  EXPORTAR TABELA PARA CSV
=========================================*/

function exportarTabelaCSV(idTbody, nomeArquivo, incluirUltimaColuna) {

    const tbody = document.getElementById(idTbody);

    if (!tbody) return;

    const tabela = tbody.closest("table");

    if (!tabela) return;

    function limparCelula(texto) {

        return texto.replace(/\s+/g, " ").trim().replace(/"/g, '""');

    }

    const linhas = [];

    const colunas = Array.from(tabela.querySelectorAll("thead th"));

    // A última coluna normalmente é "Ações" (botões), não faz sentido no
    // CSV — mas algumas tabelas (como a de Relatórios) não têm coluna de
    // Ações, então incluirUltimaColuna=true mantém todas as colunas.
    const totalColunas = (colunas.length > 0 && !incluirUltimaColuna)
        ? colunas.length - 1
        : null;

    const cabecalho = colunas
        .slice(0, totalColunas === null ? undefined : totalColunas)
        .map(th => `"${limparCelula(th.textContent)}"`);

    if (cabecalho.length > 0) {
        linhas.push(cabecalho.join(";"));
    }

    Array.from(tbody.querySelectorAll("tr")).forEach(function (tr) {

        if (tr.style.display === "none") return;

        const celulas = Array.from(tr.children)
            .slice(0, totalColunas === null ? undefined : totalColunas)
            .map(td => `"${limparCelula(td.textContent)}"`);

        if (celulas.length > 0) {
            linhas.push(celulas.join(";"));
        }

    });

    if (linhas.length <= 1) {

        alert("Não há dados para exportar.");
        return;

    }

    const conteudo = "﻿" + linhas.join("\r\n");

    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

}

/*=========================================
  ATUALIZAR STATUS DAS PARCELAS
=========================================*/

// Data de hoje em horário LOCAL, no formato "aaaa-mm-dd". Não usar
// new Date().toISOString() aqui: ela converte para UTC e pode "voltar"
// um dia em fusos negativos (como o do Brasil), fazendo parcelas do dia
// serem tratadas como se fossem do dia seguinte/anterior.
function obterHojeISO() {

    return paraISOLocal(new Date());

}

// Converte um objeto Date para "aaaa-mm-dd" usando os componentes LOCAIS
// (getFullYear/getMonth/getDate), nunca toISOString() (que é em UTC).
function paraISOLocal(data) {

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}

// Quando o vencimento de uma parcela passa e ninguém deu baixa, ela
// continua devendo — mas o mês seguinte também já está gerando juros.
// Por isso, pra cada contrato cuja parcela aberta mais recente já
// venceu, abre a próxima parcela como "Pendente" (mesmo saldo/taxa do
// contrato) SEM tocar na parcela atrasada, que só sai do "Atrasado"
// quando for realmente paga. Roda em loop por contrato pra recuperar o
// atraso mesmo se o sistema ficar dias/meses sem ser aberto.
function gerarParcelasEmAtraso(hojeISO){

    let recebimentos =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];

    const emprestimos =
        JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const contratos = [...new Set(recebimentos.map(r => r.contrato))];

    let houveMudanca = false;

    contratos.forEach(function(contrato){

        const emprestimo = emprestimos.find(e => e.contrato === contrato);

        // Contrato quitado/inativo não gera parcela nova.
        if (emprestimo && emprestimo.status === "Quitado") return;

        // Contratos "Parcelado" já têm todas as parcelas criadas de uma
        // vez no cadastro — não existe "próxima parcela" pra gerar
        // automaticamente quando uma delas atrasa.
        if (emprestimo && emprestimo.tipoJuros === "Parcelado") return;

        const abertas = recebimentos.filter(
            r => r.contrato === contrato && r.status !== "Quitado"
        );

        if (abertas.length === 0) return;

        let maisRecente = abertas.reduce(
            (a, b) => ((a.vencimento || "") > (b.vencimento || "") ? a : b)
        );

        let protecaoLoop = 0;

        while (maisRecente.vencimento && maisRecente.vencimento < hojeISO && protecaoLoop < 24) {

            const data = new Date(maisRecente.vencimento + "T00:00:00");
            data.setMonth(data.getMonth() + 1);

            const saldo = emprestimo ? baseComissao(emprestimo) : Number(maisRecente.saldoDevedor || 0);
            const taxa = emprestimo ? Number(emprestimo.juros || 0) : Number(maisRecente.taxaJuros || 0);

            const novaParcela = {
                id: gerarId(),
                contrato: maisRecente.contrato,
                cliente: maisRecente.cliente,
                parceiro: maisRecente.parceiro,
                vencimento: paraISOLocal(data),
                saldoDevedor: saldo,
                taxaJuros: taxa,
                valorJuros: saldo * (taxa / 100),
                status: "Pendente"
            };

            recebimentos.push(novaParcela);
            houveMudanca = true;

            maisRecente = novaParcela;
            protecaoLoop++;

        }

    });

    if (houveMudanca) {
        localStorage.setItem("recebimentosERP", JSON.stringify(recebimentos));
    }

}

function atualizarStatusRecebimentos(){

    // Comparação por string "aaaa-mm-dd" (não usar new Date(string), que
    // sofre deslocamento de fuso horário e pode marcar uma parcela como
    // atrasada um dia antes ou depois da data real).
    const hojeISO = obterHojeISO();

    gerarParcelasEmAtraso(hojeISO);

    let recebimentos =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];

    recebimentos = recebimentos.map(function(item){

        if(item.status === "Quitado"){
            return item;
        }

        item.status =
            item.vencimento && item.vencimento < hojeISO
                ? "Atrasado"
                : "Pendente";

        return item;

    });

    localStorage.setItem(
        "recebimentosERP",
        JSON.stringify(recebimentos)
    );

}