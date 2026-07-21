
const cartKey = "cart";
const wishlistKey = "wishlist";
const themeKey = "bookHavenTheme";

let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartBadges();
}

function saveWishlist() {
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  updateWishlistBadges();
}

function updateCartBadges() {
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cart.length;
  });
}

function updateWishlistBadges() {
  document.querySelectorAll("[data-wishlist-count]").forEach(el => {
    el.textContent = wishlist.length;
  });
}

function showToast(message) {
  let toast = document.getElementById("bookToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "bookToast";
    toast.className = "toast align-items-center text-bg-dark border-0 position-fixed bottom-0 end-0 m-3";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body"></div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector(".toast-body").textContent = message;
  bootstrap.Toast.getOrCreateInstance(toast, { delay: 1800 }).show();
}

function addToCart(book) {
  cart.push({ ...book, qty: 1 });
  saveCart();
  showToast(`${book.name} added to cart`);
}

function addToWishlist(book) {
  const exists = wishlist.some(item => item.name === book.name);
  if (!exists) {
    wishlist.push({ ...book, qty: 1 });
    saveWishlist();
    showToast(`${book.name} added to wishlist`);
  } else {
    showToast(`${book.name} is already in wishlist`);
  }
}

function buyNow(book) {
  cart.push({ ...book, qty: 1 });
  saveCart();
  window.location.href = "checkout.html";
}

function loadTheme() {
  const saved = localStorage.getItem(themeKey);
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    document.querySelectorAll("[data-theme-label]").forEach(el => el.textContent = "Dark");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const dark = document.body.classList.contains("dark-mode");
  localStorage.setItem(themeKey, dark ? "dark" : "light");
  document.querySelectorAll("[data-theme-label]").forEach(el => el.textContent = dark ? "Dark" : "Light");
}

function wireThemeToggle() {
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.addEventListener("click", toggleTheme);
  });
}

function wireActionButtons() {
  document.querySelectorAll("[data-add-cart]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart({
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price, 10),
        image: btn.dataset.image || "",
        category: btn.dataset.category || ""
      });
    });
  });

  document.querySelectorAll("[data-add-wishlist]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToWishlist({
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price, 10),
        image: btn.dataset.image || "",
        category: btn.dataset.category || ""
      });
    });
  });

  document.querySelectorAll("[data-buy-now]").forEach(btn => {
    btn.addEventListener("click", () => {
      buyNow({
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price, 10),
        image: btn.dataset.image || "",
        category: btn.dataset.category || ""
      });
    });
  });
}

function wireSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const categoryButtons = document.querySelectorAll("[data-filter]");
  const sortSelect = document.getElementById("sortSelect");
  const items = document.querySelectorAll(".book-item");

  function applyFilters() {
    const filter = document.querySelector("[data-filter].active")?.dataset.filter || "all";
    const searchTerm = (searchInput?.value || "").toLowerCase().trim();
    const sortValue = sortSelect?.value || "featured";

    let visibleItems = [...items].filter(item => {
      const title = item.dataset.title.toLowerCase();
      const category = item.dataset.category.toLowerCase();
      const matchesCategory = filter === "all" || category === filter;
      const matchesSearch = title.includes(searchTerm) || category.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    visibleItems.sort((a, b) => {
      const priceA = parseInt(a.dataset.price, 10);
      const priceB = parseInt(b.dataset.price, 10);
      const ratingA = parseFloat(a.dataset.rating || "0");
      const ratingB = parseFloat(b.dataset.rating || "0");

      if (sortValue === "price-low") return priceA - priceB;
      if (sortValue === "price-high") return priceB - priceA;
      if (sortValue === "rating") return ratingB - ratingA;
      return 0;
    });

    items.forEach(item => item.style.display = "none");
    visibleItems.forEach(item => item.style.display = "");

    const parent = visibleItems[0]?.parentElement;
    if (parent) {
      visibleItems.forEach(item => parent.appendChild(item));
    }
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);
}

function wireNewsletter() {
  const form = document.getElementById("newsletterForm");
  const email = document.getElementById("newsletterEmail");
  const msg = document.getElementById("newsletterMsg");

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const value = email.value.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      msg.textContent = "Please enter a valid email address.";
      msg.className = "small text-danger mt-2 mb-0";
      return;
    }
    msg.textContent = "Thanks for subscribing! We will keep you updated.";
    msg.className = "small text-success mt-2 mb-0";
    email.value = "";
    showToast("Newsletter subscription successful");
  });
}

