/* =====================================================
   ERP CRÉDITO
   MÓDULO PARCEIROS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modalParceiro");

    const btnNovo = document.querySelector(".btnNovo");
    const btnNovoBarra = document.querySelector(".btnAzul");
    const btnFechar = document.querySelector(".fechar");
    const btnCancelar = document.getElementById("btnCancelarParceiro");

    const btnExportar = document.getElementById("btnExportarParceiros");
    const btnImprimir = document.getElementById("btnImprimirParceiros");

    btnExportar?.addEventListener("click", function () {
        exportarTabelaCSV("listaParceiros", "parceiros.csv");
    });

    btnImprimir?.addEventListener("click", function () {
        window.print();
    });

    const pesquisa = document.getElementById("pesquisaParceiro");

    const formulario = document.querySelector("#modalParceiro form");

    let parceiroEditando = null;

    /* ==========================
       ABRIR MODAL
    ========================== */

    function abrirModal() {
        parceiroEditando = null;
        modal.style.display = "flex";
    }

    /* ==========================
       FECHAR MODAL
    ========================== */

    function fecharModal() {
        modal.style.display = "none";
        formulario.reset();
        parceiroEditando = null;
    }

    if (btnNovo)
        btnNovo.addEventListener("click", abrirModal);

    if (btnNovoBarra)
        btnNovoBarra.addEventListener("click", abrirModal);

    if (btnFechar)
        btnFechar.addEventListener("click", fecharModal);

    if (btnCancelar)
        btnCancelar.addEventListener("click", fecharModal);

    /* ==========================
       FECHAR CLICANDO FORA
    ========================== */

    window.addEventListener("click", (e) => {

        if (e.target === modal) {

            fecharModal();

        }

    });

    /* ==========================
       SALVAR PARCEIRO
    ========================== */

    formulario.addEventListener("submit", function (e) {

        e.preventDefault();

        const nome = document.getElementById("nomeParceiro").value.trim();

        if (nome === "") {
            alert("Informe o nome do parceiro.");
            return;
        }

        const parceiro = {

            id: parceiroEditando !== null ? parceiroEditando : gerarId(),
            nome,
            cpfCnpj: document.getElementById("cpfCnpjParceiro").value.trim(),
            telefone: document.getElementById("telefoneParceiro").value.trim(),
            whatsapp: document.getElementById("whatsappParceiro").value.trim(),
            email: document.getElementById("emailParceiro").value.trim(),
            comissao: Number(document.getElementById("comissaoParceiro").value) || 0,
            banco: document.getElementById("bancoParceiro").value.trim(),
            agencia: document.getElementById("agenciaParceiro").value.trim(),
            conta: document.getElementById("contaParceiro").value.trim(),
            pix: document.getElementById("pixParceiro").value.trim(),
            status: document.getElementById("statusParceiro").value,
            observacao: document.getElementById("observacaoParceiro").value.trim()

        };

        let parceiros = carregar("parceirosERP");

        if (parceiroEditando !== null) {

            const indice = parceiros.findIndex(p => p.id === parceiroEditando);

            if (indice !== -1) {
                parceiros[indice] = parceiro;
            }

        } else {

            parceiros.push(parceiro);

        }

        salvar("parceirosERP", parceiros);

        renderizarTabelaParceiros();

        alert("Parceiro cadastrado com sucesso!");

        fecharModal();

    });

    /* ==========================
       PESQUISA
    ========================== */

    pesquisa.addEventListener("keyup", function () {

        const filtro = pesquisa.value.toLowerCase();

        const linhas = document.querySelectorAll("#listaParceiros tr");

        linhas.forEach(linha => {

            const texto = linha.innerText.toLowerCase();

            linha.style.display = texto.includes(filtro)
                ? ""
                : "none";

        });

    });

    /* ==========================
       RENDERIZAÇÃO INICIAL
    ========================== */

    renderizarTabelaParceiros();

    function abrirEdicao(id) {

        const parceiros = carregar("parceirosERP");
        const parceiro = parceiros.find(p => p.id === id);

        if (!parceiro) return;

        parceiroEditando = id;

        document.getElementById("nomeParceiro").value = parceiro.nome || "";
        document.getElementById("cpfCnpjParceiro").value = parceiro.cpfCnpj || "";
        document.getElementById("telefoneParceiro").value = parceiro.telefone || "";
        document.getElementById("whatsappParceiro").value = parceiro.whatsapp || "";
        document.getElementById("emailParceiro").value = parceiro.email || "";
        document.getElementById("comissaoParceiro").value = parceiro.comissao || "";
        document.getElementById("bancoParceiro").value = parceiro.banco || "";
        document.getElementById("agenciaParceiro").value = parceiro.agencia || "";
        document.getElementById("contaParceiro").value = parceiro.conta || "";
        document.getElementById("pixParceiro").value = parceiro.pix || "";
        document.getElementById("statusParceiro").value = parceiro.status || "Ativo";
        document.getElementById("observacaoParceiro").value = parceiro.observacao || "";

        modal.style.display = "flex";

    }

    window.abrirEdicaoParceiro = abrirEdicao;

    /* ==========================
       EXTRATO DO PARCEIRO
    ========================== */

    const modalExtrato = document.getElementById("modalExtratoParceiro");
    const fecharExtrato = document.getElementById("fecharExtratoParceiro");
    const btnFecharExtrato = document.getElementById("btnFecharExtratoParceiro");
    const btnFiltrarExtrato = document.getElementById("btnFiltrarExtratoParceiro");
    const btnLimparExtrato = document.getElementById("btnLimparExtratoParceiro");

    let parceiroExtratoId = null;

    function fecharModalExtrato() {
        modalExtrato.style.display = "none";
        parceiroExtratoId = null;
    }

    fecharExtrato?.addEventListener("click", fecharModalExtrato);
    btnFecharExtrato?.addEventListener("click", fecharModalExtrato);

    window.addEventListener("click", (e) => {

        if (e.target === modalExtrato) {
            fecharModalExtrato();
        }

    });

    btnFiltrarExtrato?.addEventListener("click", function () {

        renderizarExtratoParceiro(parceiroExtratoId);

    });

    btnLimparExtrato?.addEventListener("click", function () {

        document.getElementById("extParceiroDataInicial").value = "";
        document.getElementById("extParceiroDataFinal").value = "";

        renderizarExtratoParceiro(parceiroExtratoId);

    });

    document.getElementById("btnBaixaLoteParceiro")?.addEventListener("click", function () {

        if (parceiroExtratoId != null) {
            darBaixaEmLoteParceiro(parceiroExtratoId);
        }

    });

    window.abrirExtratoParceiro = function (id) {

        const parceiros = carregar("parceirosERP");
        const parceiro = parceiros.find(p => p.id === id);

        if (!parceiro) return;

        parceiroExtratoId = id;

        document.getElementById("extParceiroNome").textContent =
            "Extrato de " + parceiro.nome;

        document.getElementById("extParceiroDataInicial").value = "";
        document.getElementById("extParceiroDataFinal").value = "";

        renderizarExtratoParceiro(id);

        modalExtrato.style.display = "flex";

    };

});

