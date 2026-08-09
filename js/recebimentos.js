/* ======================================================
   ERP CRÉDITO
   MÓDULO RECEBIMENTOS
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("RECEBIMENTOS.JS CARREGADO");
    const modal = document.getElementById("modalRecebimento");
    const btnNovo = document.querySelector(".btnNovo");
    const btnFechar = document.querySelector(".fechar");
    const btnCancelar = document.getElementById("btnCancelarRecebimento");
    const formulario = document.getElementById("formRecebimento");
    const pesquisa = document.getElementById("pesquisaRecebimento");
    const valorOriginal = document.getElementById("valorOriginal");
    const multa = document.getElementById("multa");
    const juros = document.getElementById("juros");
    const desconto = document.getElementById("desconto");
    const valorRecebido = document.getElementById("valorRecebido");
    const amortizacao = document.getElementById("amortizacao");
    const novoSaldo = document.getElementById("novoSaldo");


    /*=========================================
      MODAL
    =========================================*/

    function abrirModal() {
        modal.style.display = "flex";
    }

    function fecharModal() {
        modal.style.display = "none";
        formulario.reset();
        atualizarValorFinal();
    }

    btnNovo?.addEventListener("click", abrirModal);
    btnFechar?.addEventListener("click", fecharModal);
    btnCancelar?.addEventListener("click", fecharModal);

    window.addEventListener("click", (e) => {

        if (e.target === modal) {
            fecharModal();
        }

    });
function atualizarValorFinal() {

    const valor = Number(valorOriginal.value) || 0;
    const valorMulta = Number(multa.value) || 0;
    const valorJuros = Number(juros.value) || 0;
    const valorDesconto = Number(desconto.value) || 0;

    const total = valor + valorMulta + valorJuros - valorDesconto;

    if (valorRecebido) {
        valorRecebido.value = total.toFixed(2);
    }

}
    /*=========================================
      PESQUISA
    =========================================*/

    pesquisa.addEventListener("keyup", function () {

        const texto = this.value.toLowerCase();

        document.querySelectorAll("#listaRecebimentos tr")
            .forEach(linha => {

                if (texto === "") {

                    // Sem pesquisa: volta ao estado normal (parcelas
                    // agrupadas continuam ocultas até o usuário expandir).
                    linha.style.display =
                        linha.classList.contains("linha-oculta")
                            ? "none"
                            : "";

                    return;

                }

                linha.style.display =
                    linha.innerText.toLowerCase().includes(texto)
                        ? ""
                        : "none";

            });

    });

    

const btnTodos = document.getElementById("btnTodos");
const btnQuitados = document.getElementById("btnQuitados");
const btnAtraso = document.getElementById("btnAtraso");
const btnHoje = document.getElementById("btnHoje");
const btnSemana = document.getElementById("btnSemana");
const btnMes = document.getElementById("btnMes");

// Permite abrir a tela já com um filtro aplicado via URL,
// ex: recebimentos.html?filtro=atrasados (usado pelos cards do Dashboard)
// ou recebimentos.html?contrato=000001 (usado pelo "Visualizar Contrato"
// em Empréstimos, pra mostrar o histórico de parcelas daquele contrato).
const filtrosValidos = ["todos", "quitados", "atrasados", "hoje", "semana", "mes"];
const parametrosURL = new URLSearchParams(location.search);
const filtroParametro = parametrosURL.get("filtro");

window.filtroAtual = filtrosValidos.includes(filtroParametro)
    ? filtroParametro
    : "todos";

window.contratoFiltro = parametrosURL.get("contrato") || null;

const avisoContrato = document.getElementById("avisoFiltroContrato");

if (window.contratoFiltro && avisoContrato) {

    avisoContrato.style.display = "flex";

    document.getElementById("avisoFiltroContratoTexto").textContent =
        "Mostrando o histórico de parcelas do contrato " + window.contratoFiltro + ".";

    document.getElementById("btnLimparFiltroContrato")?.addEventListener("click", function () {

        window.contratoFiltro = null;
        avisoContrato.style.display = "none";

        history.replaceState(null, "", location.pathname);

        carregarRecebimentos();

    });

}

carregarRecebimentos();

atualizarBotoesFiltro();
console.log("btnTodos:", btnTodos);
console.log("btnQuitados:", btnQuitados);
console.log("btnAtraso:", btnAtraso);
btnTodos?.addEventListener("click", function () {
    window.filtroAtual = "todos";
    carregarRecebimentos();
    atualizarBotoesFiltro();
});
btnQuitados?.addEventListener("click", function () {

    window.filtroAtual = "quitados";
    carregarRecebimentos(); 
    atualizarBotoesFiltro()
});

btnAtraso?.addEventListener("click", function () {

    window.filtroAtual = "atrasados";
    carregarRecebimentos();
    atualizarBotoesFiltro()

});
btnHoje?.addEventListener("click", function () {

    window.filtroAtual = "hoje";
    carregarRecebimentos();
    atualizarBotoesFiltro()

});

