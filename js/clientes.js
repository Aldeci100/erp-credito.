// =======================================
// ERP CRÉDITO
// MÓDULO CLIENTES
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modalCliente");

    const btnNovo = document.querySelectorAll(".btnNovo, #btnNovoClienteBarra");

    const btnFechar = document.querySelector(".fechar");
    const btnCancelar = document.getElementById("btnCancelarCliente");

    const btnExportar = document.getElementById("btnExportarClientes");
    const btnImprimir = document.getElementById("btnImprimirClientes");

    btnExportar?.addEventListener("click", function () {
        exportarTabelaCSV("listaClientes", "clientes.csv");
    });

    btnImprimir?.addEventListener("click", function () {
        window.print();
    });

    const pesquisa = document.getElementById("pesquisaCliente");

    const formulario = document.querySelector("#modalCliente form");

    let clienteEditando = null;

    // =======================================
    // ABRIR MODAL
    // =======================================

    btnNovo.forEach(botao => {

        botao.addEventListener("click", function () {

            clienteEditando = null;
            formulario.reset();
            carregarSelectParceiros();
            modal.style.display = "flex";

        });

    });

    // =======================================
    // FECHAR MODAL
    // =======================================

    btnFechar.addEventListener("click", function () {

        modal.style.display = "none";
        clienteEditando = null;

    });

    btnCancelar?.addEventListener("click", function () {

        modal.style.display = "none";
        clienteEditando = null;

    });

    // Fecha clicando fora

    window.addEventListener("click", function (e) {

        if (e.target === modal) {

            modal.style.display = "none";
            clienteEditando = null;

        }

    });

    // =======================================
    // PESQUISA
    // =======================================

    pesquisa.addEventListener("keyup", function () {

        const texto = pesquisa.value.toLowerCase();

        const linhas = document.getElementById("listaClientes").querySelectorAll("tr");

        linhas.forEach(function (linha) {

            const conteudo = linha.textContent.toLowerCase();

            linha.style.display = conteudo.indexOf(texto) > -1 ? "" : "none";

        });

    });

    // =======================================
    // SALVAR CLIENTE
    // =======================================

    formulario.addEventListener("submit", function (e) {

        e.preventDefault();

        const nome = document.getElementById("nomeCliente").value.trim();

        if (nome === "") {
            alert("Informe o nome do cliente.");
            return;
        }

        const cliente = {

            id: clienteEditando !== null ? clienteEditando : gerarId(),
            nome,
            cpf: document.getElementById("cpfCliente").value.trim(),
            rg: document.getElementById("rgCliente").value.trim(),
            nascimento: document.getElementById("nascimentoCliente").value,
            telefone: document.getElementById("telefoneCliente").value.trim(),
            whatsapp: document.getElementById("whatsappCliente").value.trim(),
            email: document.getElementById("emailCliente").value.trim(),
            cep: document.getElementById("cepCliente").value.trim(),
            endereco: document.getElementById("enderecoCliente").value.trim(),
            numero: document.getElementById("numeroCliente").value.trim(),
            bairro: document.getElementById("bairroCliente").value.trim(),
            cidade: document.getElementById("cidadeCliente").value.trim(),
            estado: document.getElementById("estadoCliente").value.trim(),
            profissao: document.getElementById("profissaoCliente").value.trim(),
            empresa: document.getElementById("empresaCliente").value.trim(),
            salario: Number(document.getElementById("salarioCliente").value) || 0,
            limiteCredito: Number(document.getElementById("limiteCreditoCliente").value) || 0,
            status: document.getElementById("statusCliente").value,
            parceiro: document.getElementById("parceiroCliente").value,
            observacoes: document.getElementById("observacoesCliente").value.trim()

        };

        let clientes = carregar("clientesERP");

        if (clienteEditando !== null) {

            const indice = clientes.findIndex(c => c.id === clienteEditando);

            if (indice !== -1) {
                clientes[indice] = cliente;
            }

        } else {

            clientes.push(cliente);

        }

        salvar("clientesERP", clientes);

        renderizarTabelaClientes();

        alert("Cliente salvo com sucesso!");

        modal.style.display = "none";
        clienteEditando = null;

    });

    // =======================================
    // RENDERIZAÇÃO INICIAL
    // =======================================

    renderizarTabelaClientes();

    function abrirEdicao(id) {

        const clientes = carregar("clientesERP");
        const cliente = clientes.find(c => c.id === id);

        if (!cliente) return;

        clienteEditando = id;

        carregarSelectParceiros();

        document.getElementById("nomeCliente").value = cliente.nome || "";
        document.getElementById("cpfCliente").value = cliente.cpf || "";
        document.getElementById("rgCliente").value = cliente.rg || "";
        document.getElementById("nascimentoCliente").value = cliente.nascimento || "";
        document.getElementById("telefoneCliente").value = cliente.telefone || "";
        document.getElementById("whatsappCliente").value = cliente.whatsapp || "";
        document.getElementById("emailCliente").value = cliente.email || "";
        document.getElementById("cepCliente").value = cliente.cep || "";
        document.getElementById("enderecoCliente").value = cliente.endereco || "";
        document.getElementById("numeroCliente").value = cliente.numero || "";
        document.getElementById("bairroCliente").value = cliente.bairro || "";
        document.getElementById("cidadeCliente").value = cliente.cidade || "";
        document.getElementById("estadoCliente").value = cliente.estado || "";
        document.getElementById("profissaoCliente").value = cliente.profissao || "";
        document.getElementById("empresaCliente").value = cliente.empresa || "";
        document.getElementById("salarioCliente").value = cliente.salario || "";
        document.getElementById("limiteCreditoCliente").value = cliente.limiteCredito || "";
        document.getElementById("statusCliente").value = cliente.status || "Ativo";
        document.getElementById("parceiroCliente").value = cliente.parceiro || "";
        document.getElementById("observacoesCliente").value = cliente.observacoes || "";

        modal.style.display = "flex";

    }

    window.abrirEdicaoCliente = abrirEdicao;

});

