// =====================================================
// ERP CRÉDITO
// MÓDULO BACKUP
// =====================================================


// Dados do histórico

let historicoBackup = [];



// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener("DOMContentLoaded",()=>{


    carregarHistorico();


    atualizarCardsBackup();


    configurarEventos();


});



// =====================================================
// EVENTOS
// =====================================================

function configurarEventos(){



    document

    .getElementById("criarBackup")

    .addEventListener(

        "click",

        criarBackup

    );




    document

    .getElementById("restaurarBackup")

    .addEventListener(

        "click",

        restaurarBackup

    );




    document

    .getElementById("limparBackup")

    .addEventListener(

        "click",

        limparBackup

    );



}



// =====================================================
// CRIAR BACKUP
// =====================================================

function criarBackup(){



    const dadosERP = {


        data:

        new Date().toLocaleString("pt-BR"),



        configuracoes:

        localStorage.getItem(

            "erpConfiguracoes"

        ),



        usuarios:

        localStorage.getItem(

            "usuariosERP"

        ),



        perfil:

        localStorage.getItem(

            "perfilERP"

        ),



        foto:

        localStorage.getItem(

            "fotoPerfilERP"

        )


    };




    const arquivo = new Blob(

        [

            JSON.stringify(

                dadosERP,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );




    const url =

    URL.createObjectURL(arquivo);




    const link =

    document.createElement("a");



    link.href=url;



    link.download=

    "backup_erp_credito.json";



    link.click();



    URL.revokeObjectURL(url);



    registrarBackup();



    alert(

        "Backup criado com sucesso."

    );



}



// =====================================================
// RESTAURAR BACKUP
// =====================================================

function restaurarBackup(){



    const arquivo =

    document.getElementById(

        "arquivoBackup"

    ).files[0];



    if(!arquivo){


        alert(

            "Selecione um arquivo de backup."

        );


        return;


    }




    const leitor =

    new FileReader();




    leitor.onload=function(e){



        try{


            const dados =

            JSON.parse(

                e.target.result

            );




            if(dados.configuracoes){


                localStorage.setItem(

                    "erpConfiguracoes",

                    dados.configuracoes

                );


            }




            if(dados.usuarios){


                localStorage.setItem(

                    "usuariosERP",

                    dados.usuarios

                );


            }




            if(dados.perfil){


                localStorage.setItem(

                    "perfilERP",

                    dados.perfil

                );


            }




            if(dados.foto){


                localStorage.setItem(

                    "fotoPerfilERP",

                    dados.foto

                );


            }



            alert(

                "Backup restaurado com sucesso."

            );



        }


        catch(error){


            alert(

                "Arquivo de backup inválido."

            );


        }



    };



    leitor.readAsText(arquivo);



}



// =====================================================
// REGISTRAR HISTÓRICO
// =====================================================

function registrarBackup(){



    const registro = {


        data:

        new Date()

        .toLocaleDateString("pt-BR"),



        horario:

        new Date()

        .toLocaleTimeString("pt-BR"),



        usuario:

        "Administrador",



        tamanho:

        calcularTamanho(),



        status:

        "Concluído"


    };




    historicoBackup.push(registro);



    localStorage.setItem(

        "historicoBackupERP",

        JSON.stringify(

            historicoBackup

        )

    );



    carregarHistorico();



}



// =====================================================
// CARREGAR HISTÓRICO
// =====================================================

function carregarHistorico(){



    const dados =

    localStorage.getItem(

        "historicoBackupERP"

    );



    if(dados){


        historicoBackup =

        JSON.parse(dados);


    }



    const tabela =

    document.getElementById(

        "listaBackup"

    );



    if(!tabela){

        return;

    }



    tabela.innerHTML="";



    historicoBackup.forEach(item=>{


        tabela.innerHTML += `


        <tr>


            <td>${item.data}</td>


            <td>${item.horario}</td>


            <td>${item.usuario}</td>


            <td>${item.tamanho}</td>


            <td>

                <span class="status sucesso">

                    ${item.status}

                </span>

            </td>


            <td>


                <button class="acao visualizar">

                    <i class="fa-solid fa-download"></i>

                </button>



                <button class="acao excluir">

                    <i class="fa-solid fa-trash"></i>

                </button>


            </td>


        </tr>


        `;


    });



}



// =====================================================
// TAMANHO SIMULADO
// =====================================================

function calcularTamanho(){


    const dados =

    JSON.stringify(

        localStorage

    );



    const tamanho =

    (dados.length / 1024)

    .toFixed(2);



    return tamanho + " KB";


}



// =====================================================
// LIMPAR
// =====================================================

function limparBackup(){



    if(

        confirm(

        "Deseja limpar os registros de backup?"

        )

    ){



        historicoBackup=[];



        localStorage.removeItem(

            "historicoBackupERP"

        );



        carregarHistorico();



        alert(

            "Histórico limpo."

        );


    }



}



// =====================================================
// ATUALIZAR CARDS
// =====================================================

function atualizarCardsBackup(){



    const cards =

    document.querySelectorAll(

        ".cardBackup h2"

    );



    if(cards.length>=3){



        cards[0].innerHTML =

        Object.keys(localStorage)

        .length;



        cards[1].innerHTML =

        historicoBackup.length

        ?

        "Hoje"

        :

        "Nenhum";



        cards[2].innerHTML =

        new Date()

        .toLocaleTimeString(

            "pt-BR",

            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );



    }


}