function renderMiniCart() {
  const offcanvasList = document.getElementById("miniCartList");
  const offcanvasTotal = document.getElementById("miniCartTotal");
  const offcanvasSubtotal = document.getElementById("miniCartSubtotal");
  const offcanvasCount = document.getElementById("miniCartCount");
  const cartBadge = document.getElementById("cartBadge");
  if (!offcanvasList) return;

  offcanvasList.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    offcanvasList.innerHTML = `<div class="text-center muted py-4">Your cart is empty.</div>`;
  } else {
    cart.forEach((item, index) => {
      const qty = item.qty || 1;
      subtotal += item.price * qty;

      const row = document.createElement("div");
      row.className = "d-flex justify-content-between align-items-center gap-2 border-bottom py-3";
      row.innerHTML = `
        <div class="d-flex align-items-center gap-3">
          <img src="${item.image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80'}" alt="${item.name}" style="width:52px;height:52px;object-fit:cover;border-radius:12px;">
          <div>
            <div class="fw-semibold">${item.name}</div>
            <div class="small muted">${item.category || "Book"} • ₹${item.price}</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary qty-minus" data-index="${index}">-</button>
          <span class="fw-semibold">${qty}</span>
          <button class="btn btn-sm btn-outline-secondary qty-plus" data-index="${index}">+</button>
          <button class="btn btn-sm btn-outline-danger remove-mini-item" data-index="${index}">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;
      offcanvasList.appendChild(row);
    });
  }

  const total = subtotal;
  offcanvasTotal.textContent = total;
  offcanvasSubtotal.textContent = subtotal;
  offcanvasCount.textContent = cart.length;
  cartBadge && (cartBadge.textContent = cart.length);

  offcanvasList.querySelectorAll(".qty-plus").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index, 10);
      cart[i].qty = (cart[i].qty || 1) + 1;
      saveCart();
      renderMiniCart();
      wireCheckout();
    });
  });

  offcanvasList.querySelectorAll(".qty-minus").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index, 10);
      cart[i].qty = Math.max(1, (cart[i].qty || 1) - 1);
      saveCart();
      renderMiniCart();
      wireCheckout();
    });
  });

  offcanvasList.querySelectorAll(".remove-mini-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.index, 10);
      cart.splice(i, 1);
      saveCart();
      renderMiniCart();
      wireCheckout();
      showToast("Item removed from cart");
    });
  });
}

function wireCheckout() {
  const cartList = document.getElementById("cart-list");
  const totalEl = document.getElementById("total");
  const grandTotalEl = document.getElementById("grandTotal");
  const countEl = document.getElementById("count");
  const itemCountLabel = document.getElementById("itemCountLabel");
  const emptyState = document.getElementById("emptyState");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const promoInput = document.getElementById("promoInput");
  const applyPromoBtn = document.getElementById("applyPromoBtn");
  const promoMsg = document.getElementById("promoMsg");
  const discountEl = document.getElementById("discountEl");
  const miniCartSubtotal = document.getElementById("miniCartSubtotal");
  const miniCartTotal = document.getElementById("miniCartTotal");
  const offcanvasList = document.getElementById("miniCartList");
  const cartBadge = document.getElementById("cartBadge");

  let discount = parseInt(localStorage.getItem("bookHavenDiscount") || "0", 10);

  function renderCart() {
    if (!cartList) return;
    cartList.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
      emptyState?.classList.remove("d-none");
      placeOrderBtn.disabled = true;
      clearCartBtn.disabled = true;
      countEl.innerText = "0";
      itemCountLabel.innerText = "0";
      totalEl.innerText = "0";
      grandTotalEl.innerText = "0";
      discountEl && (discountEl.innerText = "0");
      miniCartSubtotal && (miniCartSubtotal.textContent = "0");
      miniCartTotal && (miniCartTotal.textContent = "0");
      offcanvasList && (offcanvasList.innerHTML = `<div class="text-center muted py-4">Your cart is empty.</div>`);
      cartBadge && (cartBadge.textContent = "0");
      return;
    }

    emptyState?.classList.add("d-none");
    placeOrderBtn.disabled = false;
    clearCartBtn.disabled = false;

    cart.forEach((item, index) => {
      const qty = item.qty || 1;
      total += item.price * qty;

      const row = document.createElement("div");
      row.className = "list-group-item cart-item surface rounded-4 mb-2";
      row.innerHTML = `
        <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80'}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:14px;">
            <div>
              <h3 class="h6 fw-semibold mb-1">${item.name}</h3>
              <div class="small muted">${item.category || "Book"}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary qty-minus" data-index="${index}">-</button>
            <span class="fw-semibold">${qty}</span>
            <button class="btn btn-sm btn-outline-secondary qty-plus" data-index="${index}">+</button>
            <strong class="ms-2">₹${item.price * qty}</strong>
            <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      cartList.appendChild(row);
    });

    const finalTotal = Math.max(0, total - discount);
    countEl.innerText = cart.length;
    itemCountLabel.innerText = cart.length;
    totalEl.innerText = total;
    discountEl && (discountEl.innerText = discount);
    grandTotalEl.innerText = finalTotal;
    miniCartSubtotal && (miniCartSubtotal.textContent = total);
    miniCartTotal && (miniCartTotal.textContent = finalTotal);
    cartBadge && (cartBadge.textContent = cart.length);

    document.querySelectorAll(".remove-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index, 10);
        cart.splice(i, 1);
        saveCart();
        renderCart();
        renderMiniCart();
      });
    });

    document.querySelectorAll(".qty-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index, 10);
        cart[i].qty = (cart[i].qty || 1) + 1;
        saveCart();
        renderCart();
        renderMiniCart();
      });
    });

    document.querySelectorAll(".qty-minus").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index, 10);
        cart[i].qty = Math.max(1, (cart[i].qty || 1) - 1);
        saveCart();
        renderCart();
        renderMiniCart();
      });
    });
  }

  applyPromoBtn?.addEventListener("click", () => {
    const code = promoInput.value.trim().toUpperCase();

    if (code === "READ10") {
      discount = 100;
      promoMsg.textContent = "Promo applied! ₹100 off.";
      promoMsg.className = "small text-success mt-2 mb-0";
    } else if (code === "BOOK20") {
      discount = 200;
      promoMsg.textContent = "Promo applied! ₹200 off.";
      promoMsg.className = "small text-success mt-2 mb-0";
    } else {
      discount = 0;
      promoMsg.textContent = "Invalid promo code.";
      promoMsg.className = "small text-danger mt-2 mb-0";
    }

    localStorage.setItem("bookHavenDiscount", discount.toString());
    renderCart();
    renderMiniCart();
  });

  placeOrderBtn?.addEventListener("click", () => {
    showToast("✅ Order placed successfully!");
    const successModalEl = document.getElementById("orderSuccessModal");
    if (successModalEl) {
      const successModal = new bootstrap.Modal(successModalEl);
      successModal.show();
    }

    localStorage.removeItem(cartKey);
    localStorage.removeItem("bookHavenDiscount");
    cart = [];
    discount = 0;
    renderCart();
    renderMiniCart();

    setTimeout(() => window.location.href = "index.html", 2000);
  });

  clearCartBtn?.addEventListener("click", () => {
    cart = [];
    localStorage.removeItem(cartKey);
    localStorage.removeItem("bookHavenDiscount");
    discount = 0;
    renderCart();
    renderMiniCart();
  });

  renderCart();
  renderMiniCart();
}

function wireBookDetails() {
  const addBtn = document.getElementById("addToCartBtn");
  const buyBtn = document.getElementById("buyNowBtn");

  if (!addBtn || !buyBtn) return;

  const book = {
    name: addBtn.dataset.name || "The Summer I Turned Pretty",
    price: parseInt(addBtn.dataset.price || "600", 10),
    image: addBtn.dataset.image || "",
    category: addBtn.dataset.category || "Fiction"
  };

  addBtn.addEventListener("click", () => addToCart(book));
  buyBtn.addEventListener("click", () => buyNow(book));
}

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  wireThemeToggle();
  wireActionButtons();
  wireSearchAndFilter();
  wireNewsletter();
  wireCheckout();
  wireBookDetails();
  updateCartBadges();
  updateWishlistBadges();
})