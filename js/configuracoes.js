// ======================================================
// ERP CRÉDITO
// MÓDULO CONFIGURAÇÕES
// ======================================================


document.addEventListener("DOMContentLoaded", () => {


    carregarConfiguracoes();


    const btnSalvar = document.getElementById("btnSalvar");

    const btnRestaurar = document.getElementById("btnRestaurar");

    const btnCancelar = document.getElementById("btnCancelar");


    btnSalvar.addEventListener("click", salvarConfiguracoes);


    btnRestaurar.addEventListener("click", restaurarPadrao);


    btnCancelar.addEventListener("click", cancelarAlteracoes);


    const btnEnviarNuvem = document.getElementById("btnEnviarNuvem");
    const btnBuscarNuvem = document.getElementById("btnBuscarNuvem");

    btnEnviarNuvem?.addEventListener("click", () => CloudSync.enviarTudoAgora());
    btnBuscarNuvem?.addEventListener("click", () => CloudSync.buscarTudoAgora());



    configurarLogo();


});



// ======================================================
// SALVAR CONFIGURAÇÕES
// ======================================================


function salvarConfiguracoes(){


    const senha = document.getElementById("novaSenha").value;

    const confirmar =
        document.getElementById("confirmarSenha").value;



    if(senha !== confirmar){

        mostrarMensagem(
            "As senhas não conferem.",
            "erro"
        );

        return;

    }



    const configuracoes = {


        empresa:{


            razaoSocial:
            valor("razaoSocial"),


            nomeFantasia:
            valor("nomeFantasia"),


            cnpj:
            valor("cnpj"),


            inscricao:
            valor("inscricao"),


            endereco:
            valor("endereco"),


            numero:
            valor("numero"),


            bairro:
            valor("bairro"),


            cidade:
            valor("cidade"),


            estado:
            valor("estado"),


            cep:
            valor("cep"),


            telefone:
            valor("telefone"),


            whatsapp:
            valor("whatsapp"),


            email:
            valor("email"),


            site:
            valor("site")

        },


        financeiro:{


            juros:
            valor("jurosPadrao"),


            multa:
            valor("multa"),


            mora:
            valor("mora"),


            carencia:
            valor("carencia"),


            minimo:
            valor("valorMinimo"),


            maximo:
            valor("valorMaximo")

        },


        sistema:{


            nome:
            valor("nomeSistema"),


            sessao:
            valor("tempoSessao")

        }


    };



    localStorage.setItem(

        "erpConfiguracoes",

        JSON.stringify(configuracoes)

    );



    mostrarMensagem(

        "Configurações salvas com sucesso.",

        "sucesso"

    );


}



// ======================================================
// CARREGAR CONFIGURAÇÕES
// ======================================================


function carregarConfiguracoes(){


    const dados =
        localStorage.getItem("erpConfiguracoes");



    if(!dados){

        return;

    }



    const configuracoes =
        JSON.parse(dados);



    preencherCampos(

        configuracoes

    );


}



// ======================================================
// PREENCHER CAMPOS
// ======================================================


function preencherCampos(config){


    if(config.empresa){


        Object.keys(config.empresa)

        .forEach(campo=>{


            colocarValor(

                campo,

                config.empresa[campo]

            );


        });


    }



    if(config.financeiro){


        colocarValor(
            "jurosPadrao",
            config.financeiro.juros
        );


        colocarValor(
            "multa",
            config.financeiro.multa
        );


        colocarValor(
            "mora",
            config.financeiro.mora
        );


        colocarValor(
            "carencia",
            config.financeiro.carencia
        );


        colocarValor(
            "valorMinimo",
            config.financeiro.minimo
        );


        colocarValor(
            "valorMaximo",
            config.financeiro.maximo
        );


    }



    if(config.sistema){


        colocarValor(
            "nomeSistema",
            config.sistema.nome
        );


        colocarValor(
            "tempoSessao",
            config.sistema.sessao
        );


    }



}



// ======================================================
// RESTAURAR PADRÃO
// ======================================================


function restaurarPadrao(){



    if(!confirm(

        "Deseja restaurar as configurações padrão?"

    )){

        return;

    }



    document.querySelectorAll(

        ".campo input"

    ).forEach(input=>{


        if(!input.readOnly){

            input.value="";

        }


    });



    document.getElementById("tempoSessao").value="30";



    localStorage.removeItem(

        "erpConfiguracoes"

    );



    mostrarMensagem(

        "Configurações restauradas.",

        "sucesso"

    );


}



// ======================================================
// CANCELAR
// ======================================================


function cancelarAlteracoes(){


    carregarConfiguracoes();



    mostrarMensagem(

        "Alterações canceladas.",

        "erro"

    );


}



// ======================================================
// LOGO
// ======================================================


function configurarLogo(){


    const input =
        document.getElementById("logoEmpresa");



    if(!input){

        return;

    }



    input.addEventListener(

        "change",

        function(){


            const arquivo =
                this.files[0];



            if(arquivo){


                localStorage.setItem(

                    "logoERP",

                    arquivo.name

                );


                mostrarMensagem(

                    "Logo selecionado.",

                    "sucesso"

                );


            }


        }

    );


}



// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================


function valor(id){


    return document.getElementById(id).value;


}



function colocarValor(id,valor){


    const campo =
        document.getElementById(id);



    if(campo){

        campo.value = valor || "";

    }


}



function mostrarMensagem(texto,tipo){



    const mensagem =
        document.createElement("div");



    mensagem.className =
        "mensagem " + tipo;



    mensagem.innerHTML = texto;



    document.querySelector(".content")

    .prepend(mensagem);



    setTimeout(()=>{


        mensagem.remove();


    },3000);



}