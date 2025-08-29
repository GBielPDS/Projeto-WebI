// Produtos box
document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".produtos .box-produtos");
    const categoryButtons = document.querySelectorAll(".category-list li");

    // Função para filtrar por categoria (já criada)
    function filtrarPorCategoria(categoria, produtosFiltrados) {
        if (!categoria || categoria === "all") {
            return produtosFiltrados;
        }
        return produtosFiltrados.filter(produto => produto.categoria === categoria);
    }

    // Função para carregar produtos
    async function carregarProdutos(categoria = "all") {
        try {
            const response = await fetch("/pack/produtos.json");
            const produtos = await response.json();

            container.innerHTML = "";

            let produtosFiltrados = filtrarPorCategoria(categoria, produtos);

            produtosFiltrados.forEach(produto => {
                const box = document.createElement("div");
                box.classList.add("box");

                const precoHtml = produto.promocao
                    ? `<span>R$ ${produto.preco.toFixed(2).replace(".", ",")}</span>
                       <del>R$ ${produto.precoOriginal.toFixed(2).replace(".", ",")}</del>`
                    : `<span>R$ ${produto.preco.toFixed(2).replace(".", ",")}</span>`;

                box.innerHTML = `
                    <div class="imagens">
                        <img src="${produto.imagemPrincipal}" alt="${produto.nome}">
                    </div>
                    <div class="conteudo">
                        <h3>${produto.nome}</h3>
                        <div class="preco">${precoHtml}</div>
                        <a href="#" class="botao">adicionar ao carrinho</a>
                    </div>
                `;

                container.appendChild(box);
            });
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
        }
    }

    // Inicializa mostrando todos os produtos
    carregarProdutos("all");

    // Adiciona evento de clique em cada botão de categoria
    categoryButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove a classe 'active' de todos
            categoryButtons.forEach(b => b.classList.remove("active"));

            // Adiciona 'active' no botão clicado
            btn.classList.add("active");

            // Pega a categoria do botão clicado
            const categoriaSelecionada = btn.getAttribute("data-category");

            // Carrega os produtos filtrados
            carregarProdutos(categoriaSelecionada);
        });
    });
});



document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});
