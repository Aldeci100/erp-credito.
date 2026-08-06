// =====================================================
// CLOUD SYNC
// =====================================================
// Camada de sincronização com a nuvem (Firestore), colocada POR BAIXO
// do localStorage — nenhuma página (dashboard.js, clientes.js, etc.)
// precisa saber que a nuvem existe. Elas continuam lendo/gravando no
// localStorage exatamente como sempre fizeram; esse arquivo cuida de
// manter o localStorage sincronizado com o Firestore por trás dos
// panos:
//
// 1. Ao abrir a página: confere login, busca os dados mais recentes da
//    nuvem (só sobrescrevendo o que estiver desatualizado — nunca troca
//    um dado local mais novo por um mais velho da nuvem) e só DEPOIS
//    carrega core.js/menu.js/o script da página.
// 2. Enquanto a página está aberta: qualquer gravação feita no
//    localStorage (de qualquer arquivo) é enviada pra nuvem NA HORA,
//    sem atraso — porque esse sistema faz navegação de página inteira
//    a cada ação (salvar → alerta → redireciona pra outra página), e
//    um atraso destruiria o envio antes dele completar.
// 3. A cada 20s, confere se algum OUTRO aparelho salvou algo mais novo
//    e, se sim, recarrega a página pra refletir.

window.CloudSync = (function () {

    const CHAVES_SINCRONIZADAS = [
        "clientesERP",
        "parceirosERP",
        "emprestimosERP",
        "recebimentosERP",
        "historicoRecebimentosERP",
        "caixaERP"
    ];

    const CAMINHO_LOGIN = "../index.html";

    // Fica "true" só durante o instante em que estamos GRAVANDO dados
    // que acabaram de chegar da nuvem — evita que essa própria gravação
    // seja interpretada como "o usuário mudou algo" e mande de volta.
    let aplicandoDadosDaNuvem = false;

    let temporizadorVerificacao = null;

    // ------------------------------
    // OVERLAY DE CARREGAMENTO
    // ------------------------------

    function mostrarOverlay() {

        const overlay = document.createElement("div");

        overlay.id = "cloudSyncOverlay";

        overlay.style.cssText =
            "position:fixed;inset:0;background:#0f172a;color:#fff;" +
            "display:flex;align-items:center;justify-content:center;" +
            "flex-direction:column;gap:14px;z-index:99999;" +
            "font:600 16px/1.4 system-ui,-apple-system,sans-serif;";

        overlay.innerHTML =
            '<div style="width:38px;height:38px;border:4px solid rgba(255,255,255,.25);' +
            'border-top-color:#fff;border-radius:50%;animation:cloudSyncGiro .8s linear infinite;"></div>' +
            '<div>Sincronizando seus dados...</div>' +
            '<style>@keyframes cloudSyncGiro{to{transform:rotate(360deg)}}</style>';

        document.body.appendChild(overlay);

    }

    function removerOverlay() {

        const overlay = document.getElementById("cloudSyncOverlay");

        if (overlay) overlay.remove();

    }

    // ------------------------------
    // CARREGAR OS SCRIPTS DA PÁGINA (só depois de sincronizar)
    // ------------------------------

    function carregarScriptsEmSequencia(nomes, indice) {

        indice = indice || 0;

        if (indice >= nomes.length) return;

        const script = document.createElement("script");

        script.src = "../js/" + nomes[indice];

        script.onload = function () {

            // Os scripts das páginas (menu.js, dashboard.js, etc.)
            // esperam pelo evento "DOMContentLoaded" pra rodar — mas
            // como eles só são inseridos DEPOIS que a página já
            // carregou (de propósito, pra esperar a sincronização),
            // esse evento já disparou antes deles existirem. Disparar
            // de novo aqui, manualmente, faz esses listeners rodarem
            // normalmente, sem precisar alterar nenhum desses arquivos.
            document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true, cancelable: true }));

            carregarScriptsEmSequencia(nomes, indice + 1);

        };

        document.body.appendChild(script);

    }

    // ------------------------------
    // NUVEM → LOCAL
    // ------------------------------

    // "forcar=true" ignora a proteção contra sobrescrever e traz o que
    // estiver na nuvem de qualquer jeito — usado só no botão manual
    // "Buscar dados da nuvem agora", onde é o próprio usuário pedindo
    // explicitamente pra atualizar. A busca automática (ao abrir a
    // página, e a checagem periódica) continua protegida.
    async function puxarDadosDaNuvem(forcar) {

        if (!firebaseDb) return;

        aplicandoDadosDaNuvem = true;

        try {

            const snapshot = await firebaseDb.collection("dados")
                .where(firebase.firestore.FieldPath.documentId(), "in", CHAVES_SINCRONIZADAS)
                .get();

            snapshot.forEach(function (doc) {

                const info = doc.data();
                const tsRemoto = Number(info.atualizadoEm || 0);
                const tsLocal = Number(localStorage.getItem("_syncTs_" + doc.id) || 0);

                // Só sobrescreve o que já está salvo localmente se a
                // nuvem tiver algo de fato mais novo. Sem essa conferência,
                // uma gravação local que ainda não terminou de subir
                // (ex: acabou de criar um contrato e a página já mudou)
                // podia ser apagada por uma busca que chega logo depois
                // trazendo a versão antiga da nuvem.
                if (forcar || tsRemoto > tsLocal) {
                    localStorage.setItem(doc.id, info.conteudo || "[]");
                    localStorage.setItem("_syncTs_" + doc.id, String(tsRemoto));
                }

            });

        } catch (erro) {

            console.error("CloudSync: falha ao buscar dados da nuvem.", erro);

        }

        aplicandoDadosDaNuvem = false;

    }

    // ------------------------------
    // LOCAL → NUVEM
    // ------------------------------

    async function enviarChaveParaNuvem(chave) {

        if (!firebaseDb) return;

        const conteudo = localStorage.getItem(chave) || "[]";
        const agora = Date.now();

        try {

            await firebaseDb.collection("dados").doc(chave).set({
                conteudo: conteudo,
                atualizadoEm: agora
            });

            localStorage.setItem("_syncTs_" + chave, String(agora));

        } catch (erro) {

            console.error("CloudSync: falha ao enviar " + chave + " para a nuvem.", erro);

        }

    }

    // Substitui o localStorage.setItem nativo por uma versão que,
    // depois de gravar local normalmente, também envia pra nuvem NA
    // HORA — sem precisar alterar nenhum dos arquivos que já chamam
    // localStorage.setItem hoje. Antes isso tinha um atraso (debounce)
    // de 2s, mas como o sistema troca de página inteira logo depois de
    // salvar (salvar → alerta → redireciona), esse atraso fazia o envio
    // ser cancelado pela navegação antes de sair — perdendo o dado que
    // acabou de ser criado. Envio imediato resolve isso.
    function ativarInterceptacaoDeGravacao() {

        const setItemOriginal = localStorage.setItem.bind(localStorage);

        localStorage.setItem = function (chave, valor) {

            setItemOriginal(chave, valor);

            if (!aplicandoDadosDaNuvem && CHAVES_SINCRONIZADAS.indexOf(chave) !== -1) {
                enviarChaveParaNuvem(chave);
            }

        };

    }

    // ------------------------------
    // DETECTAR MUDANÇA FEITA EM OUTRO APARELHO
    // ------------------------------

    async function verificarAtualizacoesRemotas() {

        if (!firebaseDb) return;

        try {

            const snapshot = await firebaseDb.collection("dados")
                .where(firebase.firestore.FieldPath.documentId(), "in", CHAVES_SINCRONIZADAS)
                .get();

            let houveMudancaExterna = false;

            snapshot.forEach(function (doc) {

                const tsRemoto = Number(doc.data().atualizadoEm || 0);
                const tsLocal = Number(localStorage.getItem("_syncTs_" + doc.id) || 0);

                if (tsRemoto > tsLocal) {
                    houveMudancaExterna = true;
                }

            });

            if (houveMudancaExterna) {
                location.reload();
            }

        } catch (erro) {

            console.error("CloudSync: falha ao verificar atualizações remotas.", erro);

        }

    }

    function iniciarVerificacaoPeriodica() {

        temporizadorVerificacao = setInterval(verificarAtualizacoesRemotas, 20000);

    }

    // ------------------------------
    // AÇÕES MANUAIS (botões em Configurações)
    // ------------------------------

    async function enviarTudoAgora() {

        if (!firebaseDb) {
            alert("A nuvem ainda não está configurada.");
            return;
        }

        for (const chave of CHAVES_SINCRONIZADAS) {
            await enviarChaveParaNuvem(chave);
        }

        alert("Dados enviados para a nuvem com sucesso.");

    }

    async function buscarTudoAgora() {

        if (!firebaseDb) {
            alert("A nuvem ainda não está configurada.");
            return;
        }

        await puxarDadosDaNuvem(true);

        alert("Dados atualizados a partir da nuvem.");

        location.reload();

    }

    // ------------------------------
    // PONTO DE ENTRADA DE CADA PÁGINA
    // ------------------------------

    function iniciar(scripts) {

        if (!firebaseConfigurado) {

            // Nuvem ainda não configurada: segue funcionando 100% local,
            // exatamente como antes.
            carregarScriptsEmSequencia(scripts, 0);
            return;

        }

        mostrarOverlay();

        firebaseAuth.onAuthStateChanged(async function (usuario) {

            if (!usuario) {
                location.href = CAMINHO_LOGIN;
                return;
            }

            await puxarDadosDaNuvem();

            ativarInterceptacaoDeGravacao();
            iniciarVerificacaoPeriodica();

            removerOverlay();

            carregarScriptsEmSequencia(scripts, 0);

        });

    }

    return {
        iniciar: iniciar,
        enviarTudoAgora: enviarTudoAgora,
        buscarTudoAgora: buscarTudoAgora
    };

})();
