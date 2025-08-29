// Ativação do menu, formulário de busca e carrinho (do seu index.html)
let navbar = document.querySelector('.navbar');
let searchForm = document.querySelector('.pesquisa');
let cartItem = document.querySelector('.cart-items-container');

document.querySelector('#menu-btn').onclick = () =>{
    navbar.classList.toggle('active');
    searchForm.classList.remove('active');
    cartItem.classList.remove('active');
}

document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    navbar.classList.remove('active');
    cartItem.classList.remove('active');
}

document.querySelector('#cart-btn').onclick = () =>{
    cartItem.classList.toggle('active');
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
}

window.onscroll = () =>{
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
    cartItem.classList.remove('active');
}

// Lógica para a página de produtos
document.addEventListener('DOMContentLoaded', () => {

    // --- Helpers para manipulação do DOM
    const $ = (seletor) => document.querySelector(seletor);
    const $$ = (seletor) => document.querySelectorAll(seletor);

    // --- Elementos do DOM
    const productsGrid = $('.products-grid');
    const categoryList = document.querySelector('.category-list');
    const sortByPrice = document.getElementById('sort-by-price');
    const headingSpan = document.querySelector('.titulos span');

    // --- Dados de produtos (simulação de uma API)
    const products = [
         { id: 1, name: 'Camiseta Básica', category: 't-shirts', price: 49.90, originalPrice: 69.90, image: '/images/Camiseta Básica.webp' },
        { id: 2, name: 'Calça Jeans Skinny', category: 'pants', price: 129.90, originalPrice: 159.90, image: '/images/Calça Jeans Skinn.jpg' },
        { id: 3, name: 'Vestido de Verão', category: 'dresses', price: 89.90, originalPrice: 119.90, image: '/images/Vestido de Verão.jpeg' },
        { id: 4, name: 'Camiseta Estampada', category: 't-shirts', price: 59.90, originalPrice: null, image: '/images/Camiseta Estampada.webp' },
        { id: 5, name: 'Calça de Moletom', category: 'pants', price: 99.90, originalPrice: null, image: '/images/calça moletom feminina.jpg' },
        { id: 6, name: 'Vestido de Gala', category: 'dresses', price: 250.00, originalPrice: 300.00, image: '/images/Vestido de Gala.jpg' },
        { id: 7, name: 'Saia Midi', category: 'dresses', price: 75.00, originalPrice: null, image: '/images/Saia Midi.webp' }
    ];

    let currentProducts = [...products];

    // Função para renderizar os produtos
    const renderProducts = (productsToRender) => {
        productsGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productsGrid.innerHTML = '<p class="no-products-message">Nenhum produto encontrado!</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productBox = document.createElement('div');
            productBox.classList.add('box');
            
            const originalPriceHtml = product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : '';

            productBox.innerHTML = `
                <div class="imagens">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="conteudo">
                    <h3>${product.name}</h3>
                    <div class="preco">$${product.price.toFixed(2)} ${originalPriceHtml}</div>
                    <a href="#" class="botao">adicionar ao carrinho</a>
                </div>
            `;
            productsGrid.appendChild(productBox);
        });
    };

    // Função de filtro
    const filterProducts = () => {
        const category = categoryList.querySelector('.active').dataset.category;
        currentProducts = products.filter(p => category === 'all' || p.category === category);
        renderProducts(currentProducts);
    };

    // Função de ordenação
    const sortProducts = () => {
        const sortValue = sortByPrice.value;
        if (sortValue === 'low-to-high') {
            currentProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'high-to-low') {
            currentProducts.sort((a, b) => b.price - a.price);
        }
        renderProducts(currentProducts);
    };

    // Event listeners
    categoryList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            categoryList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts();
        }
    });

    sortByPrice.addEventListener('change', sortProducts);

    // Renderiza produtos na primeira vez
    renderProducts(currentProducts);
});