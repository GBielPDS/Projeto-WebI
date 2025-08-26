document.addEventListener('DOMContentLoaded', () => {

    // --- Helpers para manipulação do DOM
    const $ = (seletor) => document.querySelector(seletor);
    const $$ = (seletor) => document.querySelectorAll(seletor);

    // --- Elementos do DOM
    const gradeProdutos = $('.grade-produtos');
    const botoesCategoria = $$('.botao-categoria');
    const campoBusca = $('#campo-busca');
    const ordenarPorSelect = $('#ordenar-por');
    const contadorProdutoSpan = $('.contador-produto span');
    const contadorCarrinhoSpan = $('.cart-count');
    const iconeCarrinho = $('.cart-icon');
    const modal = $('#modal-visualizacao-rapida');
    const conteudoModal = $('.modal__detalhes-produto');
    const botaoFecharModal = $('.modal__botao-fechar');
    const mensagemSemProdutos = $('.mensagem-sem-produtos');

    // --- Dados de produtos (simulação de uma API para roupas)
    const produtos = [
        { id: 1, name: 'Blusa de Seda Branca', category: 'blusas', type: 'Seda', color: 'Branco', price: 89.90, originalPrice: 129.90, imageSrc: 'https://i.pinimg.com/originals/bc/4d/ae/bc4dae3340246898281f9b89b8ca1975.webp', onSale: true, description: 'Blusa de seda branca com caimento leve e elegante. Ideal para looks casuais e de trabalho.', stars: 4.8 },
        { id: 2, name: 'Calça Jeans Skinny', category: 'calcas', type: 'Jeans', color: 'Azul', price: 159.90, originalPrice: null, imageSrc: '//www.lunender.com/dw/image/v2/BFCG_PRD/on/demandware.static/-/Sites-masterCatalog_Lunelli/default/dw464f5175/large/lunender-1.20415-008878-C1.jpg?sw=900&sfrm=jpg&sm=fit&q=80s', onSale: false, description: 'Calça jeans skinny de cintura alta, confortável e moderna. Perfeita para qualquer estação.', stars: 4.5 },
        { id: 3, name: 'Vestido Florido Midi', category: 'vestidos', type: 'Algodão', color: 'Estampado', price: 179.90, originalPrice: 200.00, imageSrc: 'https://th.bing.com/th/id/R.08552d0acba6aa15fb60b1145542a2d8?rik=mjpy%2bqrxyQcscA&pid=ImgRaw&r=0', onSale: true, description: 'Vestido midi com estampa floral, tecido leve e fluído. Um item essencial para o seu verão.', stars: 4.9 },
        { id: 4, name: 'Bolsa de Couro Preta', category: 'acessorios', type: 'Couro', color: 'Preto', price: 250.00, originalPrice: null, imageSrc: 'https://static.netshoes.com.br/produtos/bolsa-de-couro-griffazzi-feminina/06/KHO-0563-006/KHO-0563-006_zoom3.jpg?ts=1592326905&', onSale: false, description: 'Bolsa de couro genuíno, espaçosa e com acabamento premium. Um acessório atemporal para complementar seu estilo.', stars: 5.0 },
        { id: 5, name: 'Camisa Social Masculina', category: 'blusas', type: 'Algodão', color: 'Azul-Claro', price: 109.90, originalPrice: null, imageSrc: 'https://images.tcdn.com.br/img/img_prod/729158/camisa_social_masculina_slim_lisa_azul_clara_733_1_0e2cd3bbf4a116ce19ff89b35d507252.jpg', onSale: false, description: 'Camisa social masculina slim fit, feita de algodão. Confortável e ideal para o escritório.', stars: 4.6 },
        { id: 6, name: 'Calça de Alfaiataria', category: 'calcas', type: 'Poliéster', color: 'Cinza', price: 149.90, originalPrice: 180.00, imageSrc: 'https://th.bing.com/th/id/R.bfc07a4ad56350262cc3274ec643980f?rik=YUz4aJZo4MGwmw&pid=ImgRaw&r=0', onSale: true, description: 'Calça de alfaiataria com corte reto e caimento perfeito. Ideal para um visual sofisticado e elegante.', stars: 4.7 },
        { id: 7, name: 'Vestido Longo Casual', category: 'vestidos', type: 'Viscose', color: 'Verde', price: 120.00, originalPrice: null, imageSrc: 'https://tse3.mm.bing.net/th/id/OIP.RxRkl3rlxDHo2wXpA3KJzwHaJo?rs=1&pid=ImgDetMain&o=7&rm=3', onSale: false, description: 'Vestido longo com decote em V e tecido macio. Perfeito para passeios e eventos casuais.', stars: 4.2 },
        { id: 8, name: 'Cinto de Couro Marrom', category: 'acessorios', type: 'Couro', color: 'Marrom', price: 75.00, originalPrice: null, imageSrc: 'https://http2.mlstatic.com/D_NQ_NP_685414-MLU73420987771_122023-O.webp', onSale: false, description: 'Cinto de couro marrom com fivela minimalista. Um toque final para qualquer look.', stars: 4.5 }
    ];

    let produtosExibidos = [...produtos];

    // --- Funções de Renderização
    const renderizarProdutos = (produtosParaRenderizar) => {
        gradeProdutos.innerHTML = '';
        if (produtosParaRenderizar.length === 0) {
            mensagemSemProdutos.style.display = 'block';
            gradeProdutos.style.display = 'none';
        } else {
            mensagemSemProdutos.style.display = 'none';
            gradeProdutos.style.display = 'grid';
            produtosParaRenderizar.forEach(produto => {
                const cartaoProduto = document.createElement('div');
                cartaoProduto.classList.add('produtos__card');
                
                const seloPromocao = produto.onSale ? `<span class="selo-promocao">Promoção</span>` : '';
                const precoOriginal = produto.originalPrice ? `<span class="produtos__preco-original">$${produto.originalPrice.toFixed(2)}</span>` : '';
                
                cartaoProduto.innerHTML = `
                    <div class="produtos__imagem-wrapper">
                        <img src="${produto.imageSrc}" alt="${produto.name}">
                        ${seloPromocao}
                    </div>
                    <h3 class="produtos__nome">${produto.name}</h3>
                    <div class="detalhes-produto">Tipo: ${produto.type} • Cor: ${produto.color}</div>
                    <div class="produtos__preco">
                        $${produto.price.toFixed(2)} ${precoOriginal}
                    </div>
                    <button class="botao botao-adicionar-carrinho" data-id="${produto.id}">ADICIONAR AO CARRINHO</button>
                    <div class="produtos__icones">
                        <i class="fas fa-shopping-cart" data-id="${produto.id}" title="Adicionar ao Carrinho"></i>
                        <i class="fas fa-eye" data-id="${produto.id}" title="Visualização Rápida"></i>
                    </div>
                `;
                gradeProdutos.appendChild(cartaoProduto);
            });
        }
        contadorProdutoSpan.textContent = produtosParaRenderizar.length;
    };

    const renderizarModalVisualizacaoRapida = (produto) => {
        conteudoModal.innerHTML = `
            <div class="modal__imagem-produto">
                <img src="${produto.imageSrc}" alt="${produto.name}">
            </div>
            <div class="modal__informacao-produto">
                <h3>${produto.name}</h3>
                <p class="modal__detalhes-produto">${produto.description}</p>
                <div class="produtos__estrelas">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(produto.stars))}
                    ${produto.stars % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                </div>
                <div class="modal__preco-produto">
                    $${produto.price.toFixed(2)}
                    ${produto.originalPrice ? `<span class="preco-original">$${produto.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="modal__controle-quantidade">
                    <button class="botao-quantidade" data-action="decrement">-</button>
                    <input type="text" value="1" readonly>
                    <button class="botao-quantidade" data-action="increment">+</button>
                </div>
                <button class="botao modal__botao-adicionar-carrinho" data-id="${produto.id}">ADICIONAR AO CARRINHO</button>
            </div>
        `;
    };

    // --- Funções de Lógica e Interatividade
    const atualizarContadorCarrinho = () => {
        const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
        contadorCarrinhoSpan.textContent = carrinho.length;
    };

    const adicionarAoCarrinho = (produtoId, quantidade = 1) => {
        const produtoParaAdicionar = produtos.find(p => p.id === produtoId);
        if (produtoParaAdicionar) {
            let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
            carrinho.push({ ...produtoParaAdicionar, quantity: quantidade });
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            atualizarContadorCarrinho();
            iconeCarrinho.classList.add('added');
            setTimeout(() => iconeCarrinho.classList.remove('added'), 500); // Remove a animação
        }
    };

    const filtrarEOordenarProdutos = () => {
        const categoriaAtiva = $('.botao-categoria.ativo').dataset.category;
        const termoBusca = campoBusca.value.toLowerCase().trim();
        const valorOrdenacao = ordenarPorSelect.value;
        
        let filtrados = produtos.filter(p => {
            const correspondeCategoria = categoriaAtiva === 'all' || p.category === categoriaAtiva;
            const correspondeBusca = p.name.toLowerCase().includes(termoBusca);
            return correspondeCategoria && correspondeBusca;
        });

        if (valorOrdenacao === 'asc') {
            filtrados.sort((a, b) => a.price - b.price);
        } else if (valorOrdenacao === 'desc') {
            filtrados.sort((a, b) => b.price - a.price);
        }

        produtosExibidos = filtrados;
        renderizarProdutos(produtosExibidos);
    };

    // --- Event Listeners
    botoesCategoria.forEach(btn => {
        btn.addEventListener('click', (e) => {
            $$('.botao-categoria').forEach(b => b.classList.remove('ativo'));
            e.currentTarget.classList.add('ativo');
            filtrarEOordenarProdutos();
        });
    });

    campoBusca.addEventListener('input', filtrarEOordenarProdutos);
    ordenarPorSelect.addEventListener('change', filtrarEOordenarProdutos);

    gradeProdutos.addEventListener('click', (e) => {
        const alvo = e.target;
        const produtoId = parseInt(alvo.dataset.id);
        
        if (alvo.classList.contains('botao-adicionar-carrinho') || alvo.classList.contains('fa-shopping-cart')) {
            adicionarAoCarrinho(produtoId);
        }

        if (alvo.classList.contains('fa-eye')) {
            const produto = produtos.find(p => p.id === produtoId);
            if (produto) {
                renderizarModalVisualizacaoRapida(produto);
                modal.classList.add('active');
            }
        }
    });

    botaoFecharModal.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        const alvo = e.target;
        const campoQuantidade = $('.modal__controle-quantidade input');
        let quantidade = parseInt(campoQuantidade.value);
        
        if (alvo.dataset.action === 'decrement' && quantidade > 1) {
            campoQuantidade.value = quantidade - 1;
        } else if (alvo.dataset.action === 'increment') {
            campoQuantidade.value = quantidade + 1;
        }

        if (alvo.classList.contains('modal__botao-adicionar-carrinho')) {
            const produtoId = parseInt(alvo.dataset.id);
            const quantidadeFinal = parseInt($('.modal__controle-quantidade input').value);
            adicionarAoCarrinho(produtoId, quantidadeFinal);
            modal.classList.remove('active');
        }
    });

    // --- Inicialização
    renderizarProdutos(produtosExibidos);
    atualizarContadorCarrinho();
});