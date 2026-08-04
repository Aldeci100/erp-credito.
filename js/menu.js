document.addEventListener("DOMContentLoaded", () => {

    const paginaAtual = location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    // MENU
    // O menu é embutido direto aqui (em vez de "fetch") porque abrir o
    // sistema direto do arquivo (file://) bloqueia fetch() de outros
    // arquivos locais por segurança do navegador — isso fazia o menu e
    // o topo da página ficarem em branco quando não tinha um servidor.
    const menu = document.getElementById("menu");

    if (menu) {

        menu.innerHTML = `
<aside class="sidebar">

    <div class="logo">
        <i class="fa-solid fa-building-columns"></i>
        <h2>ERP Crédito</h2>
    </div>

    <nav>
        <ul>

            <li data-page="dashboard">
                <a href="dashboard.html">
                    <i class="fa-solid fa-chart-line"></i>
                    <span>Dashboard</span>
                </a>
            </li>

            <li data-page="clientes">
                <a href="clientes.html">
                    <i class="fa-solid fa-users"></i>
                    <span>Clientes</span>
                </a>
            </li>

            <li data-page="parceiros">
                <a href="parceiros.html">
                    <i class="fa-solid fa-handshake"></i>
                    <span>Parceiros</span>
                </a>
            </li>

            <li data-page="emprestimos">
                <a href="emprestimos.html">
                    <i class="fa-solid fa-money-bill-wave"></i>
                    <span>Empréstimos</span>
                </a>
            </li>

            <li data-page="recebimentos">
                <a href="recebimentos.html">
                    <i class="fa-solid fa-wallet"></i>
                    <span>Recebimentos</span>
                </a>
            </li>

            <li data-page="caixa">
                <a href="caixa.html">
                    <i class="fa-solid fa-cash-register"></i>
                    <span>Caixa</span>
                </a>
            </li>

            <li data-page="relatorios">
                <a href="relatorios.html">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Relatórios</span>
                </a>
            </li>

            <li data-page="configuracoes">
                <a href="configuracoes.html">
                    <i class="fa-solid fa-gear"></i>
                    <span>Configurações</span>
                </a>
            </li>

        </ul>
    </nav>

</aside>
        `;

        const item = menu.querySelector(`[data-page="${paginaAtual}"]`);

        if (item) {
            item.classList.add("active");
        }

    }

    // TOPBAR
    const topbar = document.getElementById("topbar");

    if (topbar) {

        topbar.innerHTML = `
<header class="topbar">

    <div class="top-left">
        <h1 id="tituloPagina"></h1>
        <span id="subtituloPagina"></span>
    </div>

    <div class="top-right">

        <div class="search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Pesquisar...">
        </div>

        <div class="user">
            <i class="fa-solid fa-circle-user"></i>
            <div>
                <strong>Administrador</strong>
                <span>Online</span>
            </div>
        </div>

    </div>

</header>
        `;

        const paginas = {

            dashboard: {
                titulo: "Dashboard",
                subtitulo: "Bem-vindo ao ERP Crédito"
            },

            clientes: {
                titulo: "Clientes",
                subtitulo: "Gerencie o cadastro de clientes"
            },

            parceiros: {
                titulo: "Parceiros",
                subtitulo: "Gerencie seus parceiros"
            },

            emprestimos: {
                titulo: "Empréstimos",
                subtitulo: "Controle todos os contratos"
            },

            recebimentos: {
                titulo: "Recebimentos",
                subtitulo: "Acompanhe os pagamentos"
            },

            caixa: {
                titulo: "Caixa",
                subtitulo: "Controle financeiro diário"
            },

            relatorios: {
                titulo: "Relatórios",
                subtitulo: "Indicadores e análises"
            },

            usuarios: {
                titulo: "Usuários",
                subtitulo: "Gerencie os acessos ao sistema"
            },

            configuracoes: {
                titulo: "Configurações",
                subtitulo: "Preferências do sistema"
            }

        };

        const dadosPagina = paginas[paginaAtual];

        if (dadosPagina) {

            document.getElementById("tituloPagina").textContent =
                dadosPagina.titulo;

            document.getElementById("subtituloPagina").textContent =
                dadosPagina.subtitulo;

        }

    }

});
