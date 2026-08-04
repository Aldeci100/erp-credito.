// =====================================================
// ERP CRÉDITO
// MÓDULO PERFIL
// =====================================================


document.addEventListener("DOMContentLoaded",()=>{


    carregarPerfil();


    configurarEventos();


});



// =====================================================
// DADOS PADRÃO
// =====================================================


let perfilUsuario = {


    nome:"Carlos Almeida",

    login:"carlos",

    email:"carlos@email.com",

    telefone:"(92) 99999-0000",

    perfil:"Administrador",

    status:"Ativo",

    tema:"claro",

    notificacaoCobranca:true,

    alertas:true


};



// =====================================================
// CARREGAR PERFIL
// =====================================================


function carregarPerfil(){


    const dados =
        localStorage.getItem("perfilERP");



    if(dados){

        perfilUsuario =
            JSON.parse(dados);

    }



    preencherDados();


}



// =====================================================
// PREENCHER TELA
// =====================================================


function preencherDados(){



    document.getElementById("nomePerfil").value =
        perfilUsuario.nome;



    document.getElementById("loginPerfil").value =
        perfilUsuario.login;



    document.getElementById("emailPerfil").value =
        perfilUsuario.email;



    document.getElementById("telefonePerfil").value =
        perfilUsuario.telefone;



    document.getElementById("nomeExibicao").innerHTML =
        perfilUsuario.nome;



    document.getElementById("temaSistema").value =
        perfilUsuario.tema;



    document.getElementById("notificacaoCobranca").checked =
        perfilUsuario.notificacaoCobranca;



    document.getElementById("alertasSistema").checked =
        perfilUsuario.alertas;


}



// =====================================================
// EVENTOS
// =====================================================


function configurarEventos(){



    document

    .getElementById("salvarPerfil")

    .addEventListener(

        "click",

        salvarPerfil

    );




    document

    .getElementById("cancelarPerfil")

    .addEventListener(

        "click",

        cancelarPerfil

    );




    document

    .getElementById("fotoUsuario")

    .addEventListener(

        "change",

        alterarFoto

    );



}



// =====================================================
// SALVAR
// =====================================================


function salvarPerfil(){



    const novaSenha =

    document.getElementById(

        "novaSenhaPerfil"

    ).value;




    const confirmar =

    document.getElementById(

        "confirmarSenhaPerfil"

    ).value;




    if(novaSenha !== confirmar){


        alert(

            "As senhas não conferem."

        );


        return;

    }




    perfilUsuario.nome =

    document.getElementById(

        "nomePerfil"

    ).value;




    perfilUsuario.email =

    document.getElementById(

        "emailPerfil"

    ).value;




    perfilUsuario.telefone =

    document.getElementById(

        "telefonePerfil"

    ).value;




    perfilUsuario.tema =

    document.getElementById(

        "temaSistema"

    ).value;




    perfilUsuario.notificacaoCobranca =

    document.getElementById(

        "notificacaoCobranca"

    ).checked;




    perfilUsuario.alertas =

    document.getElementById(

        "alertasSistema"

    ).checked;




    localStorage.setItem(

        "perfilERP",

        JSON.stringify(perfilUsuario)

    );



    document.getElementById(

        "nomeExibicao"

    ).innerHTML = perfilUsuario.nome;



    alert(

        "Perfil atualizado com sucesso."

    );



    limparSenha();



}



// =====================================================
// CANCELAR
// =====================================================


function cancelarPerfil(){


    preencherDados();


    limparSenha();



    alert(

        "Alterações canceladas."

    );



}



// =====================================================
// FOTO
// =====================================================


function alterarFoto(event){



    const arquivo =

    event.target.files[0];



    if(!arquivo){

        return;

    }




    const leitor =

    new FileReader();



    leitor.onload=function(e){



        const avatar =

        document.querySelector(

            ".avatar"

        );



        avatar.innerHTML = `

            <img src="${e.target.result}"

            style="
            width:100%;
            height:100%;
            border-radius:50%;
            object-fit:cover;
            ">

        `;



        localStorage.setItem(

            "fotoPerfilERP",

            e.target.result

        );



    };



    leitor.readAsDataURL(arquivo);



}



// =====================================================
// CARREGAR FOTO
// =====================================================


function carregarFoto(){



    const foto =

    localStorage.getItem(

        "fotoPerfilERP"

    );



    if(foto){


        document.querySelector(

            ".avatar"

        ).innerHTML = `

        <img src="${foto}"

        style="
        width:100%;
        height:100%;
        border-radius:50%;
        object-fit:cover;
        ">

        `;


    }



}



document.addEventListener(

"DOMContentLoaded",

carregarFoto

);



// =====================================================
// LIMPAR SENHAS
// =====================================================


function limparSenha(){


    document.getElementById(

        "novaSenhaPerfil"

    ).value="";



    document.getElementById(

        "confirmarSenhaPerfil"

    ).value="";


}