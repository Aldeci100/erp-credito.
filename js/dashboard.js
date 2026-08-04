document.addEventListener("DOMContentLoaded", function () {

    const filtroMes = document.getElementById("filtroMesDashboard");

    if (filtroMes) {

        filtroMes.value = obterHojeISO().slice(0, 7);

        filtroMes.addEventListener("change", function () {

            const mes = this.value || obterHojeISO().slice(0, 7);

            atualizarRecebidoMes(mes);
            atualizarJurosAReceberMes(mes);
            atualizarJurosPorParceiro(mes);

        });

    }

    atualizarDashboard();

});

function atualizarDashboard() {

    atualizarStatusRecebimentos();

    const clientes = carregar("clientesERP");
    const parceiros = carregar("parceirosERP");
    const emprestimos = carregar("emprestimosERP");
    const recebimentos = carregar("recebimentosERP");

    const filtroMes = document.getElementById("filtroMesDashboard");
    const mesSelecionado = filtroMes?.value || obterHojeISO().slice(0, 7);

    atualizarCardClientes(clientes);
atualizarCardParceiros(parceiros);
atualizarCapitalEmprestado(emprestimos);
atualizarCapitalAberto(emprestimos);
atualizarContratosAtivos(emprestimos);
atualizarReceberHoje(recebimentos);
atualizarRecebidoMes(mesSelecionado);
atualizarJurosAReceberMes(mesSelecionado);
atualizarJurosPorParceiro(mesSelecionado);
atualizarComissaoParceiros(emprestimos, parceiros);
atualizarContratosAtrasados(recebimentos);
atualizarAtrasados(recebimentos);
carregarUltimosEmprestimos(emprestimos);
atualizarResumo(recebimentos);
carregarGraficoFinanceiro(emprestimos, recebimentos);

}

function atualizarCardClientes(clientes){

    document.getElementById("cardClientes").textContent =
        clientes.length;

}

function atualizarCardParceiros(parceiros){

    document.getElementById("cardParceiros").textContent =
        parceiros.length;

}

function atualizarCapitalEmprestado(emprestimos){

    let total = 0;

    emprestimos.forEach(function(item){

        total += Number(item.valor || 0);

    });

    document.getElementById("cardCapital").textContent =
        formatarMoeda(total);

}

function atualizarCapitalAberto(emprestimos){

    // Soma do saldo devedor ATUAL (só o principal, sem juros) de todos
    // os contratos. Cai a cada amortização recebida, e chega a zero
    // quando o contrato é totalmente quitado.
    // Usa baseComissao() em vez de "saldoDevedor || 0" de propósito: se
    // o campo estiver ausente (contrato editado antes da correção que
    // parava de apagar esse valor), cai pro valor original do contrato
    // em vez de tratar como zero — bem mais seguro que subestimar o
    // que ainda falta receber.
    let total = 0;

    emprestimos.forEach(function(item){

        total += baseComissao(item);

    });

    document.getElementById("cardCapitalAberto").textContent =
        formatarMoeda(total);

}

function atualizarReceberHoje(recebimentos){

    const hoje = obterHojeISO();

    let total = 0;

    recebimentos.forEach(function(item){

        if(item.vencimento === hoje && item.status === "Pendente"){

            total += Number(item.saldoDevedor || 0);

        }

    });

    document.getElementById("cardReceberHoje").textContent =
        formatarMoeda(total);

}


function atualizarAtrasados(recebimentos){

    let total = 0;

    recebimentos.forEach(function(item){

        if(item.status === "Atrasado"){

            total++;

        }

    });

    document.getElementById("cardAtrasados").textContent =
        total;

}

function atualizarContratosAtivos(emprestimos){

    let total = 0;

    emprestimos.forEach(function(item){

        if(item.status === "Ativo"){

            total++;

        }

    });

    document.getElementById("cardContratosAtivos").textContent =
        total;

}

function atualizarContratosAtrasados(recebimentos){

    const contratos = new Set();

    recebimentos.forEach(function(item){

        if(item.status === "Atrasado"){

            contratos.add(item.contrato);

        }

    });

    document.getElementById("cardContratosAtrasados").textContent =
        contratos.size;

}

function atualizarRecebidoMes(mesFiltro){

    const historico =
        carregar("historicoRecebimentosERP");

    // "aaaa-mm" do mês selecionado no filtro, ou do mês atual se nada
    // foi selecionado ainda.
    const mesAlvo = mesFiltro || obterHojeISO().slice(0, 7);

    let total = 0;
    let totalJuros = 0;
    let totalCapital = 0;

    historico.forEach(function(item){

        // Comparação por string "aaaa-mm" (não usar new Date(string),
        // que sofre deslocamento de fuso horário e pode jogar um
        // pagamento pro mês errado).
        if (item.dataPagamento && item.dataPagamento.slice(0, 7) === mesAlvo) {

            total += Number(item.valorRecebido || 0);

            // "jurosPago" é a parte do recebimento referente a juros e
            // "amortizacao" é a parte que abateu o capital (o principal)
            // emprestado — os dois juntos compõem o valor total recebido.
            totalJuros += Number(item.jurosPago || 0);
            totalCapital += Number(item.amortizacao || 0);

        }

    });

    document.getElementById("cardRecebidoMes").textContent =
        formatarMoeda(total);

    const cardJuros = document.getElementById("cardJurosRecebidoMes");
    const cardCapital = document.getElementById("cardCapitalRecebidoMes");

    if (cardJuros) cardJuros.textContent = formatarMoeda(totalJuros);
    if (cardCapital) cardCapital.textContent = formatarMoeda(totalCapital);

}

