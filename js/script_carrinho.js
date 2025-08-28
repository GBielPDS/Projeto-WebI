// /js/script.js
(function () {
  "use strict";

  const CART_KEY = "cart_v1";

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

  // -------- Captura de produto a partir do card --------
  const getProductFromButton = (btn) => {
    const ds = btn.dataset || {};
    let box = btn.closest(".box");
    let name =
      ds.name ||
      (box ? $("h3", box)?.textContent?.trim() : null) ||
      "Produto";

    // AJUSTE 1: aceitar data-price com vírgula ou "R$"
    let price =
      ds.price ? parsePrice(ds.price) :
      (box ? parsePrice($(".preco", box)?.textContent) : 0);

    // AJUSTE 2: fallback para qualquer <img> dentro do card
    let img =
      ds.image ||
      (box ? ($(".imagens img", box) || $("img", box))?.getAttribute("src") : null) ||
      "images/placeholder.png";

    let id =
      ds.id ||
      `${slug(name)}-${slug((img || "").split("/").pop() || "img")}`;

    return { id, name, price, img, qty: 1 };
  };

  // -------- Operações do Carrinho --------
  const addToCart = (product) => {
    const cart = loadCart();
    const idx = cart.findIndex((it) => it.id === product.id);
    if (idx >= 0) {
      cart[idx].qty += product.qty || 1;
    } else {
      cart.push(product);
    }
    saveCart(cart);
    toast("Adicionado ao carrinho!");
  };

  const removeFromCart = (id) => {
    const cart = loadCart().filter((it) => it.id !== id);
    saveCart(cart);
    renderCart();
  };

  const setQty = (id, qty) => {
    const cart = loadCart();
    const item = cart.find((it) => it.id === id);
    if (!item) return;
    item.qty = Math.max(1, parseInt(qty || 1, 10));
    saveCart(cart);
    renderCart();
  };

  const clearCart = () => {
    saveCart([]);
    renderCart();
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
  document.addEventListener("click", (e) => {
    // Botão "adicionar ao carrinho" nos cards
    if (e.target.matches(".produtos .box .botao")) {
      e.preventDefault();
      const product = getProductFromButton(e.target);
      addToCart(product);
    }

    // Controles do carrinho (delegação)
    if (e.target.matches(".cart-btn-minus, .cart-btn-plus, .cart-btn-remove")) {
      const id = e.target.getAttribute("data-id");
      if (!id) return;

      if (e.target.classList.contains("cart-btn-minus")) {
        const cart = loadCart();
        const it = cart.find((x) => x.id === id);
        if (it) {
          it.qty = Math.max(1, (it.qty || 1) - 1);
          saveCart(cart);
          renderCart();
        }
      }

      if (e.target.classList.contains("cart-btn-plus")) {
        const cart = loadCart();
        const it = cart.find((x) => x.id === id);
        if (it) {
          it.qty = (it.qty || 1) + 1;
          saveCart(cart);
          renderCart();
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
  const renderCart = () => {
    const tbody = $("#cart-items");
    const totalEl = $("#cart-total");
    const wrap = $("#cart-container");
    const empty = $("#cart-empty");
    if (!tbody || !totalEl || !wrap || !empty) return;

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
    for (const it of cart) {
      const subtotal = (it.price || 0) * (it.qty || 1);
      total += subtotal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="cart-col-prod">
          <img src="${it.img}" alt="${it.name}" onerror="this.src='/images/logo.png'"/>
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
  window.addEventListener("DOMContentLoaded", () => {
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
        alert("Finalização de pedido simulada. Integre aqui seu fluxo de checkout.");
      });
    }

    renderCart();
  });
})();
