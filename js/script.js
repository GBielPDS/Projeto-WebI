// Produtos box
async function carregarProdutos({ seletor = ".produtos .box-produtos" } = {}) {
    try {
        const response = await fetch("/pack/produtos.json");
        const produtos = await response.json();

        const container = document.querySelector(seletor);
        container.innerHTML = "";

        // lê limite do atributo HTML
        const limiteAttr = parseInt(container.getAttribute("data-limite"));
        const limite = limiteAttr > 0 ? limiteAttr : null;

        const produtosFiltrados = limite ? produtos.slice(0, limite) : produtos;

        produtosFiltrados.forEach(produto => {
            const box = document.createElement("div");
            box.classList.add("box");

            const precoHtml = produto.promocao
                ? `<span class="preco-promocional">R$ ${produto.preco.toFixed(2)}</span>
                   <del class="preco-original">R$ ${produto.precoOriginal.toFixed(2)}</del>`
                : `<span class="preco-normal">R$ ${produto.preco.toFixed(2)}</span>`;

            box.innerHTML = `
                <div class="imagem">
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

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});




let searchForm = document.querySelector('.pesquisa');

document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    navbar.classList.remove('active');
    cartItem.classList.remove('active');
}
