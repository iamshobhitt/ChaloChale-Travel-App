// ChaloChale Travel App - beginner-friendly JavaScript

const CART_KEY = "chalochale-cart";

function formatPrice(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- Cart storage ---------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(function (cartItem) { return cartItem.id === item.id; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
  }
  saveCart(cart);
}

function changeQty(id, change) {
  const cart = getCart();
  const item = cart.find(function (cartItem) { return cartItem.id === id; });
  if (!item) return;
  item.qty += change;
  saveCart(cart.filter(function (cartItem) { return cartItem.qty > 0; }));
}

function removeFromCart(id) {
  saveCart(getCart().filter(function (cartItem) { return cartItem.id !== id; }));
}

function cartTotal(cart) {
  return cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
}

function cartCount(cart) {
  return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
}

/* ---------- Cart UI (added to every page) ---------- */
function buildCartUI() {
  const signupLink = document.querySelector('#menu a[href="signup.html"]');
  if (signupLink) {
    const cartButton = document.createElement("button");
    cartButton.type = "button";
    cartButton.className = "btn btn-outline-light cart-btn position-relative ms-lg-3 mt-2 mt-lg-0";
    cartButton.setAttribute("data-bs-toggle", "offcanvas");
    cartButton.setAttribute("data-bs-target", "#cartDrawer");
    cartButton.setAttribute("aria-label", "Open cart");
    cartButton.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> <span class="d-lg-none ms-1">Cart</span>' +
      '<span class="cart-count badge rounded-pill bg-warning text-dark">0</span>';
    signupLink.parentNode.insertBefore(cartButton, signupLink);
  }

  document.body.insertAdjacentHTML("beforeend",
    '<div class="offcanvas offcanvas-end cart-drawer" tabindex="-1" id="cartDrawer" aria-labelledby="cartDrawerLabel">' +
    '  <div class="offcanvas-header border-bottom">' +
    '    <h5 class="offcanvas-title fw-bold" id="cartDrawerLabel"><i class="fa-solid fa-cart-shopping text-primary me-2"></i>Your Cart</h5>' +
    '    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>' +
    '  </div>' +
    '  <div class="offcanvas-body d-flex flex-column">' +
    '    <div id="cartItems" class="flex-grow-1"></div>' +
    '    <div id="cartFooter" class="cart-footer border-top pt-3">' +
    '      <div class="d-flex justify-content-between align-items-center mb-1"><span class="fw-semibold">Subtotal</span><strong id="cartTotal" class="fs-5 price">₹0</strong></div>' +
    '      <small class="text-muted d-block mb-3">Prices are per traveller. Final amount is confirmed at booking.</small>' +
    '      <a href="booking.html?fromCart=1" class="btn btn-primary w-100 mb-2">Proceed to booking <i class="fa-solid fa-arrow-right ms-1"></i></a>' +
    '      <button type="button" class="btn btn-outline-danger w-100" id="clearCart">Clear cart</button>' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastArea"></div>' +
    '<button type="button" class="back-to-top" id="backToTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>'
  );

  document.getElementById("cartItems").addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.getAttribute("data-id");
    const action = button.getAttribute("data-action");
    if (action === "plus") changeQty(id, 1);
    if (action === "minus") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  document.getElementById("cartDrawer").addEventListener("show.bs.offcanvas", function () {
    document.getElementById("toastArea").innerHTML = "";
  });

  document.getElementById("clearCart").addEventListener("click", function () {
    saveCart([]);
  });
}

function renderCart() {
  const cart = getCart();
  const count = cartCount(cart);

  document.querySelectorAll(".cart-count").forEach(function (badge) {
    badge.textContent = count;
    badge.classList.toggle("d-none", count === 0);
  });

  const itemsBox = document.getElementById("cartItems");
  const footer = document.getElementById("cartFooter");
  if (!itemsBox) return;

  if (cart.length === 0) {
    itemsBox.innerHTML =
      '<div class="cart-empty text-center text-muted">' +
      '  <i class="fa-solid fa-suitcase-rolling"></i>' +
      '  <p class="mt-3 mb-1 fw-semibold">Your cart is empty</p>' +
      '  <p class="small">Add a package or destination to start planning.</p>' +
      '  <a href="packages.html" class="btn btn-outline-primary btn-sm">Browse packages</a>' +
      '</div>';
    footer.classList.add("d-none");
  } else {
    itemsBox.innerHTML = cart.map(function (item) {
      const id = escapeHtml(item.id);
      return '<div class="cart-item">' +
        '  <img src="' + escapeHtml(item.img || "") + '" alt="' + escapeHtml(item.name) + '">' +
        '  <div class="flex-grow-1">' +
        '    <div class="d-flex justify-content-between gap-2">' +
        '      <h6 class="mb-1">' + escapeHtml(item.name) + '</h6>' +
        '      <button type="button" class="btn btn-link text-danger p-0" data-action="remove" data-id="' + id + '" aria-label="Remove"><i class="fa-solid fa-trash-can"></i></button>' +
        '    </div>' +
        '    <small class="text-muted">' + formatPrice(item.price) + ' × ' + item.qty + '</small>' +
        '    <div class="d-flex justify-content-between align-items-center mt-2">' +
        '      <div class="qty-control">' +
        '        <button type="button" data-action="minus" data-id="' + id + '" aria-label="Decrease">−</button>' +
        '        <span>' + item.qty + '</span>' +
        '        <button type="button" data-action="plus" data-id="' + id + '" aria-label="Increase">+</button>' +
        '      </div>' +
        '      <strong>' + formatPrice(item.price * item.qty) + '</strong>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join("");
    footer.classList.remove("d-none");
    document.getElementById("cartTotal").textContent = formatPrice(cartTotal(cart));
  }

  renderBookingSummary(cart);
}

function showToast(message) {
  const area = document.getElementById("toastArea");
  if (!area || !window.bootstrap) return;
  area.innerHTML = "";
  const toastEl = document.createElement("div");
  toastEl.className = "toast align-items-center text-bg-dark border-0";
  toastEl.setAttribute("role", "status");
  toastEl.innerHTML = '<div class="d-flex"><div class="toast-body"><i class="fa-solid fa-circle-check text-success me-2"></i>' +
    escapeHtml(message) + ' <a href="#" class="text-warning ms-1" data-bs-toggle="offcanvas" data-bs-target="#cartDrawer">View cart</a></div>' +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
  area.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toastEl.addEventListener("hidden.bs.toast", function () { toastEl.remove(); });
  toast.show();
}

buildCartUI();
renderCart();

// "Add to cart" buttons on Home, Destinations and Packages pages.
document.querySelectorAll(".add-to-cart").forEach(function (button) {
  button.addEventListener("click", function () {
    addToCart({
      id: button.getAttribute("data-id"),
      name: button.getAttribute("data-name"),
      price: Number(button.getAttribute("data-price")),
      img: button.getAttribute("data-img")
    });
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    button.classList.add("added");
    button.disabled = true;
    setTimeout(function () {
      button.innerHTML = originalHtml;
      button.classList.remove("added");
      button.disabled = false;
    }, 1200);
    document.querySelectorAll(".cart-btn").forEach(function (cartBtn) {
      cartBtn.classList.remove("bump");
      void cartBtn.offsetWidth;
      cartBtn.classList.add("bump");
    });
    showToast(button.getAttribute("data-name") + " added to cart.");
  });
});

// Keep the cart in sync if it changes in another tab.
window.addEventListener("storage", function (event) {
  if (event.key === CART_KEY) renderCart();
});

/* ---------- Booking ---------- */

// Fill the destination field when a user clicks a Book button on the home page.
document.querySelectorAll("[data-destination]").forEach(function (button) {
  button.addEventListener("click", function () {
    const destinationInput = document.getElementById("destination");
    if (destinationInput) {
      destinationInput.value = button.getAttribute("data-destination");
    }
  });
});

// Read a destination from the URL on the Booking page.
const bookingDestination = document.getElementById("bookingDestination");
if (bookingDestination) {
  const params = new URLSearchParams(window.location.search);
  const destination = params.get("destination");
  if (destination) {
    bookingDestination.value = destination;
  } else if (getCart().length > 0) {
    bookingDestination.value = getCart().map(function (item) { return item.name; }).join(", ");
  }
}

// Show the cart items above the booking form.
function renderBookingSummary(cart) {
  const summary = document.getElementById("cartSummary");
  if (!summary) return;
  if (cart.length === 0) {
    summary.classList.add("d-none");
    return;
  }
  summary.classList.remove("d-none");
  summary.innerHTML =
    '<h5 class="fw-bold mb-3"><i class="fa-solid fa-cart-shopping text-primary me-2"></i>Items in your cart</h5>' +
    cart.map(function (item) {
      return '<div class="d-flex justify-content-between small py-1"><span>' + escapeHtml(item.name) + ' × ' + item.qty +
        '</span><span>' + formatPrice(item.price * item.qty) + '</span></div>';
    }).join("") +
    '<hr class="my-2"><div class="d-flex justify-content-between fw-bold"><span>Total</span><span class="price">' +
    formatPrice(cartTotal(cart)) + '</span></div>';
}
renderBookingSummary(getCart());

// Do not allow travel dates in the past.
const today = new Date().toISOString().split("T")[0];
document.querySelectorAll('input[type="date"]').forEach(function (input) {
  input.min = today;
});

// Demo booking form in the home page modal.
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("bookingMessage").classList.remove("d-none");
    bookingForm.reset();
  });
}

