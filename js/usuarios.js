// =====================================================
// ERP CRÉDITO
// MÓDULO USUÁRIOS
// =====================================================


let usuarios = [];

let usuarioEditando = null;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener("DOMContentLoaded",()=>{


    carregarUsuarios();


    renderizarUsuarios();


    configurarEventos();


});



// =====================================================
// CARREGAR USUÁRIOS
// =====================================================

function carregarUsuarios(){


    const dados =
        localStorage.getItem("usuariosERP");


    if(dados){

        usuarios = JSON.parse(dados);

    }else{


        usuarios = [

            {
                id:1,
                nome:"Carlos Almeida",
                login:"carlos",
                email:"carlos@email.com",
                telefone:"99999-0000",
                perfil:"Administrador",
                status:"Ativo",
                acesso:"Hoje 08:30"
            },


            {
                id:2,
                nome:"Juliana Santos",
                login:"juliana",
                email:"juliana@email.com",
                telefone:"98888-0000",
                perfil:"Gerente",
                status:"Ativo",
                acesso:"Ontem 17:45"
            },


            {
                id:3,
                nome:"Pedro Oliveira",
                login:"pedro",
                email:"pedro@email.com",
                telefone:"97777-0000",
                perfil:"Operador",
                status:"Inativo",
                acesso:"20/07/2026"
            }

        ];


        salvarUsuarios();

    }

}



// =====================================================
// SALVAR
// =====================================================

function salvarUsuarios(){


    localStorage.setItem(

        "usuariosERP",

        JSON.stringify(usuarios)

    );

}



// =====================================================
// RENDERIZAR TABELA
// =====================================================

function renderizarUsuarios(lista = usuarios){


    const tabela =
        document.getElementById("listaUsuarios");


    tabela.innerHTML="";



    lista.forEach(usuario=>{


        tabela.innerHTML += `


        <tr>


            <td>${usuario.nome}</td>


            <td>${usuario.login}</td>


            <td>${usuario.perfil}</td>


            <td>

                <span class="status ${usuario.status.toLowerCase()}">

                    ${usuario.status}

                </span>

            </td>


            <td>${usuario.acesso}</td>


            <td>


                <button class="acao visualizar"
                onclick="visualizarUsuario(${usuario.id})">

                    <i class="fa-solid fa-eye"></i>

                </button>



                <button class="acao editar"
                onclick="editarUsuario(${usuario.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>



                <button class="acao excluir"
                onclick="excluirUsuario(${usuario.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>


            </td>


        </tr>


        `;


    });



    atualizarCards();


}



// =====================================================
// ABRIR MODAL
// =====================================================


function abrirModal(){


    document.getElementById("modalUsuario")

    .style.display="flex";


}



// =====================================================
// FECHAR MODAL
// =====================================================


function fecharModal(){


    document.getElementById("modalUsuario")

    .style.display="none";


    document.getElementById("formUsuario")

    .reset();


    usuarioEditando=null;


}



// =====================================================
// CONFIGURAÇÕES
// =====================================================

function configurarEventos(){


    document.querySelector(".btnNovo")

    .addEventListener("click",abrirModal);



    document.querySelector(".fechar")

    .addEventListener("click",fecharModal);



    document.querySelector(".btnCancelar")

    .addEventListener("click",fecharModal);



    document.getElementById("formUsuario")

    .addEventListener("submit",salvarUsuario);



    document.getElementById("pesquisaUsuario")

    .addEventListener("keyup",pesquisar);



    document.getElementById("filtroPerfil")

    .addEventListener("change",filtrar);



    document.getElementById("filtroStatus")

    .addEventListener("change",filtrar);


}



// =====================================================
// SALVAR USUÁRIO
// =====================================================


function salvarUsuario(e){


    e.preventDefault();



    const senha =
    document.getElementById("senhaUsuario").value;



    const confirmar =
    document.getElementById("confirmarSenhaUsuario").value;



    if(senha !== confirmar){


        alert("As senhas não conferem.");

        return;

    }



    const usuario = {


        id:

        usuarioEditando ||

        Date.now(),


        nome:
        document.getElementById("nomeUsuario").value,


        login:
        document.getElementById("loginUsuario").value,


        email:
        document.getElementById("emailUsuario").value,


        telefone:
        document.getElementById("telefoneUsuario").value,


        perfil:
        document.getElementById("perfilUsuario").value,


        status:
        document.getElementById("statusUsuario").value,


        acesso:"Agora"


    };



    if(usuarioEditando){


        usuarios = usuarios.map(u=>

            u.id===usuarioEditando
            ? usuario
            : u

        );


    }else{


        usuarios.push(usuario);


    }



    salvarUsuarios();


    renderizarUsuarios();


    fecharModal();


    alert("Usuário salvo com sucesso.");

}



// =====================================================
// EDITAR
// =====================================================

function editarUsuario(id){


    const usuario =
    usuarios.find(u=>u.id===id);



    usuarioEditando=id;



    document.getElementById("nomeUsuario").value=usuario.nome;

    document.getElementById("loginUsuario").value=usuario.login;

    document.getElementById("emailUsuario").value=usuario.email;

    document.getElementById("telefoneUsuario").value=usuario.telefone;

    document.getElementById("perfilUsuario").value=usuario.perfil;

    document.getElementById("statusUsuario").value=usuario.status;



    abrirModal();


}



// =====================================================
// VISUALIZAR
// =====================================================

function visualizarUsuario(id){


    const usuario =
    usuarios.find(u=>u.id===id);



    alert(

        "Usuário:\n\n"+
        usuario.nome+
        "\nPerfil: "+
        usuario.perfil+
        "\nStatus: "+
        usuario.status

    );


}



// =====================================================
// EXCLUIR
// =====================================================

function excluirUsuario(id){


    if(confirm("Deseja excluir este usuário?")){


        usuarios = usuarios.filter(

            u=>u.id!==id

        );


        salvarUsuarios();


        renderizarUsuarios();


    }


}



// =====================================================
// PESQUISA
// =====================================================

function pesquisar(){


    const texto =
    this.value.toLowerCase();



    const lista =
    usuarios.filter(u=>


        u.nome.toLowerCase().includes(texto)

        ||

        u.login.toLowerCase().includes(texto)


    );



    renderizarUsuarios(lista);


}



// =====================================================
// FILTROS
// =====================================================

function filtrar(){


    const perfil =
    document.getElementById("filtroPerfil").value;



    const status =
    document.getElementById("filtroStatus").value;



    let lista=[...usuarios];



    if(perfil!=="Todos"){

        lista =
        lista.filter(u=>u.perfil===perfil);

    }



    if(status!=="Todos"){

        lista =
        lista.filter(u=>u.status===status);

    }



    renderizarUsuarios(lista);


}



// =====================================================
// CARDS
// =====================================================

function atualizarCards(){


    const cards =
    document.querySelectorAll(".cardUsuario h2");



    if(cards.length>=4){


        cards[0].innerHTML=usuarios.length;


        cards[1].innerHTML=

        usuarios.filter(
            u=>u.perfil==="Administrador"
        ).length;


        cards[2].innerHTML=

        usuarios.filter(
            u=>u.perfil==="Gerente"
        ).length;



        cards[3].innerHTML=

        usuarios.filter(
            u=>u.perfil==="Operador"
        ).length;


    }


}