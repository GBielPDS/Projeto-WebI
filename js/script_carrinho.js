// /js/script.js
(function () {
  "use strict";

  const CART_KEY = "cart_v1";
  const CATALOG_URL = "/pack/produtos.json";

  // -------- Util --------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const money = (n) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

  const parsePrice = (txt) => {
    if (!txt) return 0;
    const only = (txt + "").replace(/[^\d.,]/g, "");
    if (!only) return 0;
    if (only.includes(",") && only.includes(".")) {
      const semPontos = only.replace(/\./g, "");
      return parseFloat(semPontos.replace(",", "."));
    }
    if (only.includes(",") && !only.includes(".")) {
      return parseFloat(only.replace(",", "."));
    }
    return parseFloat(only);
  };

  const slug = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Normaliza caminho (ex.: "images/..." vira "/images/..." onde quer que a página esteja)
  const absURL = (src) => {
    if (!src) return "";
    try {
      const u = new URL(src, window.location.origin);
      return u.pathname;
    } catch {
      return src;
    }
  };

  // -------- Storage --------
  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  };
  const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadge(cart);
  };

  // -------- Catálogo (JSON) --------
  let catalogLoaded = false;
  let catalogMap = new Map(); // id -> produto

  async function loadCatalogOnce() {
    if (catalogLoaded) return catalogMap;
    try {
      const resp = await fetch(CATALOG_URL, { cache: "no-store" });
      const data = await resp.json();

      // Monta um mapa id->produto; se houver ids duplicados, mantém o primeiro
      catalogMap = new Map();
      for (const p of (data || [])) {
        if (!catalogMap.has(p.id)) {
          catalogMap.set(p.id, {
            id: p.id,
            nome: p.nome,
            preco: Number(p.preco),
            precoOriginal: Number(p.precoOriginal),
            imagemPrincipal: absURL(p.imagemPrincipal || "/images/placeholder.png"),
            categoria: p.categoria,
            descricao: p.descricao,
            promocao: !!p.promocao,
          });
        }
      }
      catalogLoaded = true;
    } catch (err) {
      console.error("Falha ao carregar catálogo:", err);
      catalogMap = new Map();
      catalogLoaded = true;
    }
    return catalogMap;
  }

  // Enriquecimento de um item do carrinho a partir do catálogo
  function enrichItemFromCatalog(item) {
    if (!item) return item;
    const pid = Number(item.id) || item.id; // aceita numérico ou string
    if (catalogMap.has(pid)) {
      const p = catalogMap.get(pid);
      // Preenche campos faltantes ou corrige o que vier errado
      item.name = p.nome || item.name;
      item.price = Number.isFinite(p.preco) ? p.preco : item.price;
      item.img = absURL(p.imagemPrincipal || item.img || "/images/placeholder.png");
    } else {
      // Normaliza caminho mesmo assim
      item.img = absURL(item.img || "/images/placeholder.png");
    }
    return item;
  }

  // -------- Badge no ícone do carrinho --------
  const ensureBadge = () => {
    const cartBtn = $("#cart-btn");
    if (!cartBtn) return null;

    let badge = cartBtn.querySelector("#cart-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "cart-count";
      cartBtn.style.position = "relative";
      cartBtn.appendChild(badge);
    }
    return badge;
  };
  const updateBadge = (cart = loadCart()) => {
    const badge = ensureBadge();
    if (!badge) return;
    const count = cart.reduce((sum, it) => sum + (it.qty || 0), 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  };

  // -------- Captura de produto a partir do card (fallback quando não vier do catálogo) --------
  const getProductFromButton = (btn) => {
    const ds = btn.dataset || {};
    let box = btn.closest(".box");
    let name =
      ds.name ||
      (box ? $("h3", box)?.textContent?.trim() : null) ||
      "Produto";

    let price =
      ds.price ? parsePrice(ds.price) :
      (box ? parsePrice($(".preco", box)?.textContent) : 0);

    const rawImg =
      ds.image ||
      (box ? ($(".imagens img", box) || $("img", box))?.getAttribute("src") : null) ||
      "/images/placeholder.png";

    const img = absURL(rawImg);

    let id =
      ds.id ||
      `${slug(name)}-${slug((img || "").split("/").pop() || "img")}`;

    return { id, name, price, img, qty: 1 };
  };

  // -------- Operações do Carrinho --------
  const addToCart = (product) => {
    const cart = loadCart();
    const idx = cart.findIndex((it) => String(it.id) === String(product.id));
    if (idx >= 0) {
      cart[idx].qty += product.qty || 1;
    } else {
      cart.push(product);
    }
    saveCart(cart);
    toast("Adicionado ao carrinho!");
  };

  const removeFromCart = (id) => {
    const cart = loadCart().filter((it) => String(it.id) !== String(id));
    saveCart(cart);
    renderCart();
  };

  const setQty = (id, qty) => {
    const cart = loadCart();
    const item = cart.find((it) => String(it.id) === String(id));
    if (!item) return;
    item.qty = Math.max(1, parseInt(qty || 1, 10));
    saveCart(cart);
    renderCart();
  };

  const clearCart = () => {
    saveCart([]); renderCart();
  };

  // -------- Toast simples --------
  let toastTimer;
  const toast = (msg = "") => {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove("toast--hide");
    el.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("toast--show");
      el.classList.add("toast--hide");
    }, 1500);
  };

  // -------- Listeners globais --------
  document.addEventListener("click", async (e) => {
    // Botão "adicionar ao carrinho" nos cards
    if (e.target.matches(".produtos .box .botao")) {
      e.preventDefault();
      await loadCatalogOnce();

      // Se o botão tiver data-id que existe no catálogo, prioriza catálogo
      const ds = e.target.dataset || {};
      const btnId = ds.id ? (isNaN(ds.id) ? ds.id : Number(ds.id)) : null;

      let product;
      if (btnId != null && catalogMap.has(btnId)) {
        const p = catalogMap.get(btnId);
        product = {
          id: p.id,
          name: p.nome,
          price: Number(p.preco) || 0,
          img: absURL(p.imagemPrincipal || "/images/placeholder.png"),
          qty: 1
        };
      } else {
        // fallback: monta a partir do card
        product = getProductFromButton(e.target);
        // tenta enriquecer com catálogo pelo id, se for numérico
        enrichItemFromCatalog(product);
      }

      addToCart(product);
    }

    // Controles do carrinho (delegação)
    if (e.target.matches(".cart-btn-minus, .cart-btn-plus, .cart-btn-remove")) {
      const id = e.target.getAttribute("data-id");
      if (!id) return;

      if (e.target.classList.contains("cart-btn-minus")) {
        const cart = loadCart();
        const it = cart.find((x) => String(x.id) === String(id));
        if (it) {
          it.qty = Math.max(1, (it.qty || 1) - 1);
          saveCart(cart); renderCart();
        }
      }

      if (e.target.classList.contains("cart-btn-plus")) {
        const cart = loadCart();
        const it = cart.find((x) => String(x.id) === String(id));
        if (it) {
          it.qty = (it.qty || 1) + 1;
          saveCart(cart); renderCart();
        }
      }

      if (e.target.classList.contains("cart-btn-remove")) {
        removeFromCart(id);
      }
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.matches(".cart-qty-input")) {
      const id = e.target.getAttribute("data-id");
      const val = parseInt(e.target.value || "1", 10);
      if (id) setQty(id, isNaN(val) ? 1 : val);
    }
  });

  // -------- Render da página carrinho.html --------
  const renderCart = async () => {
    const tbody = $("#cart-items");
    const totalEl = $("#cart-total");
    const wrap = $("#cart-container");
    const empty = $("#cart-empty");
    if (!tbody || !totalEl || !wrap || !empty) return;

    await loadCatalogOnce(); // garante catálogo disponível para enriquecer

    const cart = loadCart();
    updateBadge(cart);

    tbody.innerHTML = "";
    if (!cart.length) {
      wrap.style.display = "none";
      empty.style.display = "block";
      totalEl.textContent = money(0);
      return;
    }

    wrap.style.display = "block";
    empty.style.display = "none";

    let total = 0;
    for (let it of cart) {
      // Enriquecimento (imagem/nome/preço) a partir do catálogo
      it = enrichItemFromCatalog(it);

      const subtotal = (it.price || 0) * (it.qty || 1);
      total += subtotal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="cart-col-prod">
          <img src="${it.img}" alt="${it.name}" onerror="this.src='/images/placeholder.png'"/>
          <div>
            <div class="cart-prod-name" title="${it.name}">${it.name}</div>
            <button class="cart-btn-remove" data-id="${it.id}">Remover</button>
          </div>
        </td>
        <td>${money(it.price)}</td>
        <td class="cart-col-qty">
          <button class="cart-btn-minus" data-id="${it.id}" aria-label="Diminuir">−</button>
          <input class="cart-qty-input" data-id="${it.id}" type="number" min="1" value="${it.qty || 1}" inputmode="numeric">
          <button class="cart-btn-plus" data-id="${it.id}" aria-label="Aumentar">+</button>
        </td>
        <td class="cart-col-subtotal">${money(subtotal)}</td>
      `;
      tbody.appendChild(tr);
    }
    totalEl.textContent = money(total);
  };

  // Botões da página do carrinho
  window.addEventListener("DOMContentLoaded", async () => {
    await loadCatalogOnce();

    // MIGRAÇÃO: normaliza/atualiza imagens e preços já salvos no carrinho com base no catálago
    (() => {
      const cart = loadCart();
      let changed = false;
      for (const it of cart) {
        const before = JSON.stringify(it);
        enrichItemFromCatalog(it);
        if (JSON.stringify(it) !== before) changed = true;
      }
      if (changed) saveCart(cart);
    })();

    updateBadge();

    const clearBtn = $("#clear-cart");
    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Deseja esvaziar o carrinho?")) {
          clearCart();
        }
      });
    }

    const checkoutBtn = $("#checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Finalização de pedido simulada.");
      });
    }

    renderCart();
  });
})();