// Juros do DONO (o total de juros menos a comissão do parceiro) de
// todos os contratos ativos no mês selecionado — diferente de "Juros
// Recebidos no Mês", que é o que já entrou de verdade.
//
// Antes essa conta dependia da parcela em recebimentosERP ter o
// "vencimento" caindo exatamente dentro do mês selecionado. Na prática
// isso subestimava o total: todo contrato ativo gera juros todo mês,
// mesmo que a parcela dele no sistema ainda não tenha sido "empurrada"
// pro mês certo. Agora soma direto pelos contratos (igual a "Comissão a
// Pagar aos Parceiros" já fazia), usando a MESMA base (saldo devedor do
// contrato, via baseComissao) — assim os dois cards sempre batem entre
// si e com o total geral.
function atualizarJurosAReceberMes(mesFiltro){

    const mesAlvo = mesFiltro || obterHojeISO().slice(0, 7);

    const emprestimos = carregar("emprestimosERP");
    const parceiros = carregar("parceirosERP");

    let total = 0;

    emprestimos.forEach(function(emprestimo){

        if (emprestimo.status === "Quitado") return;

        // Só entra se o contrato já existia até o mês selecionado (não
        // faz sentido cobrar juros de agosto de um contrato assinado em
        // setembro, por exemplo).
        if (emprestimo.dataContrato && emprestimo.dataContrato.slice(0, 7) > mesAlvo) return;

        const saldo = baseComissao(emprestimo);
        const taxaTotal = Number(emprestimo.juros || 0);
        const jurosTotal = saldo * (taxaTotal / 100);

        let jurosParceiro = 0;

        const parceiro = parceiros.find(p => nomesIguais(p.nome, emprestimo.parceiro));

        if (parceiro) {
            jurosParceiro = jurosParceiroContrato(emprestimo, parceiro);
        }

        total += Math.max(jurosTotal - jurosParceiro, 0);

    });

    const card = document.getElementById("cardJurosAReceberMes");

    if (card) card.textContent = formatarMoeda(total);

}