/* =====================================================
   EVENTOS DOS BOTÕES
===================================================== */

function atualizarEventos() {

    /* Visualizar */

    document.querySelectorAll(".visualizar").forEach(botao => {

        botao.onclick = function () {

            const id = Number(this.closest("tr").dataset.id);

            window.abrirExtratoParceiro(id);

        };

    });

    /* Editar */

    document.querySelectorAll(".editar").forEach(botao => {

        botao.onclick = function () {

            const id = Number(this.closest("tr").dataset.id);

            window.abrirEdicaoParceiro(id);

        };

    });

    /* Excluir */

    document.querySelectorAll(".excluir").forEach(botao => {

        botao.onclick = function () {

            const linha = this.closest("tr");
            const id = Number(linha.dataset.id);
            const nome = linha.children[1].innerText;

            const confirmar = confirm("Excluir o parceiro " + nome + "?");

            if (confirmar) {

                let parceiros = carregar("parceirosERP");
                parceiros = parceiros.filter(p => p.id !== id);
                salvar("parceirosERP", parceiros);

                renderizarTabelaParceiros();

            }

        };

    });
}

/* =====================================================
   RENDERIZAR TABELA
===================================================== */

function renderizarTabelaParceiros() {

    const tabela = document.getElementById("listaParceiros");

    if (!tabela) return;

    const parceiros = carregar("parceirosERP");

    tabela.innerHTML = "";

    parceiros.forEach((parceiro, indice) => {

        const tr = document.createElement("tr");

        tr.dataset.id = parceiro.id;

        // Parceiros criados pelo cadastro rápido (dentro de Empréstimos)
        // podem não ter status/comissão preenchidos; nunca deixar isso
        // quebrar a renderização da tabela inteira.
        const status = parceiro.status || "Ativo";
        const comissao = Number(parceiro.comissao) || 0;

        tr.innerHTML = `
                <td>${indice + 1}</td>
                <td>${parceiro.nome}</td>
                <td>${parceiro.telefone || "-"}</td>
                <td>${comissao}%</td>
                <td>${contarClientesIndicados(parceiro.nome)}</td>
                <td>
                    <span class="status ${status.toLowerCase()}">
                        ${status}
                    </span>
                </td>
                <td>
                    <button class="acao visualizar">
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button class="acao editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="acao excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
        `;

        tabela.appendChild(tr);

    });

    atualizarEventos();

    atualizarCardsParceiros(parceiros);

}

