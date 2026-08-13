(function(){
  const STORE = "https://chrono-prestige-nmh8jm3s.myshopify.com";
  const PRODUCT_VARIANTS = {
    "Tourbillon Élite": "49139674546411",
    "Classic Gold 18k": "49139569262827",
    "Graphite Black": "49139569459435",
    "Ocean Legacy": "49139628343531",
    "Prestige Émeraude": "49139741851883"
  };
  const STORAGE_KEY = "chrono_prestige_cart_v1";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch(e) { cart = {}; }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-overlay" id="cartOverlay" aria-hidden="true"></div>
    <aside class="cart-drawer" id="cartDrawer" aria-label="Warenkorb" aria-hidden="true">
      <div class="cart-head">
        <div><small>Chrono Prestige</small><h3>Warenkorb</h3></div>
        <button class="cart-close" id="cartClose" aria-label="Warenkorb schliessen">×</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-foot">
        <div class="subtotal"><span>Zwischensumme</span><strong id="cartSubtotal">CHF 0</strong></div>
        <button class="checkout-btn" id="cartCheckout" disabled>Zur Kasse</button>
        <div class="cart-note">Sicherer Checkout über den Chrono Prestige Shop</div>
      </div>
    </aside>`);

  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const itemsEl = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const checkoutBtn = document.getElementById("cartCheckout");
  const closeBtn = document.getElementById("cartClose");

  const money = value => "CHF " + Number(value).toLocaleString("de-CH", {maximumFractionDigits: 0});
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  const count = () => Object.values(cart).reduce((n, item) => n + item.qty, 0);

  function openCart(){
    drawer.classList.add("open"); overlay.classList.add("open");
    drawer.setAttribute("aria-hidden","false"); overlay.setAttribute("aria-hidden","false");
    document.body.classList.add("cart-open");
  }
  function closeCart(){
    drawer.classList.remove("open"); overlay.classList.remove("open");
    drawer.setAttribute("aria-hidden","true"); overlay.setAttribute("aria-hidden","true");
    document.body.classList.remove("cart-open");
  }

  function render(){
    const entries = Object.values(cart);
    const badge = document.querySelector(".cart-count");
    if (badge) badge.textContent = count();
    if (!entries.length){
      itemsEl.innerHTML = '<div class="cart-empty"><strong>Ihr Warenkorb ist leer.</strong>Wählen Sie eine Uhr aus unserer Kollektion.</div>';
      subtotalEl.textContent = "CHF 0";
      checkoutBtn.disabled = true;
      return;
    }
    itemsEl.innerHTML = entries.map(item => `
      <div class="cart-item" data-id="${item.variantId}">
        <img src="${item.image}" alt="${item.name}">
        <div><h4>${item.name}</h4><div class="item-price">${money(item.price)}</div>
          <div class="qty"><button data-cart-action="minus" aria-label="Menge reduzieren">−</button><span>${item.qty}</span><button data-cart-action="plus" aria-label="Menge erhöhen">+</button></div>
        </div>
        <button class="remove-item" data-cart-action="remove" aria-label="Artikel entfernen">×</button>
      </div>`).join("");
    subtotalEl.textContent = money(entries.reduce((sum, item) => sum + item.price * item.qty, 0));
    checkoutBtn.disabled = false;
  }

  function addProduct(product){
    if (cart[product.variantId]) cart[product.variantId].qty += 1;
    else cart[product.variantId] = {...product, qty:1};
    save(); render(); openCart();
    if (window.whop && typeof window.whop.track === "function") {
      window.whop.track("add_to_cart", { value: product.price, currency: "CHF" });
    }
  }

  document.querySelectorAll(".card").forEach(card => {
    const name = card.querySelector("h3")?.textContent.trim();
    const variantId = PRODUCT_VARIANTS[name];
    if (!variantId || card.querySelector(".cart-add-btn")) return;
    const priceText = card.querySelector(".price")?.textContent || "";
    const price = Number(priceText.replace(/[^0-9]/g,"")) || 0;
    const image = card.querySelector(".pimg img")?.src || "";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cart-add-btn";
    button.textContent = "In den Warenkorb";
    button.addEventListener("click", () => addProduct({variantId, name, price, image}));
    card.querySelector(".pinfo")?.appendChild(button);
  });

  const actions = document.querySelector(".actions");
  if (actions && !document.querySelector(".cart-nav-btn")) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cart-nav-btn";
    btn.innerHTML = '<span class="cart-label">Warenkorb</span><span class="cart-count">0</span>';
    btn.addEventListener("click", openCart);
    actions.appendChild(btn);
  }

  itemsEl.addEventListener("click", e => {
    const action = e.target.dataset.cartAction;
    if (!action) return;
    const row = e.target.closest(".cart-item");
    const id = row?.dataset.id;
    if (!id || !cart[id]) return;
    if (action === "plus") cart[id].qty += 1;
    if (action === "minus") cart[id].qty = Math.max(1, cart[id].qty - 1);
    if (action === "remove") delete cart[id];
    save(); render();
  });

  checkoutBtn.addEventListener("click", () => {
    const lineItems = Object.values(cart).map(item => `${item.variantId}:${item.qty}`).join(",");
    if (!lineItems) return;
    window.location.href = `${STORE}/cart/${lineItems}`;
  });
  overlay.addEventListener("click", closeCart);
  closeBtn.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
  render();
})();