// Mesma conta de "Juros a Receber no Mês (Dono)", só que detalhada
// parceiro por parceiro — cada linha mostra o juro total daquele
// parceiro no mês, quanto fica com o dono e quanto fica de comissão
// com o parceiro. A linha de total geral bate com o card acima.
function atualizarJurosPorParceiro(mesFiltro){

    const tbody = document.getElementById("listaJurosPorParceiro");

    if (!tbody) return;

    const mesAlvo = mesFiltro || obterHojeISO().slice(0, 7);

    const emprestimos = carregar("emprestimosERP");
    const parceiros = carregar("parceirosERP");

    const grupos = {};

    function grupoDe(chave, nome) {

        if (!grupos[chave]) {
            grupos[chave] = { nome, total: 0, dono: 0, parceiro: 0 };
        }

        return grupos[chave];

    }

    emprestimos.forEach(function(emprestimo){

        if (emprestimo.status === "Quitado") return;
        if (emprestimo.dataContrato && emprestimo.dataContrato.slice(0, 7) > mesAlvo) return;

        const saldo = baseComissao(emprestimo);
        const taxaTotal = Number(emprestimo.juros || 0);
        const jurosTotal = saldo * (taxaTotal / 100);

        const parceiro = emprestimo.parceiro
            ? parceiros.find(p => nomesIguais(p.nome, emprestimo.parceiro))
            : null;

        let jurosParceiro = 0;

        if (parceiro) {
            jurosParceiro = jurosParceiroContrato(emprestimo, parceiro);
        }

        const jurosDono = Math.max(jurosTotal - jurosParceiro, 0);

        const chave = parceiro
            ? String(parceiro.nome).trim().toLowerCase()
            : "__sem_parceiro__";

        const nomeExibido = parceiro ? parceiro.nome : "— Sem parceiro —";

        const grupo = grupoDe(chave, nomeExibido);

        grupo.total += jurosTotal;
        grupo.dono += jurosDono;
        grupo.parceiro += jurosParceiro;

    });

    const linhas = Object.values(grupos).sort((a, b) => b.total - a.total);

    tbody.innerHTML = "";

    let totalGeral = 0, donoGeral = 0, parceiroGeral = 0;

    if (linhas.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:14px;">
                    Nenhum juros a receber neste mês.
                </td>
            </tr>
        `;

    } else {

        linhas.forEach(function (l) {

            totalGeral += l.total;
            donoGeral += l.dono;
            parceiroGeral += l.parceiro;

            tbody.innerHTML += `
                <tr>
                    <td style="padding:10px;">${l.nome}</td>
                    <td style="padding:10px; text-align:right;">${formatarMoeda(l.total)}</td>
                    <td style="padding:10px; text-align:right;">${formatarMoeda(l.dono)}</td>
                    <td style="padding:10px; text-align:right;">${formatarMoeda(l.parceiro)}</td>
                </tr>
            `;

        });

    }

    const elTotal = document.getElementById("totalJurosPorParceiroTotal");
    const elDono = document.getElementById("totalJurosPorParceiroDono");
    const elParceiro = document.getElementById("totalJurosPorParceiroParceiro");

    if (elTotal) elTotal.textContent = formatarMoeda(totalGeral);
    if (elDono) elDono.textContent = formatarMoeda(donoGeral);
    if (elParceiro) elParceiro.textContent = formatarMoeda(parceiroGeral);

}

// Soma das comissões de todos os parceiros que ainda não foram dadas
// baixa (situação "Pendente" ou "Atrasado"), calculada sobre o saldo
// devedor atual de cada contrato.
function atualizarComissaoParceiros(emprestimos, parceiros){

    let total = 0;

    emprestimos.forEach(function(emprestimo){

        if (situacaoComissao(emprestimo) === "Pago") return;

        const parceiro = parceiros.find(p => nomesIguais(p.nome, emprestimo.parceiro));

        if (!parceiro) return;

        total += jurosParceiroContrato(emprestimo, parceiro);

    });

    const card = document.getElementById("cardComissaoParceiros");

    if (card) card.textContent = formatarMoeda(total);

}

function carregarUltimosEmprestimos(emprestimos){

    const tbody =
        document.getElementById("listaUltimosEmprestimos");

    if(!tbody) return;

    tbody.innerHTML = "";

    const lista = [...emprestimos];

    lista.sort(function(a, b){

        return Number(b.contrato) - Number(a.contrato);

    });

    lista.slice(0,5).forEach(function(item){

        let classeStatus = "ok";

        if(item.status === "Em Atraso"){

            classeStatus = "atraso";

        }

       tbody.innerHTML += `

    <tr>

        <td>${item.contrato}</td>

        <td>${item.cliente}</td>

        <td>${formatarMoeda(Number(item.valor || 0))}</td>

        <td>

            <span class="status ${classeStatus}">

                ${item.status}

            </span>

        </td>

    </tr>

`;

    });

}
function atualizarResumo(recebimentos){

    const hoje = new Date();

    hoje.setHours(0,0,0,0);

    const amanha = new Date(hoje);

    amanha.setDate(amanha.getDate() + 1);

    const historico =
        carregar("historicoRecebimentosERP");

    let recebidoHoje = 0;

    historico.forEach(function(item){

        const data =
            new Date(item.dataPagamento);

        data.setHours(0,0,0,0);

        if(data.getTime() === hoje.getTime()){

            recebidoHoje +=
                Number(item.valorRecebido || 0);

        }

    });

    let receberAmanha = 0;

    let contratosAtraso = 0;

    recebimentos.forEach(function(item){

        const vencimento =
            new Date(item.vencimento);

        vencimento.setHours(0,0,0,0);

        if(
            vencimento.getTime() ===
            amanha.getTime() &&
            item.status !== "Quitado"
        ){

            receberAmanha +=
                Number(item.saldoDevedor || 0);

        }

        if(item.status === "Atrasado"){

            contratosAtraso++;

        }

    });

    document.getElementById("resumoRecebidoHoje").textContent =
        formatarMoeda(recebidoHoje);

    document.getElementById("resumoReceberAmanha").textContent =
        formatarMoeda(receberAmanha);

    document.getElementById("resumoContratosAtraso").textContent =
        contratosAtraso;

}

function carregarGraficoFinanceiro(emprestimos, recebimentos){

    const canvas = document.getElementById("graficoFinanceiro");

    if(!canvas) return;

    const totalEmprestado = emprestimos.reduce(function(total, item){

        return total + Number(item.valor || 0);

    }, 0);

    const historico = carregar("historicoRecebimentosERP");

const hoje = new Date();

const mesAtual = hoje.getMonth();

const anoAtual = hoje.getFullYear();

const totalRecebido = historico.reduce(function(total, item){

    const data = new Date(item.dataPagamento);

    if(
        data.getMonth() === mesAtual &&
        data.getFullYear() === anoAtual
    ){

        total += Number(item.valorRecebido || 0);

    }

    return total;

}, 0);

    if(window.graficoFinanceiroERP){

        window.graficoFinanceiroERP.destroy();

    }

    window.graficoFinanceiroERP = new Chart(canvas, {

        type: "bar",

        data: {

            labels: ["Capital Emprestado", "Capital Recebido"],

            datasets: [{

                label: "Valores",

                data: [totalEmprestado, totalRecebido],

                borderWidth: 1,
                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}