/* =====================================================
   CLIENTES INDICADOS / COMISSÕES
   (percentualComissaoContrato, baseComissao e situacaoComissao
   agora vivem em core.js, pra serem usadas também no Dashboard)
===================================================== */

function contarClientesIndicados(nomeParceiro) {

    const emprestimos = carregar("emprestimosERP");

    const clientes = new Set(

        emprestimos
            .filter(e => nomesIguais(e.parceiro, nomeParceiro))
            .map(e => String(e.cliente || "").trim().toLowerCase())

    );

    return clientes.size;

}

function atualizarCardsParceiros(parceiros) {

    const emprestimos = carregar("emprestimosERP");

    const total = parceiros.length;
    const ativos = parceiros.filter(p => (p.status || "Ativo") === "Ativo").length;

    const clientesIndicados = new Set(

        emprestimos
            .filter(e => e.parceiro)
            .map(e => String(e.cliente || "").trim().toLowerCase())

    ).size;

    let comissoes = 0;

    emprestimos.forEach(emprestimo => {

        const parceiro = parceiros.find(p => nomesIguais(p.nome, emprestimo.parceiro));

        if (parceiro) {
            comissoes += jurosParceiroContrato(emprestimo, parceiro);
        }

    });

    const cardTotal = document.getElementById("cardTotalParceiros");
    const cardAtivos = document.getElementById("cardParceirosAtivos");
    const cardClientes = document.getElementById("cardClientesIndicados");
    const cardComissoes = document.getElementById("cardComissoes");

    if (cardTotal) cardTotal.textContent = total;
    if (cardAtivos) cardAtivos.textContent = ativos;
    if (cardClientes) cardClientes.textContent = clientesIndicados;
    if (cardComissoes) cardComissoes.textContent = formatarMoeda(comissoes);

}

/* =====================================================
   EXTRATO DO PARCEIRO
===================================================== */