// =======================================
// SELECT DE PARCEIROS
// =======================================

function carregarSelectParceiros() {

    const select = document.getElementById("parceiroCliente");

    if (!select) return;

    const selecionado = select.value;

    const parceiros = carregar("parceirosERP");

    select.innerHTML = '<option value="">Selecione...</option>';

    parceiros.forEach(parceiro => {

        const option = document.createElement("option");

        option.value = parceiro.nome;
        option.textContent = parceiro.nome;

        if (parceiro.nome === selecionado) {
            option.selected = true;
        }

        select.appendChild(option);

    });

}

// =======================================
// BOTÕES DA TABELA
// =======================================

function atualizarEventosClientes() {

    document.querySelectorAll("#listaClientes .visualizar").forEach(botao => {

        botao.onclick = function () {

            const nome = this.closest("tr").children[1].innerText;

            alert("Visualizando cliente: " + nome);

        };

    });

    document.querySelectorAll("#listaClientes .editar").forEach(botao => {

        botao.onclick = function () {

            const id = Number(this.closest("tr").dataset.id);

            window.abrirEdicaoCliente(id);

        };

    });

    document.querySelectorAll("#listaClientes .excluir").forEach(botao => {

        botao.onclick = function () {

            const linha = this.closest("tr");
            const id = Number(linha.dataset.id);
            const nome = linha.children[1].innerText;

            if (confirm("Deseja excluir o cliente " + nome + "?")) {

                let clientes = carregar("clientesERP");
                clientes = clientes.filter(c => c.id !== id);
                salvar("clientesERP", clientes);

                renderizarTabelaClientes();

            }

        };

    });

}

// =======================================
// RENDERIZAR TABELA E CARDS
// =======================================

function renderizarTabelaClientes() {

    const tabela = document.getElementById("listaClientes");

    if (!tabela) return;

    const clientes = carregar("clientesERP");

    tabela.innerHTML = "";

    clientes.forEach((cliente, indice) => {

        const tr = document.createElement("tr");

        tr.dataset.id = cliente.id;

        const status = cliente.status || "Ativo";

        tr.innerHTML = `
            <td>${indice + 1}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.cpf || "-"}</td>
            <td>${cliente.telefone || "-"}</td>
            <td>${cliente.cidade || "-"}</td>
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

    atualizarEventosClientes();

    atualizarCardsClientes(clientes);

}

function atualizarCardsClientes(clientes) {

    const total = clientes.length;
    const ativos = clientes.filter(c => (c.status || "Ativo") === "Ativo").length;
    const inativos = total - ativos;
    const creditoLiberado = clientes.reduce((soma, c) => soma + Number(c.limiteCredito || 0), 0);

    const cardTotal = document.getElementById("cardTotalClientes");
    const cardAtivos = document.getElementById("cardClientesAtivos");
    const cardInativos = document.getElementById("cardClientesInativos");
    const cardCredito = document.getElementById("cardCreditoLiberado");

    if (cardTotal) cardTotal.textContent = total;
    if (cardAtivos) cardAtivos.textContent = ativos;
    if (cardInativos) cardInativos.textContent = inativos;
    if (cardCredito) cardCredito.textContent = formatarMoeda(creditoLiberado);

}
