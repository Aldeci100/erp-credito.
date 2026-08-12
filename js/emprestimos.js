/* ======================================================
   ERP CRÉDITO
   MÓDULO EMPRÉSTIMOS
====================================================== */

let contratoEditando = null;

document.addEventListener("DOMContentLoaded", () => {

    carregarClientesEmprestimo();

carregarParceirosEmprestimo();

renderizarTabelaEmprestimos();

atualizarCardsEmprestimos();

    const modal = document.getElementById("modalEmprestimo");

    const btnNovo = document.querySelector(".btnNovo");
    const btnNovoBarra = document.querySelector(".btnAzul");

    const btnFechar = document.querySelector(".fechar");
    const btnCancelar = document.getElementById("btnCancelarEmprestimo");

    const btnExportar = document.getElementById("btnExportarEmprestimos");
    const btnImprimir = document.getElementById("btnImprimirEmprestimos");

    btnExportar?.addEventListener("click", function () {
        exportarTabelaCSV("listaEmprestimos", "emprestimos.csv");
    });

    btnImprimir?.addEventListener("click", function () {
        window.print();
    });

    const btnComissaoLote = document.getElementById("btnComissaoLote");

    btnComissaoLote?.addEventListener("click", function () {

        let emprestimos = carregar("emprestimosERP");

        const semComissao = emprestimos.filter(
            e => e.parceiro && (e.comissaoParceiro == null || e.comissaoParceiro === "")
        );

        if (semComissao.length === 0) {
            alert("Todos os contratos com parceiro já têm a comissão do parceiro definida.");
            return;
        }

        const entrada = prompt(
            semComissao.length + " contrato(s) com parceiro ainda sem a comissão do parceiro definida.\n\n" +
            "Qual % da comissão do parceiro aplicar a esses contratos?",
            "10"
        );

        if (entrada === null) return;

        const percentual = Number(entrada.replace(",", "."));

        if (isNaN(percentual) || percentual < 0) {
            alert("Percentual inválido.");
            return;
        }

        if (!confirm(
            semComissao.length + " contrato(s) vão receber " + percentual + "% de comissão do parceiro.\n\n" +
            "Contratos que já têm essa comissão definida NÃO serão alterados. Confirmar?"
        )) return;

        emprestimos = emprestimos.map(function (e) {

            if (e.parceiro && (e.comissaoParceiro == null || e.comissaoParceiro === "")) {
                e.comissaoParceiro = percentual;
            }

            return e;

        });

        salvar("emprestimosERP", emprestimos);

        renderizarTabelaEmprestimos();
        atualizarCardsEmprestimos();

        alert(semComissao.length + " contrato(s) atualizados com " + percentual + "% de comissão do parceiro.");

    });

    const pesquisa = document.getElementById("pesquisaEmprestimo");

    const formulario = document.getElementById("formEmprestimo");


    /* ======================================
   CADASTRO RÁPIDO CLIENTE / PARCEIRO
====================================== */


const modalCliente =
document.getElementById("modalCliente");


const modalParceiro =
document.getElementById("modalParceiro");



const btnNovoCliente =
document.getElementById("novoCliente");


const btnNovoParceiro =
document.getElementById("novoParceiro");



const fecharCliente =
document.querySelector(".fecharCliente");


const fecharParceiro =
document.querySelector(".fecharParceiro");



const salvarCliente =
document.getElementById("salvarCliente");


const salvarParceiro =
document.getElementById("salvarParceiro");

salvarCliente?.addEventListener("click", salvarNovoCliente);

salvarParceiro?.addEventListener("click", salvarNovoParceiro);



/* ABRIR CLIENTE */

btnNovoCliente?.addEventListener("click",()=>{

    modalCliente.style.display="flex";

});



/* ABRIR PARCEIRO */

btnNovoParceiro?.addEventListener("click",()=>{

    modalParceiro.style.display="flex";

});



/* FECHAR CLIENTE */

fecharCliente?.addEventListener("click",()=>{

    modalCliente.style.display="none";

});



/* FECHAR PARCEIRO */

fecharParceiro?.addEventListener("click",()=>{

    modalParceiro.style.display="none";

});

    const valor = document.getElementById("valor");
    const juros = document.getElementById("juros");
    const parcelas = document.getElementById("parcelas");

    /* ======================================
       PRÉ-PREENCHER COMISSÃO DO PARCEIRO
       (a partir do % cadastrado no parceiro,
       mas continua editável por contrato)
    ====================================== */

    document.getElementById("parceiro")?.addEventListener("change", function(){

        const campoComissao = document.getElementById("comissaoParceiroEmprestimo");

        if (!campoComissao || campoComissao.value !== "") return;

        const parceiros = carregar("parceirosERP");
        const selecionado = parceiros.find(p => p.nome === this.value);

        if (selecionado && selecionado.comissao) {
            campoComissao.value = selecionado.comissao;
        }

    });

    /* ======================================
       MODAL
    ====================================== */

    function abrirModal() {

        modal.style.display = "flex";

    }

    function fecharModal() {

        modal.style.display = "none";
        formulario.reset();

    }

    btnNovo?.addEventListener("click", abrirModal);

    btnNovoBarra?.addEventListener("click", abrirModal);

    btnFechar?.addEventListener("click", fecharModal);

    btnCancelar?.addEventListener("click", fecharModal);

    window.addEventListener("click", function(e){

        if(e.target === modal){

            fecharModal();

        }

    });

    /* ======================================
       PESQUISA
    ====================================== */

    pesquisa.addEventListener("keyup", function(){

        const texto = this.value.toLowerCase();

        const linhas = document.querySelectorAll("#listaEmprestimos tr");

        linhas.forEach(linha=>{

            linha.style.display =
                linha.innerText.toLowerCase().includes(texto)
                ? ""
                : "none";

        });

    });

    /* ======================================
   SALVAR EMPRÉSTIMO INTEGRADO
====================================== */

formulario.addEventListener("submit", function(e){

    e.preventDefault();


    const dados = obterDados();


    const editando = contratoEditando !== null;



    // ================================
    // CÁLCULO DO EMPRÉSTIMO
    // ================================


    const calculo = calcularJuros(

        dados.valor,

        dados.juros,

        dados.parcelas,

        dados.tipoJuros

    );



    if(editando){

    dados.contrato = contratoEditando;

}else{

    dados.contrato = gerarNumeroContrato();

}

dados.totalReceber = calculo.total;

dados.valorParcela = calculo.parcela;

dados.dataCadastro = new Date()
    .toLocaleDateString("pt-BR");

    if (!editando) {

    dados.saldoDevedor = dados.valor;

    dados.status = "Ativo";

}



    // ================================
    // SALVAR EMPRÉSTIMO
    // ================================


   let emprestimos = carregar("emprestimosERP");

    // Guarda como o contrato estava ANTES da edição, pra saber se os
    // valores que afetam as parcelas (valor, juros, nº de parcelas,
    // periodicidade) realmente mudaram — só nesse caso mexemos nas
    // parcelas geradas. Editar só a data, observação, status etc não
    // deve tocar no histórico de recebimentos.
    let contratoAntesDoEdit = null;

if (editando) {

    const indice = emprestimos.findIndex(function(item){

        return item.contrato === contratoEditando;

    });

    if(indice !== -1){

        contratoAntesDoEdit = emprestimos[indice];

        // MESCLA em vez de substituir: o formulário de edição não tem
        // campos pra saldoDevedor, status, comissaoParceiroPaga etc.
        // Se sobrescrevêssemos o registro inteiro com "dados", esses
        // valores (já calculados a partir dos pagamentos recebidos)
        // seriam apagados (voltariam pra undefined) só por editar
        // qualquer outro campo do contrato.
        dados.dataCadastro = emprestimos[indice].dataCadastro || dados.dataCadastro;

        emprestimos[indice] = Object.assign({}, emprestimos[indice], dados);

    }

} else {

    emprestimos.push(dados);

}

salvar("emprestimosERP", emprestimos);

    const valoresQueAfetamParcelasMudaram = editando && contratoAntesDoEdit && (
        Number(contratoAntesDoEdit.valor) !== Number(dados.valor) ||
        Number(contratoAntesDoEdit.juros) !== Number(dados.juros) ||
        Number(contratoAntesDoEdit.parcelas) !== Number(dados.parcelas) ||
        contratoAntesDoEdit.periodicidade !== dados.periodicidade
    );


renderizarTabelaEmprestimos();



    // ================================
    // GERAR RECEBIMENTOS
    // ================================


    const parcelasGeradas = gerarParcelas(

        dados.primeiroVencimento,

        dados.parcelas,

        dados.periodicidade

    );



    let recebimentos = carregar("recebimentosERP");

    if (!editando && dados.tipoJuros === "Parcelado") {

        // Contrato "Parcelado": em vez de 1 parcela rotativa (juros
        // recalculado sobre o saldo que vai caindo), gera as N parcelas
        // de uma vez, cada uma com o MESMO valor de juros fixo (valor
        // original × taxa) e a mesma amortização (valor / parcelas) —
        // exatamente a conta que já existia em calcularJuros() pro caso
        // "Simples", só que agora de fato virando parcelas reais.
        const numParcelas = Number(dados.parcelas) || 1;
        const jurosFixoPorParcela = dados.valor * (dados.juros / 100);
        const amortizacaoFixaPorParcela = dados.valor / numParcelas;

        let saldoRestante = dados.valor;

        // "Primeiro Vencimento" não é obrigatório no formulário — sem
        // essa proteção, um contrato criado sem preencher esse campo
        // gerava parcelas com data inválida ("NaN/NaN/NaN" na tela).
        // Cai pra "Data do Contrato" e, na falta dela também, pra hoje.
        const primeiroVencimentoValido =
            dados.primeiroVencimento || dados.dataContrato || obterHojeISO();

        let dataVencimento = new Date(primeiroVencimentoValido + "T00:00:00");

        if (isNaN(dataVencimento.getTime())) {
            dataVencimento = new Date(obterHojeISO() + "T00:00:00");
        }

        for (let i = 1; i <= numParcelas; i++) {

            recebimentos.push({

                id: gerarId(),
                contrato: dados.contrato,
                cliente: dados.cliente,
                parceiro: dados.parceiro,
                vencimento: paraISOLocal(dataVencimento),
                saldoDevedor: saldoRestante,
                taxaJuros: dados.juros,
                valorJuros: jurosFixoPorParcela,
                valorParcela: jurosFixoPorParcela + amortizacaoFixaPorParcela,
                tipoJuros: "Parcelado",
                numeroParcela: i,
                totalParcelas: numParcelas,
                status: "Pendente"

            });

            saldoRestante -= amortizacaoFixaPorParcela;

            switch (dados.periodicidade) {

                case "Diário":
                    dataVencimento.setDate(dataVencimento.getDate() + 1);
                    break;

                case "Semanal":
                    dataVencimento.setDate(dataVencimento.getDate() + 7);
                    break;

                case "Quinzenal":
                    dataVencimento.setDate(dataVencimento.getDate() + 15);
                    break;

                default:
                    dataVencimento.setMonth(dataVencimento.getMonth() + 1);

            }

        }

        localStorage.setItem("recebimentosERP", JSON.stringify(recebimentos));

    } else if (!editando) {

        // Contrato novo (modelo rotativo): cria a primeira parcela normalmente.
        // "Primeiro Vencimento" não é obrigatório no formulário — sem essa
        // proteção, um contrato criado sem preencher esse campo gerava
        // parcela com vencimento vazio, que depois some de qualquer tela
        // que filtre por data de vencimento.
        const primeiroVencimentoValido =
            dados.primeiroVencimento || dados.dataContrato || obterHojeISO();

        let dataVencimentoInicial = new Date(primeiroVencimentoValido + "T00:00:00");

        if (isNaN(dataVencimentoInicial.getTime())) {
            dataVencimentoInicial = new Date(obterHojeISO() + "T00:00:00");
        }

        recebimentos.push({

            id: gerarId(),
            contrato: dados.contrato,
            cliente: dados.cliente,
            parceiro: dados.parceiro,
            vencimento: paraISOLocal(dataVencimentoInicial),
            saldoDevedor: dados.saldoDevedor || dados.valor,
            taxaJuros: dados.juros,
            valorJuros: (dados.saldoDevedor || dados.valor) * (dados.juros / 100),
            status: "Pendente"

        });

        localStorage.setItem("recebimentosERP", JSON.stringify(recebimentos));

    } else if (valoresQueAfetamParcelasMudaram) {

        // Editando E o valor/juros/parcelas/periodicidade realmente
        // mudou: atualiza saldo/taxa de TODAS as parcelas em aberto
        // (pode haver mais de uma, se alguma estiver atrasada — nesse
        // caso cada uma continua representando um mês em aberto
        // separado) com os novos números, preservando vencimento e
        // status de cada uma. Não mexe no histórico de parcelas já
        // Quitadas.
        const contratoAtualizado = emprestimos.find(e => e.contrato === dados.contrato);

        const saldoAtual = contratoAtualizado && contratoAtualizado.saldoDevedor != null
            ? contratoAtualizado.saldoDevedor
            : dados.valor;

        const abertasDoContrato = recebimentos.filter(
            item => item.contrato === dados.contrato && item.status !== "Quitado"
        );

        if (abertasDoContrato.length > 0) {

            recebimentos = recebimentos.map(function (item) {

                if (item.contrato === dados.contrato && item.status !== "Quitado") {

                    item.saldoDevedor = saldoAtual;
                    item.taxaJuros = dados.juros;
                    item.valorJuros = saldoAtual * (dados.juros / 100);
                    item.cliente = dados.cliente;
                    item.parceiro = dados.parceiro;

                }

                return item;

            });

        } else {

            const primeiroVencimentoValido =
                dados.primeiroVencimento || dados.dataContrato || obterHojeISO();

            let dataVencimentoNova = new Date(primeiroVencimentoValido + "T00:00:00");

            if (isNaN(dataVencimentoNova.getTime())) {
                dataVencimentoNova = new Date(obterHojeISO() + "T00:00:00");
            }

            recebimentos.push({

                id: gerarId(),
                contrato: dados.contrato,
                cliente: dados.cliente,
                parceiro: dados.parceiro,
                vencimento: paraISOLocal(dataVencimentoNova),
                saldoDevedor: saldoAtual,
                taxaJuros: dados.juros,
                valorJuros: saldoAtual * (dados.juros / 100),
                status: "Pendente"

            });

        }

        localStorage.setItem("recebimentosERP", JSON.stringify(recebimentos));

    }
    // else: editando, mas nada que afeta as parcelas mudou (só data,
    // observação, status etc) — não mexe em recebimentosERP de jeito
    // nenhum, preservando o histórico exatamente como estava.





    // ================================
// ATUALIZAR / GERAR MOVIMENTO CAIXA
// ================================

let caixa = JSON.parse(
    localStorage.getItem("caixaERP")
) || [];


const indiceCaixa = caixa.findIndex(function(item){

    return item.contrato === dados.contrato;

});

if(indiceCaixa !== -1){

    // Atualiza o lançamento existente

    caixa[indiceCaixa].data = dados.dataContrato;
    caixa[indiceCaixa].valor = dados.valor;

}else{

    // Cria o lançamento somente se ele não existir

    caixa.push({

    id: gerarId(),

    contrato: dados.contrato,

    data: dados.dataContrato,

    tipo: "Saída",

    categoria: "Empréstimo",

    cliente: dados.cliente,

    descricao: "Empréstimo concedido",

    valor: dados.valor

});

}

localStorage.setItem(
    "caixaERP",
    JSON.stringify(caixa)
);




    alert(

        "Empréstimo cadastrado e integrado com sucesso!"

    );

    contratoEditando = null;



    fecharModal();



});

    /* ======================================
       EVENTOS DA TABELA
    ====================================== */

    atualizarEventos();

});

