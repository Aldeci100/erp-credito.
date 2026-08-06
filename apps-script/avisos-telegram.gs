// =====================================================
// AVISOS DE PARCELA POR TELEGRAM - ERP CRÉDITO
// =====================================================
//
// Este arquivo NÃO roda sozinho aqui no projeto — é só a referência
// do que deve ser colado em https://script.google.com (Novo projeto).
// Apps Script só funciona rodando de lá, não a partir de um arquivo
// local.
//
// PASSO A PASSO PRA USAR:
// 1. Abra https://script.google.com → "Novo projeto".
// 2. Apague o conteúdo padrão (function myFunction(){}) e cole este
//    arquivo inteiro no lugar.
// 3. Preencha as constantes de configuração logo abaixo com os seus
//    valores reais (bot do Telegram + conta de serviço do Firebase).
// 4. Rode a função "verificarParcelas" uma vez manualmente (▶ no
//    topo, selecionando essa função) — o Google vai pedir autorização,
//    é normal, aceite.
// 5. Configure um gatilho (ícone de relógio "Acionadores" no menu
//    lateral) pra rodar "verificarParcelas" todo dia, no horário que
//    preferir.
//
// =====================================================
// CONFIGURAÇÃO — PREENCHA AQUI
// =====================================================

// --- Telegram (envio do aviso) ---
// Token que o @BotFather te deu ao criar o bot (algo como
// "123456789:ABCdefGhIJKlmNoPQRsTUVwxyz").
const TELEGRAM_BOT_TOKEN = "COLE_AQUI_O_TOKEN_DO_BOT";

// Seu chat_id no Telegram — o número que identifica sua conversa com
// o bot (veja no passo a passo como pegar isso).
const TELEGRAM_CHAT_ID = "COLE_AQUI_SEU_CHAT_ID";

// --- Firebase (leitura dos dados) ---
// ID do seu projeto Firebase (aparece no topo do Console, ex: "erp-credito").
const FIREBASE_PROJECT_ID = "erp-credito";

// Do arquivo .json baixado em Firebase Console → Configurações do
// Projeto → Contas de serviço → Gerar nova chave privada:
const FIREBASE_CLIENT_EMAIL = "COLE_AQUI_O_client_email_DO_JSON";
const FIREBASE_PRIVATE_KEY = "COLE_AQUI_O_private_key_DO_JSON";

// =====================================================
// NÃO PRECISA MEXER DAQUI PRA BAIXO
// =====================================================

// ------------------------------
// AUTENTICAÇÃO COM O FIREBASE (conta de serviço)
// ------------------------------

function base64UrlEncode_(bytesOuTexto) {

    return Utilities.base64EncodeWebSafe(bytesOuTexto).replace(/=+$/, "");

}

function obterTokenDeAcesso_() {

    const agora = Math.floor(Date.now() / 1000);

    const cabecalho = { alg: "RS256", typ: "JWT" };

    const corpo = {
        iss: FIREBASE_CLIENT_EMAIL,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        iat: agora,
        exp: agora + 3600
    };

    const entradaAssinatura =
        base64UrlEncode_(JSON.stringify(cabecalho)) + "." +
        base64UrlEncode_(JSON.stringify(corpo));

    // A chave privada vem do .json com "\n" escapado como texto — troca
    // pelas quebras de linha reais que a assinatura RSA espera.
    const chavePrivada = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

    const assinaturaBytes = Utilities.computeRsaSha256Signature(entradaAssinatura, chavePrivada);

    const jwt = entradaAssinatura + "." + base64UrlEncode_(assinaturaBytes);

    const resposta = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
        method: "post",
        contentType: "application/x-www-form-urlencoded",
        payload: {
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt
        },
        muteHttpExceptions: true
    });

    const dados = JSON.parse(resposta.getContentText());

    if (!dados.access_token) {
        throw new Error("Falha ao autenticar com o Firebase: " + resposta.getContentText());
    }

    return dados.access_token;

}

// ------------------------------
// BUSCAR OS RECEBIMENTOS NO FIRESTORE
// ------------------------------

function buscarRecebimentos_() {

    const token = obterTokenDeAcesso_();

    const url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID +
        "/databases/(default)/documents/dados/recebimentosERP";

    const resposta = UrlFetchApp.fetch(url, {
        method: "get",
        headers: { Authorization: "Bearer " + token },
        muteHttpExceptions: true
    });

    const dados = JSON.parse(resposta.getContentText());

    if (!dados.fields || !dados.fields.conteudo) {
        Logger.log("Nenhum recebimento encontrado na nuvem ainda.");
        return [];
    }

    const conteudoTexto = dados.fields.conteudo.stringValue || "[]";

    return JSON.parse(conteudoTexto);

}

// ------------------------------
// ENVIAR MENSAGEM PELO TELEGRAM
// ------------------------------

function enviarTelegram_(mensagem) {

    const url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";

    const resposta = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/x-www-form-urlencoded",
        payload: {
            chat_id: TELEGRAM_CHAT_ID,
            text: mensagem
        },
        muteHttpExceptions: true
    });

    Logger.log("Telegram: " + resposta.getResponseCode() + " " + resposta.getContentText());

}

function formatarMoeda_(valor) {

    return "R$ " + Number(valor || 0).toFixed(2).replace(".", ",");

}

// ------------------------------
// FUNÇÃO PRINCIPAL — é essa que vira o gatilho diário
// ------------------------------

function verificarParcelas() {

    const hojeISO = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");

    const recebimentos = buscarRecebimentos_();

    recebimentos.forEach(function (item) {

        if (item.status === "Quitado") return;

        const valor = item.valorJuros != null
            ? item.valorJuros
            : Number(item.saldoDevedor || 0) * (Number(item.taxaJuros || 0) / 100);

        if (item.vencimento === hojeISO) {

            enviarTelegram_(
                "🔔 Parcela vencendo hoje\n" +
                "Cliente: " + item.cliente + "\n" +
                "Contrato: " + item.contrato + "\n" +
                "Valor: " + formatarMoeda_(valor)
            );

        } else if (item.status === "Atrasado") {

            enviarTelegram_(
                "⚠️ Parcela atrasada\n" +
                "Cliente: " + item.cliente + "\n" +
                "Contrato: " + item.contrato + "\n" +
                "Vencimento: " + item.vencimento + "\n" +
                "Valor: " + formatarMoeda_(valor)
            );

        }

    });

}
