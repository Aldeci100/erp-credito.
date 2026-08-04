/* ======================================================
   ERP CRÉDITO
   MÓDULO CAIXA
====================================================== */

// Sobrescreve o formatarData de core.js (que usa new Date() e sofre
// deslocamento de fuso horário) por uma versão baseada em string,
// segura para os valores "yyyy-mm-dd" vindos de <input type="date">.
function formatarData(data) {

    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modalCaixa");

    const btnNovo = document.querySelector(".btnNovo");
    const btnFechar = document.querySelector(".fechar");
    const btnCancelar = document.querySelector(".btnCinza");

    const formulario = document.getElementById("formCaixa");
    const pesquisa = document.getElementById("pesquisaCaixa");

    /*=========================================
      MODAL
    =========================================*/

    function abrirModal() {

        modal.style.display = "flex";

    }

    function fecharModal() {

        modal.style.display = "none";
        formulario.reset();

    }

    btnNovo?.addEventListener("click", abrirModal);

    btnFechar?.addEventListener("click", fecharModal);

    btnCancelar?.addEventListener("click", fecharModal);

    window.addEventListener("click", (e) => {

        if (e.target === modal) {

            fecharModal();

        }

    });

    /*=========================================
      PESQUISA
    =========================================*/

    pesquisa?.addEventListener("keyup", function () {

        const texto = this.value.toLowerCase();

        document.querySelectorAll("#listaCaixa tr")
            .forEach(linha => {

                linha.style.display =
                    linha.innerText.toLowerCase().includes(texto)
                        ? ""
                        : "none";

            });

    });

    /*=========================================
      SALVAR MOVIMENTAÇÃO
    =========================================*/

    formulario.addEventListener("submit", function (e) {

        e.preventDefault();

        adicionarMovimentacao();

        fecharModal();

    });

    /*=========================================
      RENDERIZAÇÃO INICIAL
    =========================================*/

    renderizarTabelaCaixa();

});

/*======================================================
  ADICIONAR MOVIMENTAÇÃO
======================================================*/

function adicionarMovimentacao() {

    const tipo = document.getElementById("tipo").value;

    const categoria = document.getElementById("categoria").value;

    const cliente = document.getElementById("cliente").value || "-";

    const descricao = document.getElementById("descricao").value;

    const valor = Number(document.getElementById("valor").value);

    const forma = document.getElementById("formaPagamento").value;

    const data = document.getElementById("dataMovimento").value;

    const observacao = document.getElementById("observacao").value;

    if (!descricao || !valor || !data) {

        alert("Preencha todos os campos obrigatórios.");

        return;

    }

    const caixa = carregar("caixaERP");

    caixa.push({

        id: gerarId(),
        tipo,
        categoria,
        cliente,
        descricao,
        valor,
        forma,
        data,
        observacao

    });

    salvar("caixaERP", caixa);

    renderizarTabelaCaixa();

    alert("Movimentação cadastrada com sucesso.");

}

/*======================================================
  RENDERIZAR TABELA
======================================================*/

function renderizarTabelaCaixa() {

    const tabela = document.getElementById("listaCaixa");

    if (!tabela) return;

    const caixa = carregar("caixaERP")
        .slice()
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    let saldo = 0;

    tabela.innerHTML = "";

    caixa.forEach(item => {

        const valor = Number(item.valor || 0);

        saldo += item.tipo === "Entrada" ? valor : -valor;

        const tr = document.createElement("tr");

        tr.dataset.id = item.id;

        tr.innerHTML = `

            <td>${formatarData(item.data)}</td>

            <td>
                <span class="status ${item.tipo.toLowerCase()}">
                    ${item.tipo}
                </span>
            </td>

            <td>${item.descricao}</td>

            <td>${item.cliente || "-"}</td>

            <td>${item.categoria || "-"}</td>

            <td>${item.forma || "-"}</td>

            <td>${formatarMoeda(valor)}</td>

            <td>${formatarMoeda(saldo)}</td>

            <td>
                <button class="acao visualizar" title="Visualizar">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="acao excluir" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>

        `;

        tabela.appendChild(tr);

    });

    atualizarEventosCaixa();

    atualizarCardsCaixa(caixa, saldo);

}

/*======================================================
  EVENTOS DA TABELA
======================================================*/

function atualizarEventosCaixa() {

    document.querySelectorAll("#listaCaixa .visualizar")
        .forEach(botao => {

            botao.onclick = function () {

                const descricao =
                    this.closest("tr").cells[2].innerText;

                alert("Visualizando:\n\n" + descricao);

            };

        });

    document.querySelectorAll("#listaCaixa .excluir")
        .forEach(botao => {

            botao.onclick = function () {

                const linha = this.closest("tr");
                const id = Number(linha.dataset.id);

                if (!confirm("Deseja excluir esta movimentação?")) return;

                let caixa = carregar("caixaERP");

                caixa = caixa.filter(item => item.id !== id);

                salvar("caixaERP", caixa);

                renderizarTabelaCaixa();

            };

        });

}

/*======================================================
  CARDS
======================================================*/

function atualizarCardsCaixa(caixa, saldoAtual) {

    const hoje = new Date().toLocaleDateString("pt-BR");

    let entradasDia = 0;
    let saidasDia = 0;

    caixa.forEach(item => {

        if (formatarData(item.data) !== hoje) return;

        const valor = Number(item.valor || 0);

        if (item.tipo === "Entrada") {
            entradasDia += valor;
        } else {
            saidasDia += valor;
        }

    });

    const cardSaldoAtual = document.getElementById("cardSaldoAtual");
    const cardEntradasDia = document.getElementById("cardEntradasDia");
    const cardSaidasDia = document.getElementById("cardSaidasDia");
    const cardSaldoPrevisto = document.getElementById("cardSaldoPrevisto");

    const recebimentos = carregar("recebimentosERP");

    const previsto = recebimentos
        .filter(r => r.status !== "Quitado")
        .reduce((total, r) => total + Number(r.saldoDevedor || 0), 0);

    if (cardSaldoAtual) cardSaldoAtual.textContent = formatarMoeda(saldoAtual);
    if (cardEntradasDia) cardEntradasDia.textContent = formatarMoeda(entradasDia);
    if (cardSaidasDia) cardSaidasDia.textContent = formatarMoeda(saidasDia);
    if (cardSaldoPrevisto) cardSaldoPrevisto.textContent = formatarMoeda(saldoAtual + previsto);

}