/* ======================================================
   DADOS
====================================================== */

function obterDados(){

    return{

        cliente:
            document.getElementById("cliente").value,

        parceiro:
            document.getElementById("parceiro").value,

        valor:
            Number(document.getElementById("valor").value),

        juros:
            Number(document.getElementById("juros").value),

        comissaoParceiro:
            Number(document.getElementById("comissaoParceiroEmprestimo").value) || 0,

        tipoJuros:
            document.getElementById("tipoJuros").value,

        parcelas:
            Number(document.getElementById("parcelas").value),

        periodicidade:
            document.getElementById("periodicidade").value,

        dataContrato:
            document.getElementById("dataContrato").value,

        primeiroVencimento:
            document.getElementById("primeiroVencimento").value,

        status:
            document.getElementById("status").value,

        observacoes:
            document.getElementById("observacoes").value

    };

}

/* ======================================================
   CÁLCULO DOS JUROS
====================================================== */

function calcularJuros(valor, taxa, parcelas, tipo){

    taxa = taxa / 100;

    if(tipo === "Simples"){

        const total = valor + (valor * taxa * parcelas);

        return{

            total: total,

            parcela: total / parcelas

        };

    }

    const total = valor * Math.pow((1 + taxa), parcelas);

    return{

        total: total,

        parcela: total / parcelas

    };

}