// Demo booking form on the separate Booking page. Clears the cart once submitted.
const bookingPageForm = document.getElementById("bookingPageForm");
if (bookingPageForm) {
  bookingPageForm.addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("bookingPageMessage").classList.remove("d-none");
    bookingPageForm.reset();
    saveCart([]);
  });
}

// Demo contact form.
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("contactSuccess").classList.remove("d-none");
    contactForm.reset();
  });
}

// Signup form demo: checks that both entered passwords match.
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const message = document.getElementById("signupMessage");
    if (document.getElementById("signupPassword").value !== document.getElementById("confirmPassword").value) {
      message.textContent = "Passwords do not match. Please try again.";
      message.classList.remove("d-none", "alert-success");
      message.classList.add("alert-danger");
      return;
    }
    message.textContent = "Signup form submitted successfully (demo only). No account has been created.";
    message.classList.remove("d-none", "alert-danger");
    message.classList.add("alert-success");
    signupForm.reset();
  });
}

// Login form demo: no real password verification without a backend.
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("loginMessage").classList.remove("d-none");
    loginForm.reset();
  });
}

/* ---------- Page effects ---------- */

// Darker navbar shadow and back-to-top button after scrolling.
const navbar = document.querySelector(".navbar");
const backToTop = document.getElementById("backToTop");
function onScroll() {
  const scrolled = window.scrollY > 60;
  if (navbar) navbar.classList.toggle("scrolled", scrolled);
  backToTop.classList.toggle("show", window.scrollY > 400);
}
window.addEventListener("scroll", onScroll);
onScroll();
backToTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Fade cards and sections in as they scroll into view.
const revealItems = document.querySelectorAll(".service-box, .travel-card, .package-card, .section-title, main .card, .newsletter .container");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(function (item) {
    item.classList.add("reveal");
    observer.observe(item);
  });
}
