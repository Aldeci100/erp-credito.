// =====================================================
// FIREBASE - CONFIGURAÇÃO
// =====================================================
// Troque os valores abaixo pela configuração do SEU projeto Firebase
// (Console do Firebase → Configurações do projeto → Seus apps → SDK,
// ou tela de "Adicionar app da Web").
//
// Essas chaves são públicas por natureza no Firebase — não precisam
// ficar em segredo. A segurança de verdade vem das Regras do Firestore
// (só usuário autenticado lê/escreve), não de esconder essa config.

const firebaseConfig = {
    apiKey: "AIzaSyCh4lsaGeYIOZTfwkWtYyVUa9ZOh-L3fE8",
    authDomain: "erp-credito.firebaseapp.com",
    projectId: "erp-credito",
    storageBucket: "erp-credito.firebasestorage.app",
    messagingSenderId: "734792458269",
    appId: "1:734792458269:web:6f257aa5dfe020c22ea6f4"
};

// Enquanto a config acima continuar com o valor de exemplo, o sistema
// funciona 100% local (sem nuvem, sem login por e-mail) — do jeito que
// já funcionava. A sincronização só liga sozinha quando a config real
// for preenchida aqui.
const firebaseConfigurado = firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";

let firebaseAuth = null;
let firebaseDb = null;

if (firebaseConfigurado && window.firebase) {

    firebase.initializeApp(firebaseConfig);

    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();

}