/* ======================================================
   GERAÇÃO DAS PARCELAS
====================================================== */

function gerarParcelas(dataInicial, quantidade, periodicidade){

    let parcelas = [];

    let data = new Date(dataInicial);

    for(let i=1;i<=quantidade;i++){

        parcelas.push({

            numero:i,

            vencimento:
                data.toLocaleDateString("pt-BR")

        });

        switch(periodicidade){

            case "Diário":

                data.setDate(data.getDate()+1);

                break;

            case "Semanal":

                data.setDate(data.getDate()+7);

                break;

            case "Quinzenal":

                data.setDate(data.getDate()+15);

                break;

            default:

                data.setMonth(data.getMonth()+1);

        }

    }

    return parcelas;

}

/* ======================================================
   BOTÕES
====================================================== */

function atualizarEventos(){

    document.querySelectorAll(".visualizar").forEach(botao=>{

    botao.onclick = function(){

        const contrato =
            this.closest("tr").dataset.contrato;

        abrirExtrato(contrato);

    };

});

    document.querySelectorAll(".editar").forEach(botao=>{

    botao.onclick = function(){

        const contrato = this.closest("tr").dataset.contrato;

        const emprestimos = JSON.parse(
            localStorage.getItem("emprestimosERP")
        ) || [];

        const emprestimo = emprestimos.find(function(item){

            return item.contrato === contrato;

        });

        if(!emprestimo) return;

        contratoEditando = contrato;

        document.getElementById("cliente").value = emprestimo.cliente;
        document.getElementById("parceiro").value = emprestimo.parceiro;
        document.getElementById("valor").value = emprestimo.valor;
        document.getElementById("juros").value = emprestimo.juros;
        document.getElementById("comissaoParceiroEmprestimo").value = emprestimo.comissaoParceiro || "";
        document.getElementById("tipoJuros").value = emprestimo.tipoJuros;
        document.getElementById("parcelas").value = emprestimo.parcelas;
        document.getElementById("periodicidade").value = emprestimo.periodicidade;
        document.getElementById("dataContrato").value = emprestimo.dataContrato;
        document.getElementById("primeiroVencimento").value = emprestimo.primeiroVencimento;
        document.getElementById("status").value = emprestimo.status;
        document.getElementById("observacoes").value = emprestimo.observacoes;

        document.getElementById("modalEmprestimo").style.display = "flex";

    };

});
document.querySelectorAll(".excluir").forEach(botao=>{

    botao.onclick = function(){

    const contrato = this.closest("tr").dataset.contrato;

    if(!confirm(
        "Deseja realmente excluir o contrato " + contrato + "?\n\n" +
        "Isso também vai apagar as parcelas, o histórico de pagamentos " +
        "e os lançamentos de caixa relacionados a este contrato."
    )){
        return;
    }

    let emprestimos = carregar("emprestimosERP");

    emprestimos = emprestimos.filter(function(item){

        return item.contrato !== contrato;

    });

    salvar("emprestimosERP", emprestimos);

    // Remove também tudo que foi gerado a partir deste contrato, para não
    // deixar parcelas/histórico/caixa "órfãos" apontando pra um contrato
    // que não existe mais.
    let recebimentos = carregar("recebimentosERP");
    recebimentos = recebimentos.filter(item => item.contrato !== contrato);
    salvar("recebimentosERP", recebimentos);

    let historico = carregar("historicoRecebimentosERP");
    historico = historico.filter(item => item.contrato !== contrato);
    salvar("historicoRecebimentosERP", historico);

    let caixa = carregar("caixaERP");
    caixa = caixa.filter(item => item.contrato !== contrato);
    salvar("caixaERP", caixa);

    renderizarTabelaEmprestimos();

    atualizarCardsEmprestimos();

    alert("Contrato e todos os registros relacionados foram excluídos com sucesso.");

};

});
}