btnSemana?.addEventListener("click", function () {

    window.filtroAtual = "semana";
    carregarRecebimentos();
    atualizarBotoesFiltro()

});

btnMes?.addEventListener("click", function () {

    window.filtroAtual = "mes";
    carregarRecebimentos();
    atualizarBotoesFiltro()

});

function atualizarBotoesFiltro() {

    const botoes = [
        btnHoje,
        btnSemana,
        btnMes,
        btnAtraso,
        btnQuitados,
        btnTodos
    ];

    botoes.forEach(btn => {

        if (!btn) return;

        btn.classList.remove("btnAzul");
        btn.classList.remove("btnVerde");
        btn.classList.add("btnCinza");

    });

    switch (window.filtroAtual) {

        case "hoje":
    btnHoje.classList.remove("btnCinza");
    btnHoje.classList.add("btnAzul");
    break;

        case "semana":
            btnSemana.classList.remove("btnCinza");
            btnSemana.classList.add("btnAzul");
            break;

        case "mes":
            btnMes.classList.remove("btnCinza");
            btnMes.classList.add("btnAzul");
            break;

        case "atrasados":
            btnAtraso.classList.remove("btnCinza");
            btnAtraso.classList.add("btnAzul");
            break;

        case "quitados":
            btnQuitados.classList.remove("btnCinza");
            btnQuitados.classList.add("btnAzul");
            break;

        default:
            btnTodos.classList.remove("btnCinza");
            btnTodos.classList.add("btnAzul");
            break;

    }

}


    function calcularAmortizacao() {

    const saldo = Number(valorOriginal.value) || 0;

    const jurosMes = Number(juros.value) || 0;

    const recebido = Number(valorRecebido.value) || 0;

    let valorAmortizado = recebido - jurosMes;

    if (valorAmortizado < 0) {

        valorAmortizado = 0;

    }

    let saldoAtualizado = saldo - valorAmortizado;

    if (saldoAtualizado < 0) {

        saldoAtualizado = 0;

    }

    if (amortizacao) {

        amortizacao.value = valorAmortizado.toFixed(2);

    }

    if (novoSaldo) {

        novoSaldo.value = saldoAtualizado.toFixed(2);

    }

}

        valorRecebido.addEventListener("input", atualizarResumoPagamento);

    /*=========================================
      RECEBER PARCELA
    =========================================*/

    function atualizarResumoPagamento() {

    const saldo = Number(valorOriginal.value) || 0;

    const jurosMes = Number(juros.value) || 0;

    const recebido = Number(valorRecebido.value) || 0;

    let amortizar = recebido - jurosMes;

    if (amortizar < 0) {

        amortizar = 0;

    }

    let saldoRestante = saldo - amortizar;

    if (saldoRestante < 0) {

        saldoRestante = 0;

    }

    amortizacao.value = amortizar.toFixed(2);

    novoSaldo.value = saldoRestante.toFixed(2);

}

    formulario.addEventListener("submit", function (e) {

    e.preventDefault();

    const contrato = document.getElementById("contrato").value;
    const parcelaId = document.getElementById("parcelaId").value;

    const novoSaldoCalculado = Number(novoSaldo.value) || 0;
    const valorPago = Number(valorRecebido.value) || 0;

const jurosPagos = Number(juros.value) || 0;

const valorAmortizado = Number(amortizacao.value) || 0;

const dataPagamento = document.getElementById("dataPagamento").value || obterHojeISO();

    let recebimentos =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];
        let historico =
    JSON.parse(localStorage.getItem("historicoRecebimentosERP")) || [];

    let novaParcela = null;

    recebimentos = recebimentos.map(function(item){

        // Localiza exatamente a parcela recebida pelo id. Registros antigos
        // sem id (dados anteriores a esta correção) caem no fallback por
        // contrato, mas nunca tocam em parcelas já quitadas do histórico.
        const ehParcelaRecebida = parcelaId
            ? String(item.id) === parcelaId
            : item.contrato === contrato && item.status !== "Quitado";

        if(ehParcelaRecebida){

    const idNovaParcela = novoSaldoCalculado > 0 ? gerarId() : null;

    historico.push({

        id: gerarId(),
        parcelaId: item.id,
        novaParcelaId: idNovaParcela,
        contrato: item.contrato,
        cliente: item.cliente,
        parceiro: item.parceiro,
        dataPagamento: dataPagamento,
        valorRecebido: valorPago,
        jurosPago: jurosPagos,
        amortizacao: valorAmortizado,
        saldoAnterior: item.saldoDevedor,
        saldoAtual: novoSaldoCalculado,
        vencimentoAnterior: item.vencimento,
        statusAnterior: item.status

    });

            item.saldoDevedor = novoSaldoCalculado;

            const taxa = Number(item.taxaJuros) || 0;

            // Contratos "Parcelado" têm juros fixo por parcela — o valor
            // já gravado é o registro histórico correto do que foi
            // cobrado nessa parcela, não recalcula sobre o saldo.
            if (item.tipoJuros !== "Parcelado") {
                item.valorJuros =
                    novoSaldoCalculado * (taxa / 100);
            }

            // A parcela que acabou de receber o pagamento sempre fica quitada;
            // se ainda houver saldo devedor do contrato, uma nova parcela
            // "Pendente" é gerada abaixo para o próximo vencimento — exceto
            // em contratos "Parcelado", onde todas as parcelas já foram
            // criadas de uma vez no cadastro do contrato, não há "próxima"
            // pra gerar.
            item.status = "Quitado";

                   if (novoSaldoCalculado > 0 && item.tipoJuros !== "Parcelado") {

    const data = new Date(item.vencimento + "T00:00:00");

    data.setMonth(data.getMonth() + 1);

    novaParcela = {

        id: idNovaParcela,
        contrato: item.contrato,
        cliente: item.cliente,
        parceiro: item.parceiro,
        vencimento: data.toISOString().split("T")[0],
        saldoDevedor: novoSaldoCalculado,
        taxaJuros: taxa,
        valorJuros: novoSaldoCalculado * (taxa / 100),
        status: "Pendente"

    };

}

        }

        return item;

    });

    if (novaParcela) {

    // Se o contrato já tinha outra parcela aberta cobrindo esse próximo
    // período (por exemplo, gerada automaticamente enquanto essa aqui
    // estava atrasada), não duplica — a parcela seguinte já existe.
    const jaExisteProximaParcela = recebimentos.some(function (r) {

        return r.contrato === novaParcela.contrato &&
            r.status !== "Quitado" &&
            r.vencimento >= novaParcela.vencimento;

    });

    if (!jaExisteProximaParcela) {
        recebimentos.push(novaParcela);
    }

}

localStorage.setItem(
    "historicoRecebimentosERP",
    JSON.stringify(historico)
);

localStorage.setItem(
    "recebimentosERP",
    JSON.stringify(recebimentos)
);
    let emprestimos =
    JSON.parse(localStorage.getItem("emprestimosERP")) || [];

const emprestimoAntes = emprestimos.find(e => e.contrato === contrato);

if (emprestimoAntes) {

    const ultimoHistorico = historico[historico.length - 1];

    if (ultimoHistorico && ultimoHistorico.contrato === contrato) {

        ultimoHistorico.saldoDevedorEmprestimoAnterior = emprestimoAntes.saldoDevedor;
        ultimoHistorico.primeiroVencimentoAnterior = emprestimoAntes.primeiroVencimento;
        ultimoHistorico.statusEmprestimoAnterior = emprestimoAntes.status;

        localStorage.setItem(
            "historicoRecebimentosERP",
            JSON.stringify(historico)
        );

    }

}

emprestimos = emprestimos.map(function(item){

    if(item.contrato === contrato){

    item.saldoDevedor = novoSaldoCalculado;

    const parcelaPendente = recebimentos.find(
        r => r.contrato === contrato && r.status !== "Quitado"
    );

    if (parcelaPendente) {
        item.primeiroVencimento = parcelaPendente.vencimento;
    }

    // O contrato só é considerado finalizado quando o saldo devedor
    // é totalmente quitado; a parcela em si já foi marcada como
    // "Quitado" acima, mas o status do contrato usa um rótulo próprio.
    if(novoSaldoCalculado <= 0){

        item.status = "Finalizado";

    }

}

    return item;

});

localStorage.setItem(
    "emprestimosERP",
    JSON.stringify(emprestimos)
);

    carregarRecebimentos();

    alert("Recebimento registrado com sucesso.");

    fecharModal();

});

    /*=========================================
      EXPANDIR / RECOLHER PARCELAS DO CONTRATO
    =========================================*/

    document.addEventListener("click", function (e) {

        const botao = e.target.closest(".toggle-grupo");

        if (!botao) return;

        const grupo = botao.dataset.grupo;

        const linhasDoGrupo = document.querySelectorAll(
            `#listaRecebimentos tr[data-grupo="${grupo}"]`
        );

        if (linhasDoGrupo.length === 0) return;

        const expandido = linhasDoGrupo[0].style.display !== "none";

        linhasDoGrupo.forEach(function (linha) {

            linha.style.display = expandido ? "none" : "";

        });

        const icone = botao.querySelector("i");

        if (icone) {

            icone.classList.toggle("fa-chevron-right", expandido);
            icone.classList.toggle("fa-chevron-down", !expandido);

        }

    });

    /*=========================================
      BOTÕES DA TABELA
    =========================================*/

    document.addEventListener("click", function(e){

    const botao = e.target.closest(".receber");

    if(!botao) return;

    const linha = botao.closest("tr");

    const contratoSelecionado = linha.dataset.contrato;
    const idSelecionado = linha.dataset.id;

    document.getElementById("contrato").value = contratoSelecionado;
    document.getElementById("parcelaId").value = idSelecionado || "";

    document.getElementById("cliente").value =
        linha.cells[1].innerText;

    // Busca a data real (yyyy-mm-dd) da parcela no armazenamento, já que o
    // texto da tabela vem formatado (dd/mm/aaaa) e não serve para um
    // <input type="date">.
    const recebimentosAtuais =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];

    const parcelaSelecionada = idSelecionado
        ? recebimentosAtuais.find(r => String(r.id) === idSelecionado)
        : recebimentosAtuais.find(r => r.contrato === contratoSelecionado);

    document.getElementById("vencimento").value =
        parcelaSelecionada?.vencimento || "";

    document.getElementById("dataPagamento").value = obterHojeISO();

    valorOriginal.value =
        converterNumero(linha.cells[4].innerText);

    juros.value =
        converterNumero(linha.cells[5].innerText);

    valorRecebido.value = "";

    if(amortizacao) amortizacao.value = "";

    if(novoSaldo) novoSaldo.value = "";

    abrirModal();

});

    /*=========================================
      EXCLUIR RECEBIMENTO
    =========================================*/

    document.addEventListener("click", function (e) {

        const botao = e.target.closest(".excluir");

        if (!botao) return;

        const linha = botao.closest("tr");
        const id = linha.dataset.id;
        const contrato = linha.dataset.contrato;

        excluirRecebimento(id, contrato);

    });

    document.addEventListener("click", function (e) {

    const botao = e.target.closest(".visualizar");

    if (!botao) return;

    const linha = botao.closest("tr");

    const contrato = linha.dataset.contrato;
    const id = linha.dataset.id;

    const recebimentos =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];

    const emprestimos =
        JSON.parse(localStorage.getItem("emprestimosERP")) || [];

    const recebimento = id
        ? recebimentos.find(r => String(r.id) === id)
        : recebimentos.find(r => r.contrato === contrato);

    const emprestimo =
        emprestimos.find(e => e.contrato === contrato);

    if (!recebimento) return;

    document.getElementById("extTitulo").textContent =
        "Extrato do Contrato " + recebimento.contrato;

    document.getElementById("extContrato").textContent =
        recebimento.contrato;

    document.getElementById("extCliente").textContent =
        recebimento.cliente;

    document.getElementById("extParceiro").textContent =
        recebimento.parceiro;

        document.getElementById("extDataEmprestimo").textContent =
    formatarData(emprestimo.dataContrato);

    document.getElementById("extValor").textContent =
        moeda(Number(emprestimo?.valor || 0));

    document.getElementById("extSaldo").textContent =
        moeda(Number(recebimento.saldoDevedor));

    document.getElementById("extJuros").textContent =
        recebimento.taxaJuros + "%";

    document.getElementById("extVencimento").textContent =
    formatarData(recebimento.vencimento);

    const status = document.getElementById("extStatus");

status.innerHTML = `
    <span class="status ${
        recebimento.status === "Quitado"
            ? "pago"
            : "aberto"
    }">
        ${recebimento.status}
    </span>
`;

        document.getElementById("extObservacoes").textContent =
            (emprestimo && emprestimo.observacoes) ? emprestimo.observacoes : "-";

        let historico =
    JSON.parse(localStorage.getItem("historicoRecebimentosERP")) || [];

// Registros antigos podem estar sem "id" (undefined em todos) ou com
// "id" duplicado entre si (lançados em lote, rápido demais, e o gerador
// de id bateu duas vezes no mesmo número) — nos dois casos, editar a
// data de UM pagamento acabava editando TODOS que compartilhavam aquele
// id, em qualquer contrato. Aqui a gente garante que cada linha do
// histórico tem um id realmente único antes de deixar editar, e já
// salva a correção.
let precisaSalvarIds = false;
const idsVistos = new Set();

historico = historico.map(function (item) {

    let id = item.id;

    if (id == null || id === "" || idsVistos.has(String(id))) {

        do {
            id = gerarId();
        } while (idsVistos.has(String(id)));

        precisaSalvarIds = true;

    }

    idsVistos.add(String(id));

    return id === item.id ? item : Object.assign({}, item, { id });

});

if (precisaSalvarIds) {
    localStorage.setItem("historicoRecebimentosERP", JSON.stringify(historico));
}

const tbody =
    document.getElementById("tbodyHistorico");

tbody.innerHTML = "";

const pagamentos = historico.filter(item =>
    item.contrato === contrato
);

pagamentos.sort((a, b) => {

    return new Date(b.dataPagamento) -
           new Date(a.dataPagamento);

});
const totalRecebido = pagamentos.reduce(
    (total, item) => total + Number(item.valorRecebido || 0),
    0
);

const totalJuros = pagamentos.reduce(
    (total, item) => total + Number(item.jurosPago || 0),
    0
);

const totalAmortizado = pagamentos.reduce(
    (total, item) => total + Number(item.amortizacao || 0),
    0
);

document.getElementById("extTotalRecebido").textContent =
    moeda(totalRecebido);

document.getElementById("extTotalJuros").textContent =
    moeda(totalJuros);

document.getElementById("extTotalAmortizado").textContent =
    moeda(totalAmortizado);

if (pagamentos.length === 0) {

    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;">
                Nenhum pagamento registrado.
            </td>
        </tr>
    `;

} else {

    pagamentos.forEach(function(item){

        tbody.innerHTML += `
            <tr data-historico-id="${item.id}">

                <td>
                    <input
                        type="date"
                        class="input-data-pagamento"
                        value="${item.dataPagamento || ''}"
                        title="Clique para corrigir a data em que esse pagamento foi realmente recebido"
                        style="border:1px solid #d1d5db; border-radius:6px; padding:4px 6px; font:inherit;">
                </td>

                <td>${moeda(Number(item.valorRecebido))}</td>

                <td>${moeda(Number(item.jurosPago))}</td>

                <td>${moeda(Number(item.amortizacao))}</td>

                <td>${moeda(Number(item.saldoAtual))}</td>

            </tr>
        `;

    });

}

    document.getElementById("modalExtrato").style.display = "flex";

});

document.getElementById("fecharExtrato")
    .addEventListener("click", function () {

        document.getElementById("modalExtrato").style.display = "none";

});

document.getElementById("btnFecharExtrato")
    .addEventListener("click", function () {

        document.getElementById("modalExtrato").style.display = "none";

});

    /*=========================================
      CORRIGIR DATA DE UM PAGAMENTO JÁ REGISTRADO
      (histórico antigo lançado tudo com a data de hoje,
      por exemplo, precisa poder ser corrigido pra data real)
    =========================================*/

    document.addEventListener("change", function (e) {

        const input = e.target.closest(".input-data-pagamento");

        if (!input) return;

        const linha = input.closest("tr");
        const historicoId = linha.dataset.historicoId;

        if (!input.value) return;

        let historico =
            JSON.parse(localStorage.getItem("historicoRecebimentosERP")) || [];

        historico = historico.map(function (item) {

            if (String(item.id) === historicoId) {
                return Object.assign({}, item, { dataPagamento: input.value });
            }

            return item;

        });

        localStorage.setItem(
            "historicoRecebimentosERP",
            JSON.stringify(historico)
        );

        input.style.borderColor = "#16a34a";

    });

});

/*=========================================
  CONVERTER MOEDA
=========================================*/

function converterNumero(texto) {

    return Number(

        texto
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()

    );

}


/*=========================================
  FORMATAR MOEDA
=========================================*/

function moeda(valor) {

    return valor.toLocaleString("pt-BR", {

        style: "currency",
        currency: "BRL"

    });

}

/*=========================================
  CÁLCULO DE MULTA
=========================================*/

function calcularMulta(valor, percentual) {

    return (valor * percentual) / 100;

}

/*=========================================
  CÁLCULO DE JUROS
=========================================*/

function calcularJuros(valor, percentual, dias) {

    return valor * (percentual / 100) * dias;

}

/*=========================================
  PAGAMENTO PARCIAL
=========================================*/

function calcularPagamentoParcial(total, pago) {

    return total - pago;

}

/*=========================================
  INTEGRAÇÃO FUTURA
=========================================*/

function atualizarDashboard() {

    console.log("Dashboard atualizado.");

}

function atualizarCaixa() {

    console.log("Caixa atualizado.");

}

function atualizarEmprestimo() {

    console.log("Empréstimo atualizado.");

}

function registrarComissao() {

    console.log("Comissão registrada.");

}
function passaNoFiltroRecebimento(item) {

    switch (window.filtroAtual) {

        case "quitados":
            return item.status === "Quitado";

        case "atrasados":
            return item.status === "Atrasado";

        case "hoje": {

            return item.vencimento === obterHojeISO();

        }

        case "semana": {

            // "T00:00:00" (sem "Z") força interpretação em horário local,
            // evitando o deslocamento de fuso de new Date("aaaa-mm-dd").
            const hoje = new Date(obterHojeISO() + "T00:00:00");

            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());

            const fimSemana = new Date(inicioSemana);
            fimSemana.setDate(inicioSemana.getDate() + 6);

            const inicioISO = paraISOLocal(inicioSemana);
            const fimISO = paraISOLocal(fimSemana);

            return item.vencimento >= inicioISO && item.vencimento <= fimISO;

        }

        case "mes": {

            const mesAtualISO = obterHojeISO().slice(0, 7);

            return !!item.vencimento && item.vencimento.slice(0, 7) === mesAtualISO;

        }

        case "todos":
        default:
            return true;

    }

}

/*=========================================
  LINHA DA TABELA (com suporte a agrupamento
  de parcelas do mesmo contrato)
=========================================*/

function criarLinhaRecebimento(item, opcoes) {

    opcoes = opcoes || {};

    const statusClasse =
        item.status === "Quitado" ? "pago" :
        item.status === "Atrasado" ? "atrasado" : "aberto";

    const dias = calcularDiasAtraso(item.vencimento);

    const diasAtraso = item.status === "Atrasado"
        ? dias + " dia" + (dias > 1 ? "s" : "")
        : "-";

    const atributos = [
        `data-contrato="${item.contrato}"`,
        `data-id="${item.id || ""}"`
    ];

    let classeLinha = "";

    if (opcoes.subLinha) {

        classeLinha = "linha-oculta";
        atributos.push(`data-grupo="${opcoes.grupoContrato}"`);
        atributos.push(`style="display:none"`);

    }

    const toggle = opcoes.temGrupo
        ? `<button class="toggle-grupo" type="button" title="Ver todas as parcelas deste contrato" data-grupo="${item.contrato}">
                <i class="fa-solid fa-chevron-right"></i>
           </button> `
        : "";

    // Parcelas em aberto: recalcula o juro na hora, a partir do saldo
    // devedor atual (nunca confia no campo gravado, que só atualiza a
    // cada pagamento). Parcelas já Quitadas mantêm o valor gravado no
    // momento da baixa, que é o registro histórico correto daquele
    // pagamento. Contratos "Parcelado" fogem dessa regra: o juros é
    // fixo por parcela (não recalculado sobre o saldo, que só serve
    // aqui pra controlar a amortização) — usa sempre o valor gravado.
    const jurosExibido = (item.status === "Quitado" || item.tipoJuros === "Parcelado")
        ? Number(item.valorJuros || 0)
        : jurosAtualDaParcela(item);

    // Só existe um "valor de parcela" fixo em contratos "Parcelado"
    // (capital + juros já somados). No modelo rotativo, o que se cobra
    // por mês já é o próprio juros (coluna "Juros do Mês") — não tem
    // um valor separado pra mostrar aqui.
    const valorParcelaExibido = item.tipoJuros === "Parcelado"
        ? moeda(Number(item.valorParcela || 0))
        : "-";

    return `
        <tr class="${classeLinha}" ${atributos.join(" ")}>
            <td>${toggle}${item.contrato}</td>
            <td>${item.cliente}</td>
            <td>${item.parceiro}</td>
            <td>${formatarData(item.vencimento)}</td>
            <td>${moeda(Number(item.saldoDevedor || 0))}</td>
            <td>${moeda(jurosExibido)}</td>
            <td>${valorParcelaExibido}</td>
            <td>${diasAtraso}</td>
            <td>
                <span class="status ${statusClasse}">${item.status}</span>
            </td>
            <td>
                <button class="acao receber" title="Receber Parcela">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </button>

                <button class="acao visualizar" title="Visualizar Extrato">
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button class="acao excluir" title="Excluir Recebimento">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `;

}

function carregarRecebimentos() {

    atualizarStatusRecebimentos();

    const lista = document.getElementById("listaRecebimentos");

    lista.innerHTML = "";

    const recebimentos =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];

    // Se veio de "Visualizar Contrato" (Empréstimos → recebimentos.html
    // ?contrato=000001), mostra só o histórico de parcelas daquele
    // contrato específico, ignorando os filtros de status/data.
    const filtrados = window.contratoFiltro
        ? recebimentos.filter(r => r.contrato === window.contratoFiltro)
        : recebimentos.filter(passaNoFiltroRecebimento);

    // Agrupa as parcelas pelo número do contrato, preservando a ordem
    // em que aparecem no armazenamento.
    const grupos = [];
    const indicePorContrato = {};

    filtrados.forEach(function (item) {

        if (indicePorContrato[item.contrato] === undefined) {

            indicePorContrato[item.contrato] = grupos.length;
            grupos.push({ contrato: item.contrato, parcelas: [] });

        }

        grupos[indicePorContrato[item.contrato]].parcelas.push(item);

    });

    grupos.forEach(function (grupo) {

        const parcelas = grupo.parcelas;

        // Filtrando por um contrato específico: mostra todo o histórico
        // já expandido, sem agrupar/ocultar nada.
        if (window.contratoFiltro) {

            parcelas
                .slice()
                .sort((a, b) => (a.vencimento || "").localeCompare(b.vencimento || ""))
                .forEach(function (item) {

                    lista.innerHTML += criarLinhaRecebimento(item, {});

                });

            return;

        }

        // A linha principal exibida é a parcela em aberto (Pendente/Atrasado);
        // se todas já estiverem quitadas, mostra a mais recente.
        const principal =
            parcelas.find(p => p.status !== "Quitado") ||
            parcelas[parcelas.length - 1];

        const outras = parcelas.filter(p => p !== principal);

        lista.innerHTML += criarLinhaRecebimento(principal, {
            temGrupo: outras.length > 0
        });

        outras.forEach(function (item) {

            lista.innerHTML += criarLinhaRecebimento(item, {
                subLinha: true,
                grupoContrato: grupo.contrato
            });

        });

    });

    atualizarCardsRecebimentos();

}


function atualizarCardsRecebimentos(){

    const recebimentos =
        JSON.parse(localStorage.getItem("recebimentosERP")) || [];

    // Contratos "Parcelado" podem ter várias parcelas abertas ao mesmo
    // tempo (cada uma já criada desde o cadastro), cada uma com o saldo
    // devedor daquele ponto do cronograma — soma só a maior por
    // contrato (a parcela mais antiga ainda aberta), que já representa
    // o principal total restante daquele contrato, pra não contar o
    // mesmo capital várias vezes. Em contratos rotativos (só 1 parcela
    // aberta por vez) isso dá o mesmo resultado de antes.
    const saldoPorContrato = {};
    const contratosComPendente = new Set();
    let parcelasVencidas = 0;

    recebimentos.forEach(function(item){

        // "Total a Receber" precisa somar tudo que ainda não foi
        // quitado — Pendente E Atrasado. Antes só somava Pendente,
        // então o valor em aberto ficava menor do que o real assim
        // que alguma parcela vencia.
        if(item.status === "Pendente" || item.status === "Atrasado"){

            const saldo = Number(item.saldoDevedor || 0);

            if (!(item.contrato in saldoPorContrato) || saldo > saldoPorContrato[item.contrato]) {
                saldoPorContrato[item.contrato] = saldo;
            }

        }

        if(item.status === "Pendente"){

            contratosComPendente.add(item.contrato);

        }

        if(item.status === "Atrasado"){

            parcelasVencidas++;

        }

    });

    const total = Object.values(saldoPorContrato).reduce((soma, v) => soma + v, 0);

    document.getElementById("cardTotalReceber").innerHTML =
        moeda(total);

    document.getElementById("cardContratosPendentes").innerHTML =
        contratosComPendente.size;

    document.getElementById("cardParcelasVencidas").innerHTML =
        parcelasVencidas;

}

/*=========================================
  EXCLUIR / DESFAZER RECEBIMENTO
=========================================*/

// Calcula o status correto (Pendente/Atrasado) de uma parcela a partir
// da data de vencimento, igual à lógica de atualizarStatusRecebimentos.
function calcularStatusPorVencimento(vencimento) {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataVencimento = new Date(vencimento);
    dataVencimento.setHours(0, 0, 0, 0);

    return hoje > dataVencimento ? "Atrasado" : "Pendente";

}

// Remove de vez todas as parcelas e o histórico de pagamentos de um
// contrato inteiro (usado quando o contrato é de teste/inválido e o
// usuário só quer que ele suma por completo, sem tentar restaurar saldo).
function excluirTodasParcelasDoContrato(contrato) {

    let recebimentos = carregar("recebimentosERP");
    const qtdParcelas = recebimentos.filter(r => r.contrato === contrato).length;

    recebimentos = recebimentos.filter(r => r.contrato !== contrato);
    salvar("recebimentosERP", recebimentos);

    let historico = carregar("historicoRecebimentosERP");
    historico = historico.filter(h => h.contrato !== contrato);
    salvar("historicoRecebimentosERP", historico);

    carregarRecebimentos();

    alert(
        qtdParcelas + " parcela(s) do contrato " + contrato +
        " e o histórico de pagamentos foram excluídos definitivamente."
    );

}

function excluirRecebimento(id, contrato) {

    let recebimentos = carregar("recebimentosERP");

    const parcela = id
        ? recebimentos.find(r => String(r.id) === id)
        : recebimentos.find(r => r.contrato === contrato);

    if (!parcela) return;

    const totalParcelasContrato = recebimentos.filter(
        r => r.contrato === parcela.contrato
    ).length;

    if (totalParcelasContrato > 1) {

        const apagarTudo = confirm(
            "O contrato " + parcela.contrato + " tem " + totalParcelasContrato +
            " parcelas registradas (algumas podem estar ocultas no agrupamento).\n\n" +
            "Clique OK para excluir TODAS as parcelas e o histórico deste contrato de uma vez.\n" +
            "Clique Cancelar para excluir apenas esta parcela específica."
        );

        if (apagarTudo) {
            excluirTodasParcelasDoContrato(parcela.contrato);
            return;
        }

    }

    // Parcela que ainda não foi recebida (Pendente/Atrasado): não há
    // pagamento para desfazer, é só remover o registro.
    if (parcela.status !== "Quitado") {

        if (!confirm("Excluir esta parcela (ainda não recebida)?")) return;

        recebimentos = recebimentos.filter(r => r !== parcela);

        salvar("recebimentosERP", recebimentos);

        carregarRecebimentos();

        return;

    }

    // Parcela já quitada: precisa desfazer o pagamento (excluir do
    // histórico e devolver o saldo/status anteriores).
    let historico = carregar("historicoRecebimentosERP");

    const historicoDoPagamento = historico
        .filter(h => h.parcelaId != null && String(h.parcelaId) === String(parcela.id))
        .sort((a, b) => (b.dataPagamento || "").localeCompare(a.dataPagamento || ""))[0];

    if (!historicoDoPagamento) {

        const forcar = confirm(
            "Não foi possível localizar o histórico deste pagamento " +
            "(registro antigo ou órfão, sem dados pra restaurar o saldo automaticamente).\n\n" +
            "Deseja excluir esta parcela mesmo assim, sem ajustar o saldo do empréstimo? " +
            "Só faça isso se tiver certeza de que o registro é mesmo inválido/de teste."
        );

        if (!forcar) return;

        recebimentos = recebimentos.filter(r => r !== parcela);

        salvar("recebimentosERP", recebimentos);

        carregarRecebimentos();

        alert("Parcela excluída.");

        return;

    }

    // Se já existe uma parcela seguinte e ela foi quitada (ou não existe
    // mais), significa que já houve pagamento(s) depois deste — não dá
    // pra desfazer sem corromper o histórico posterior.
    if (historicoDoPagamento.novaParcelaId != null) {

        const parcelaSeguinte = recebimentos.find(
            r => String(r.id) === String(historicoDoPagamento.novaParcelaId)
        );

        if (!parcelaSeguinte || parcelaSeguinte.status === "Quitado") {

            alert(
                "Não é possível excluir: já existem pagamentos registrados " +
                "depois deste neste contrato. Exclua primeiro o(s) pagamento(s) mais recente(s)."
            );

            return;

        }

    }

    if (!confirm(
        "Excluir este recebimento e desfazer o pagamento? " +
        "O saldo devedor e o status voltarão ao que eram antes."
    )) return;

    // Remove a parcela seguinte criada por este pagamento (se existir).
    if (historicoDoPagamento.novaParcelaId != null) {

        recebimentos = recebimentos.filter(
            r => String(r.id) !== String(historicoDoPagamento.novaParcelaId)
        );

    }

    // Restaura a parcela ao estado anterior ao pagamento.
    recebimentos = recebimentos.map(function (r) {

        if (String(r.id) !== String(parcela.id)) return r;

        const saldoAnterior = Number(historicoDoPagamento.saldoAnterior || 0);
        const taxa = Number(r.taxaJuros) || 0;

        r.saldoDevedor = saldoAnterior;
        r.valorJuros = saldoAnterior * (taxa / 100);
        r.status = calcularStatusPorVencimento(r.vencimento);

        return r;

    });

    salvar("recebimentosERP", recebimentos);

    // Remove o registro do histórico de pagamentos.
    historico = historico.filter(h => h !== historicoDoPagamento);

    salvar("historicoRecebimentosERP", historico);

    // Restaura o empréstimo ao estado anterior a este pagamento.
    let emprestimos = carregar("emprestimosERP");

    emprestimos = emprestimos.map(function (item) {

        if (item.contrato !== parcela.contrato) return item;

        if (historicoDoPagamento.saldoDevedorEmprestimoAnterior != null) {
            item.saldoDevedor = historicoDoPagamento.saldoDevedorEmprestimoAnterior;
        }

        if (historicoDoPagamento.primeiroVencimentoAnterior) {
            item.primeiroVencimento = historicoDoPagamento.primeiroVencimentoAnterior;
        }

        if (historicoDoPagamento.statusEmprestimoAnterior) {
            item.status = historicoDoPagamento.statusEmprestimoAnterior;
        }

        return item;

    });

    salvar("emprestimosERP", emprestimos);

    carregarRecebimentos();

    alert("Recebimento excluído e pagamento desfeito com sucesso.");

}

function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}
function calcularDiasAtraso(vencimento){

    if (!vencimento) return 0;

    // "T00:00:00" (sem "Z") força horário local, evitando o deslocamento
    // de fuso de new Date("aaaa-mm-dd").
    const hoje = new Date(obterHojeISO() + "T00:00:00");
    const dataVencimento = new Date(vencimento + "T00:00:00");

    const diferenca = hoje.getTime() - dataVencimento.getTime();

    const dias = Math.round(
        diferenca / (1000 * 60 * 60 * 24)
    );

    return dias > 0 ? dias : 0;

}

function mostrarRecebimentos(recebimentos){

    const lista = document.getElementById("listaRecebimentos");

    lista.innerHTML = "";

    recebimentos.forEach(function(item){

        lista.innerHTML += `
            <tr data-contrato="${item.contrato}">
                <td>${item.contrato}</td>
                <td>${item.cliente}</td>
                <td>${item.parceiro}</td>
                <td>${formatarData(item.vencimento)}</td>
                <td>${moeda(Number(item.saldoDevedor || 0))}</td>
                <td>${moeda(Number(item.valorJuros || 0))}</td>

                <td>${
                    item.status === "Atrasado"
                        ? calcularDiasAtraso(item.vencimento) + " dia" +
                          (calcularDiasAtraso(item.vencimento) > 1 ? "s" : "")
                        : "-"
                }</td>

                <td>

                    <span class="status ${
                        item.status === "Quitado"
                            ? "pago"
                            : item.status === "Atrasado"
                                ? "atrasado"
                                : "aberto"
                    }">

                        ${item.status}

                    </span>

                </td>

                <td>

                    <button class="acao receber">

                        <i class="fa-solid fa-hand-holding-dollar"></i>

                    </button>

                    <button class="acao visualizar">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            </tr>
        `;

    });

}