// Formata "aaaa-mm-dd" para "dd/mm/aaaa" sem usar Date() (evita
// deslocamento de fuso horário no formatarData de core.js).
function formatarDataParceiro(data) {

    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

function contratoEstaNoPeriodo(dataContrato, dataInicial, dataFinal) {

    if (!dataContrato) return false;

    if (dataInicial && dataContrato < dataInicial) return false;

    if (dataFinal && dataContrato > dataFinal) return false;

    return true;

}

function renderizarExtratoParceiro(id) {

    const parceiros = carregar("parceirosERP");
    const parceiro = parceiros.find(p => p.id === id);

    if (!parceiro) return;

    const dataInicial = document.getElementById("extParceiroDataInicial").value;
    const dataFinal = document.getElementById("extParceiroDataFinal").value;

    const emprestimos = carregar("emprestimosERP")
        .filter(e => nomesIguais(e.parceiro, parceiro.nome))
        .filter(e => {

            if (!dataInicial && !dataFinal) return true;

            return contratoEstaNoPeriodo(e.dataContrato, dataInicial, dataFinal);

        })
        .sort((a, b) => (b.dataContrato || "").localeCompare(a.dataContrato || ""));

    const tbody = document.getElementById("tbodyExtratoParceiro");

    tbody.innerHTML = "";

    let totalAReceber = 0;
    let totalPago = 0;

    if (emprestimos.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Nenhum contrato encontrado neste período.
                </td>
            </tr>
        `;

    } else {

        emprestimos.forEach(function (emprestimo) {

            const percentualComissao = percentualComissaoContrato(emprestimo, parceiro);

            const valorComissao = jurosParceiroContrato(emprestimo, parceiro);

            const situacao = situacaoComissao(emprestimo);

            if (situacao === "Pago") {
                totalPago += valorComissao;
            } else {
                totalAReceber += valorComissao;
            }

            const classeSituacao =
                situacao === "Pago" ? "recebida" :
                situacao === "Atrasado" ? "atraso" : "pendente";

            tbody.innerHTML += `
                <tr>
                    <td>${emprestimo.contrato}</td>
                    <td>${emprestimo.cliente}</td>
                    <td>${formatarDataParceiro(emprestimo.dataContrato)}</td>
                    <td>${formatarMoeda(emprestimo.valor)}</td>
                    <td>${formatarMoeda(valorComissao)} <small>(${percentualComissao}%)</small></td>
                    <td>${formatarDataParceiro(emprestimo.primeiroVencimento)}</td>
                    <td>
                        <span class="status ${classeSituacao}">
                            ${situacao}
                        </span>
                    </td>
                    <td>
                        ${
                            situacao === "Pago"
                                ? "-"
                                : `<button type="button" class="btnAzul btn-dar-baixa" data-contrato="${emprestimo.contrato}">Dar baixa</button>`
                        }
                    </td>
                </tr>
            `;

        });

    }

    document.getElementById("extParceiroTotalContratos").textContent =
        emprestimos.length;

    document.getElementById("extParceiroAReceber").textContent =
        formatarMoeda(totalAReceber);

    document.getElementById("extParceiroRecebido").textContent =
        formatarMoeda(totalPago);

    window.parceiroExtratoAtualId = id;

}

function darBaixaComissaoParceiro(numeroContrato) {

    if (!confirm("Confirmar a baixa da comissão do contrato " + numeroContrato + "?")) {
        return;
    }

    let emprestimos = carregar("emprestimosERP");

    emprestimos = emprestimos.map(function (emprestimo) {

        if (emprestimo.contrato === numeroContrato) {
            emprestimo.comissaoParceiroPaga = true;
            emprestimo.dataPagamentoComissaoParceiro =
                obterHojeISO();
        }

        return emprestimo;

    });

    salvar("emprestimosERP", emprestimos);

    if (window.parceiroExtratoAtualId != null) {
        renderizarExtratoParceiro(window.parceiroExtratoAtualId);
    }

    renderizarTabelaParceiros();

}

document.addEventListener("click", function (e) {

    const botao = e.target.closest(".btn-dar-baixa");

    if (!botao) return;

    darBaixaComissaoParceiro(botao.dataset.contrato);

});

// Dá baixa de uma vez em todas as comissões "Pendente" (ainda não
// venceram) de um parceiro. As "Atrasado" ficam de fora de propósito —
// só quita pendente, nunca atrasada, pra não mascarar inadimplência.
function darBaixaEmLoteParceiro(idParceiro) {

    const parceiros = carregar("parceirosERP");
    const parceiro = parceiros.find(p => p.id === idParceiro);

    if (!parceiro) return;

    const emprestimos = carregar("emprestimosERP");

    const contratosDoParceiro = emprestimos.filter(
        e => nomesIguais(e.parceiro, parceiro.nome)
    );

    const pendentes = contratosDoParceiro.filter(
        e => situacaoComissao(e) === "Pendente"
    );

    if (pendentes.length === 0) {
        alert("Não há comissões pendentes (não atrasadas) para dar baixa neste parceiro.");
        return;
    }

    const totalValor = pendentes.reduce(function (soma, e) {

        return soma + jurosParceiroContrato(e, parceiro);

    }, 0);

    if (!confirm(
        "Dar baixa em " + pendentes.length + " comissão(ões) pendente(s) de " + parceiro.nome +
        ", totalizando " + formatarMoeda(totalValor) + "?\n\n" +
        "As comissões já ATRASADAS não serão afetadas por esta ação."
    )) return;

    const contratosPendentes = new Set(pendentes.map(e => e.contrato));
    const hoje = obterHojeISO();

    const emprestimosAtualizados = emprestimos.map(function (e) {

        if (contratosPendentes.has(e.contrato)) {
            e.comissaoParceiroPaga = true;
            e.dataPagamentoComissaoParceiro = hoje;
        }

        return e;

    });

    salvar("emprestimosERP", emprestimosAtualizados);

    renderizarExtratoParceiro(idParceiro);
    renderizarTabelaParceiros();

    alert(pendentes.length + " comissão(ões) marcadas como pagas.");

}