/* ======================================================
   UTILIDADES
====================================================== */

function moeda(valor){

    return valor.toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}

function formatarData(data){

    if(!data) return "";

    const partes = data.split("-");

    if(partes.length !== 3){
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}
/* ======================================
   GERAR CONTRATO
====================================== */


// O número do próximo contrato é calculado a partir dos contratos que
// já existem (maior número encontrado + 1), não de um contador
// separado — um contador guardado à parte (como era antes, na chave
// "ultimoContratoERP") não é sincronizado entre computador e celular,
// e cada aparelho passava a gerar números por conta própria, repetindo
// contratos já existentes.
function gerarNumeroContrato(){

    const emprestimos = JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const maiorNumero = emprestimos.reduce(function (maior, item) {

        const numero = parseInt(item.contrato, 10);

        return !isNaN(numero) && numero > maior ? numero : maior;

    }, 0);

    return (maiorNumero + 1)
        .toString()
        .padStart(6, "0");

}

/* ======================================================
   CADASTRO RÁPIDO DE CLIENTE
====================================================== */

function salvarNovoCliente(){

    const nome =
    document.getElementById("nomeCliente").value.trim();

    const cpf =
    document.getElementById("cpfCliente").value.trim();

    const telefone =
    document.getElementById("telefoneCliente").value.trim();

    const endereco =
    document.getElementById("enderecoCliente").value.trim();


    if(nome === ""){

        alert("Informe o nome do cliente.");

        return;

    }


    let clientes = JSON.parse(

        localStorage.getItem("clientesERP")

    ) || [];


    const novoCliente={

        id:Date.now(),

        nome,

        cpf,

        telefone,

        endereco

    };


    clientes.push(novoCliente);


    localStorage.setItem(

        "clientesERP",

        JSON.stringify(clientes)

    );


    atualizarSelectClientes(

        novoCliente.nome

    );

    document.getElementById("cliente").value =
novoCliente.nome;


    document.getElementById("modalCliente").style.display="none";


    document.getElementById("nomeCliente").value="";

    document.getElementById("cpfCliente").value="";

    document.getElementById("telefoneCliente").value="";

    document.getElementById("enderecoCliente").value="";


    alert("Cliente cadastrado com sucesso!");

}

function salvarNovoParceiro(){

    const nome =
    document.getElementById("nomeParceiro").value.trim();

    const documento =
    document.getElementById("documentoParceiro").value.trim();

    const telefone =
    document.getElementById("telefoneParceiro").value.trim();

    const capital =
    Number(document.getElementById("capitalParceiro").value) || 0;

    const comissao =
    Number(document.getElementById("comissaoParceiroRapido").value) || 0;

    if(nome===""){

        alert("Informe o nome do parceiro.");

        return;

    }

    let parceiros = JSON.parse(

        localStorage.getItem("parceirosERP")

    ) || [];

    // Evita criar um parceiro duplicado se já existir um com esse nome
    // (ignorando maiúsculas/minúsculas e espaços) — só seleciona o existente.
    const parceiroExistente = parceiros.find(p => nomesIguais(p.nome, nome));

    if (parceiroExistente) {

        atualizarSelectParceiros(parceiroExistente.nome);

        document.getElementById("parceiro").value = parceiroExistente.nome;

        document.getElementById("modalParceiro").style.display = "none";

        document.getElementById("nomeParceiro").value = "";
        document.getElementById("documentoParceiro").value = "";
        document.getElementById("telefoneParceiro").value = "";
        document.getElementById("capitalParceiro").value = "";
        document.getElementById("comissaoParceiroRapido").value = "";

        alert("Já existe um parceiro com esse nome. Selecionei o parceiro existente.");

        return;

    }

    // Mesmo esquema usado no cadastro completo (pages/parceiros.html),
    // para que a tela de Parceiros e o extrato funcionem normalmente
    // com parceiros criados aqui pelo cadastro rápido.
    const novoParceiro={

        id:gerarId(),

        nome,

        cpfCnpj: documento,

        telefone,

        whatsapp: "",

        email: "",

        comissao,

        banco: "",

        agencia: "",

        conta: "",

        pix: "",

        status: "Ativo",

        observacao: "",

        capital

    };

    parceiros.push(novoParceiro);

    localStorage.setItem(

        "parceirosERP",

        JSON.stringify(parceiros)

    );

    atualizarSelectParceiros(nome);

    document.getElementById("parceiro").value=nome;

    document.getElementById("modalParceiro").style.display="none";

    document.getElementById("nomeParceiro").value="";
    document.getElementById("documentoParceiro").value="";
    document.getElementById("telefoneParceiro").value="";
    document.getElementById("capitalParceiro").value="";
    document.getElementById("comissaoParceiroRapido").value="";

    alert("Parceiro cadastrado com sucesso!");

}



function atualizarSelectClientes(clienteSelecionado=""){


    const select =

    document.getElementById("cliente");


    let clientes = JSON.parse(

        localStorage.getItem("clientesERP")

    ) || [];


    select.innerHTML="";


    const primeiraOpcao=document.createElement("option");

    primeiraOpcao.value="";

    primeiraOpcao.textContent="Selecione...";

    select.appendChild(primeiraOpcao);


    clientes.forEach(cliente=>{


        const option=document.createElement("option");


        option.value=cliente.nome;

        option.textContent=cliente.nome;


        if(cliente.nome===clienteSelecionado){

            option.selected=true;

        }


        select.appendChild(option);


    });


}

 function atualizarSelectParceiros(parceiroSelecionado=""){

    const select =
    document.getElementById("parceiro");

    let parceiros = JSON.parse(

        localStorage.getItem("parceirosERP")

    ) || [];

    select.innerHTML="";

    const primeira=document.createElement("option");

    primeira.value="";

    primeira.textContent="Selecione...";

    select.appendChild(primeira);

    parceiros.forEach(parceiro=>{

        const option=document.createElement("option");

        option.value=parceiro.nome;

        option.textContent=parceiro.nome;

        if(parceiro.nome===parceiroSelecionado){

            option.selected=true;

        }

        select.appendChild(option);

    });

}
function carregarClientesEmprestimo(){

    const select =
    document.getElementById("cliente");


    const clientes = carregar("clientesERP");

    select.innerHTML =
    '<option value="">Selecione...</option>';


    clientes.forEach(cliente=>{


        const option =
        document.createElement("option");


        option.value =
        cliente.nome;


        option.textContent =
        cliente.nome;


        select.appendChild(option);


    });


}
function carregarParceirosEmprestimo(){

    const select =
    document.getElementById("parceiro");


    const parceiros =
    JSON.parse(
        localStorage.getItem("parceirosERP")
    ) || [];


    select.innerHTML =
    '<option value="">Selecione...</option>';



    parceiros.forEach(parceiro=>{


        const option =
        document.createElement("option");


        option.value =
        parceiro.nome;


        option.textContent =
        parceiro.nome;


        select.appendChild(option);


    });


}
function renderizarTabelaEmprestimos(){

    const tbody = document.getElementById("listaEmprestimos");

    if(!tbody) return;

    let emprestimos = JSON.parse(
        localStorage.getItem("emprestimosERP")
    ) || [];

    tbody.innerHTML = "";

    emprestimos.forEach(emprestimo=>{

        const tr = document.createElement("tr");

        tr.dataset.contrato = emprestimo.contrato;

        let classeStatus = "ativo";

switch (emprestimo.status) {

    case "Quitado":
        classeStatus = "quitado";
        break;

    case "Finalizado":
        classeStatus = "quitado";
        break;

    case "Em Atraso":
        classeStatus = "atraso";
        break;

    case "Renegociado":
        classeStatus = "renegociado";
        break;

    case "Cancelado":
        classeStatus = "cancelado";
        break;

    default:
        classeStatus = "ativo";
        break;
}

        tr.innerHTML = `

            <td>${emprestimo.contrato}</td>

            <td>${formatarData(emprestimo.dataContrato)}</td>

            <td>${emprestimo.cliente}</td>

            <td>${emprestimo.parceiro}</td>

            <td>${moeda(emprestimo.valor)}</td>

            <td>${moeda(emprestimo.saldoDevedor != null ? emprestimo.saldoDevedor : emprestimo.valor)}</td>

            <td>${emprestimo.juros}%</td>

            <td>${formatarData(emprestimo.primeiroVencimento)}</td>

            <td>

                <span class="status ${classeStatus}">
                    ${emprestimo.status}
                </span>

            </td>

            <td>

                <button class="acao visualizar" title="Visualizar Contrato">
                <i class="fa-solid fa-eye"></i>
</button>

<button class="acao editar" title="Editar Contrato">
    <i class="fa-solid fa-pen"></i>
</button>

<button class="acao excluir" title="Excluir Contrato">
    <i class="fa-solid fa-trash"></i>
</button>

            </td>

        `;

        tbody.appendChild(tr);

    });

    atualizarEventos();

    }

    function atualizarCardsEmprestimos(){

        const emprestimos = JSON.parse(
            localStorage.getItem("emprestimosERP")
        ) || [];

        let totalEmprestado = 0;
        let contratosAtivos = 0;
        let contratosAtraso = 0;
        let valorReceber = 0;

        emprestimos.forEach(function(emprestimo){

            const valor = Number(
                emprestimo.saldoDevedor != null ? emprestimo.saldoDevedor : (emprestimo.valor || 0)
            );

            totalEmprestado += valor;

            switch(emprestimo.status){

                case "Ativo":
                    contratosAtivos++;
                    valorReceber += valor;
                    break;

                case "Em Atraso":
                    contratosAtraso++;
                    valorReceber += valor;
                    break;

            }

        });

        const total = document.getElementById("cardTotalEmprestado");
        const ativos = document.getElementById("cardContratosAtivos");
        const atraso = document.getElementById("cardContratosAtraso");
        const receber = document.getElementById("cardValorReceber");

        if(total) total.textContent = moeda(totalEmprestado);

        if(ativos) ativos.textContent = contratosAtivos;

        if(atraso) atraso.textContent = contratosAtraso;

        if(receber) receber.textContent = moeda(valorReceber);
        
    }
function abrirExtrato(contrato){

    window.location.href =
        "recebimentos.html?contrato=" + contrato;

}