// =====================================
// LOGIN ERP CRÉDITO
// =====================================


document.addEventListener("DOMContentLoaded",()=>{


    const botao =
    document.querySelector(".btnLogin");


    botao.addEventListener("click",(e)=>{


        e.preventDefault();


        const usuario =
        document.querySelector(
            'input[type="email"]'
        ).value;



        const senha =
        document.querySelector(
            'input[type="password"]'
        ).value;




        if(usuario === "" || senha === ""){


            alert(
                "Informe usuário e senha."
            );


            return;

        }


        if (!firebaseConfigurado) {

            // Nuvem ainda não configurada: mantém o login local de
            // antes, só pra não travar o uso enquanto a config não
            // existir.
            localStorage.setItem("usuarioLogado", usuario);
            window.location.href = "pages/dashboard.html";
            return;

        }


        botao.disabled = true;
        botao.textContent = "Entrando...";

        firebaseAuth.signInWithEmailAndPassword(usuario, senha)

            .then(function () {

                window.location.href = "pages/dashboard.html";

            })

            .catch(function () {

                botao.disabled = false;
                botao.textContent = "ENTRAR";

                alert("Não foi possível entrar. Confira o e-mail e a senha.");

            });


    });



});