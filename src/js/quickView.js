// src/js/quickView.js
import ExternalServices from "./ExternalServices.mjs";
import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";
import { updateCartCount } from "./cartUtils.mjs"; // ensure this file exists and exports updateCartCount

const modal = document.getElementById("quick-view-modal");
const overlay = modal.querySelector(".quick-view-overlay");
const closeBtn = modal.querySelector(".quick-view-close");
const body = document.getElementById("quick-view-body");

let startY = 0;
let isDragging = false;

function openModal(html) {
  body.innerHTML = html;
  // lock background scroll
  document.body.style.overflow = "hidden";
  modal.classList.remove("hidden");
  requestAnimationFrame(() => modal.classList.add("show"));
}

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
  setTimeout(() => {
    modal.classList.add("hidden");
    body.innerHTML = "";
  }, 250);
}

// close handlers
overlay.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

modal.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
  isDragging = true;
});
modal.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  const diff = e.touches[0].clientY - startY;
  if (diff > 90) closeModal();
});
modal.addEventListener("touchend", () => {
  isDragging = false;
});

export async function showQuickView(id) {
  const api = new ExternalServices();

  try {
    const data = await api.findProductById(id);
    const p =
      data && (data.Result || data.product)
        ? data.Result || data.product
        : data;

    const name = p?.Name || "Unnamed Product";
    const price = Number(p?.FinalPrice ?? p?.ListPrice ?? 0).toFixed(2);
    const img = p?.Images?.PrimaryMedium || "/images/placeholder.png";
    const desc = p?.DescriptionHtmlSimple || "<p>No description available.</p>";

    const html = `
      <div class="quick-view-inner">
        <h2 class="quick-view-title">${name}</h2>

        <img class="quick-view-img" 
             src="${img}" 
             alt="${name}" 
             onerror="this.src='/images/placeholder.png'">

        <p class="quick-view-price">$${price}</p>

        <div class="quick-view-description">
          ${desc}
        </div>

        <button class="quick-view-add" data-id="${p?.Id}">
          Add to Cart
        </button>
      </div>
    `;

    openModal(html);

    // attach listener AFTER DOM is injected
    const addBtn = document.querySelector(".quick-view-add");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        handleAddToCart(p);
      });
    }
  } catch (error) {
    console.error("QuickView load error:", error);
    openModal("<p>Error loading product.</p>");
  }
}

function handleAddToCart(product) {
  if (!product || !product.Id) {
    alertMessage("Unable to add this product to cart.");
    return;
  }

  let cart = Array.isArray(getLocalStorage("so-cart"))
    ? getLocalStorage("so-cart")
    : [];

  // try to find existing item
  const existing = cart.find((it) => it.Id === product.Id);
  if (existing) {
    existing.Qty = (existing.Qty || 1) + 1;
  } else {
    cart.push({
      Id: product.Id,
      Name: product.Name || product.NameWithoutBrand || "Product",
      Image: product.Images?.PrimaryMedium || "",
      FinalPrice: product.FinalPrice ?? product.ListPrice ?? 0,
      Qty: 1,
    });
  }

  setLocalStorage("so-cart", cart);

  // update cart count in UI (header)
  try {
    updateCartCount();
  } catch (e) {
    // fallback: silently continue if updateCartCount isn't available
    console.warn("updateCartCount failed:", e);
  }

  // show a small confirmation (non-intrusive)
  alertMessage(`${product.Name || "Item"} added to cart.`, false);

  // close the modal
  closeModal();
}
