"use strict";

/* ------------------------------------------------------------------
 * Settings
 * ------------------------------------------------------------------ */
const PROCESSING_DAYS = 2; // days needed to pack an order before it ships
const MIN_SHIPPING_CHARGE = 20; // minimum shipping cost in USD
const MAX_PREORDER_QUANTITY = 500;

const STATUS_LABELS = {
  ready: { text: "Ready stock", badgeClass: "badge-ready" },
  preorder: { text: "Pre-order", badgeClass: "badge-preorder" },
  soldout: { text: "Sold out", badgeClass: "badge-soldout" }
};

/* ------------------------------------------------------------------
 * DOM references
 * ------------------------------------------------------------------ */
const productGrid = document.getElementById("productGrid");
const availabilityFilter = document.getElementById("availabilityFilter");
const shippingTableBody = document.getElementById("shippingTableBody");
const faqAccordion = document.getElementById("faqAccordion");

const orderForm = document.getElementById("orderForm");
const productSelect = document.getElementById("productSelect");
const variantSelect = document.getElementById("variantSelect");
const quantityInput = document.getElementById("quantityInput");
const quantityFeedback = document.getElementById("quantityFeedback");
const stockHint = document.getElementById("stockHint");
const destinationSelect = document.getElementById("destinationSelect");

const resultEmpty = document.getElementById("resultEmpty");
const resultDetails = document.getElementById("resultDetails");

/* ------------------------------------------------------------------
 * Helper functions
 * ------------------------------------------------------------------ */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getVariantStatus(variant) {
  if (variant.stock > 0) {
    return "ready";
  }
  return variant.leadDays > 0 ? "preorder" : "soldout";
}

function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function findVariant(product, variantId) {
  return product ? product.variants.find((variant) => variant.id === variantId) : undefined;
}

function findDestination(destinationId) {
  return DESTINATIONS.find((destination) => destination.id === destinationId);
}

function getSelectedMethod() {
  return orderForm.elements.shippingMethod.value;
}

function setText(elementId, text) {
  document.getElementById(elementId).textContent = text;
}

function createStatusBadge(status) {
  const label = STATUS_LABELS[status];
  return `<span class="badge ${label.badgeClass}">${label.text}</span>`;
}

/* ------------------------------------------------------------------
 * Products (availability and variants)
 * ------------------------------------------------------------------ */
function createVariantRow(product, variant) {
  const status = getVariantStatus(variant);
  const stockText = status === "ready" ? ` (${variant.stock} in stock)` : "";
  const orderButton =
    status === "soldout"
      ? ""
      : `<button type="button" class="btn btn-sm btn-outline-rattan order-button"
                 data-product-id="${product.id}" data-variant-id="${variant.id}">Order</button>`;

  return `
    <li class="variant-item">
      <span class="variant-name">${variant.name}<small class="text-muted">${stockText}</small></span>
      ${createStatusBadge(status)}
      <span class="variant-price">${formatCurrency(variant.price)}</span>
      ${orderButton}
    </li>`;
}

function createProductCard(product) {
  const lowestPrice = Math.min(...product.variants.map((variant) => variant.price));
  const variantRows = product.variants.map((variant) => createVariantRow(product, variant)).join("");

  return `
    <div class="col">
      <article class="card product-card h-100 shadow-sm">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <span class="text-uppercase small text-muted">${product.category}</span>
          <h3 class="h5 card-title">${product.name}</h3>
          <p class="card-text">${product.description}</p>
          <p class="fw-semibold mb-2">From ${formatCurrency(lowestPrice)}</p>
          <ul class="variant-list mt-auto">${variantRows}</ul>
        </div>
      </article>
    </div>`;
}

function renderProducts(filter) {
  const visibleProducts = PRODUCTS.filter((product) => {
    return filter === "all" || product.variants.some((variant) => getVariantStatus(variant) === filter);
  });

  productGrid.innerHTML = visibleProducts.map(createProductCard).join("");
}

function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter]");
  if (!button) {
    return;
  }

  availabilityFilter.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderProducts(button.dataset.filter);
}

function handleOrderButtonClick(event) {
  const button = event.target.closest(".order-button");
  if (!button) {
    return;
  }

  productSelect.value = button.dataset.productId;
  populateVariantSelect();
  variantSelect.value = button.dataset.variantId;
  updateQuantityRules();
  calculateOrder();
  document.getElementById("order").scrollIntoView({ behavior: "smooth" });
}

/* ------------------------------------------------------------------
 * Order calculator
 * ------------------------------------------------------------------ */
function populateProductSelect() {
  const options = PRODUCTS.map((product) => `<option value="${product.id}">${product.name}</option>`);
  productSelect.innerHTML = `<option value="">Choose a product</option>${options.join("")}`;
}

function populateVariantSelect() {
  const product = findProduct(productSelect.value);

  if (!product) {
    variantSelect.innerHTML = '<option value="">Choose a product first</option>';
    variantSelect.disabled = true;
    return;
  }

  const options = product.variants.map((variant) => {
    const status = getVariantStatus(variant);
    const suffix = status === "soldout" ? " - sold out" : status === "preorder" ? " - pre-order" : "";
    const disabled = status === "soldout" ? "disabled" : "";
    return `<option value="${variant.id}" ${disabled}>${variant.name} (${formatCurrency(variant.price)})${suffix}</option>`;
  });

  variantSelect.innerHTML = `<option value="">Choose a variant</option>${options.join("")}`;
  variantSelect.disabled = false;
}

function populateDestinationSelect() {
  const options = DESTINATIONS.map((destination) => {
    return `<option value="${destination.id}">${destination.country}</option>`;
  });
  destinationSelect.innerHTML = `<option value="">Choose a destination</option>${options.join("")}`;
}

function updateQuantityRules() {
  const product = findProduct(productSelect.value);
  const variant = findVariant(product, variantSelect.value);

  if (!variant) {
    quantityInput.removeAttribute("max");
    stockHint.textContent = "";
    return;
  }

  if (getVariantStatus(variant) === "ready") {
    quantityInput.max = variant.stock;
    stockHint.textContent = `${variant.stock} units ready to ship.`;
  } else {
    quantityInput.max = MAX_PREORDER_QUANTITY;
    stockHint.textContent = `Made to order in about ${variant.leadDays} days.`;
  }
}

function showQuantityError(message) {
  quantityInput.classList.add("is-invalid");
  quantityFeedback.textContent = message;
}

function clearQuantityError() {
  quantityInput.classList.remove("is-invalid");
  quantityFeedback.textContent = "";
}

function showResult(isVisible) {
  resultDetails.classList.toggle("d-none", !isVisible);
  resultEmpty.classList.toggle("d-none", isVisible);
}

function buildInquiryLink(summary) {
  const subject = encodeURIComponent("Order inquiry - Ridwan Rattan Export");
  const body = encodeURIComponent(summary);
  return `mailto:hello@ridwanrattan.example?subject=${subject}&body=${body}`;
}

function calculateOrder() {
  const product = findProduct(productSelect.value);
  const variant = findVariant(product, variantSelect.value);
  const destination = findDestination(destinationSelect.value);
  const quantity = parseInt(quantityInput.value, 10);

  clearQuantityError();

  if (!product || !variant || !destination) {
    showResult(false);
    return;
  }

  if (Number.isNaN(quantity) || quantity < 1) {
    showQuantityError("Please enter a quantity of at least 1.");
    showResult(false);
    return;
  }

  const status = getVariantStatus(variant);
  const maxQuantity = status === "ready" ? variant.stock : MAX_PREORDER_QUANTITY;

  if (quantity > maxQuantity) {
    showQuantityError(`The maximum quantity for this variant is ${maxQuantity}.`);
    showResult(false);
    return;
  }

  // Price and shipping (all calculated with JavaScript)
  const method = getSelectedMethod();
  const tariff = destination[method];
  const subtotal = variant.price * quantity;
  const totalWeight = variant.weight * quantity;
  const shippingCost = Math.max(MIN_SHIPPING_CHARGE, tariff.perKg * totalWeight);
  const totalPrice = subtotal + shippingCost;

  // Estimated arrival date
  const leadDays = (status === "preorder" ? variant.leadDays : 0) + PROCESSING_DAYS;
  const today = new Date();
  const earliest = addDays(today, leadDays + tariff.minDays);
  const latest = addDays(today, leadDays + tariff.maxDays);
  const methodName = method === "sea" ? "sea freight" : "air freight";
  const estimateText = `${formatDate(earliest)} - ${formatDate(latest)}`;
  const estimateNote =
    `About ${leadDays + tariff.minDays} to ${leadDays + tariff.maxDays} days by ${methodName}` +
    (status === "preorder" ? `, including ${variant.leadDays} days of production.` : ".");

  // Show results
  setText("resProduct", product.name);
  setText("resVariant", `${variant.name} - ${STATUS_LABELS[status].text}`);
  setText("resUnitPrice", formatCurrency(variant.price));
  setText("resQuantity", String(quantity));
  setText("resSubtotal", formatCurrency(subtotal));
  setText("resWeight", `${totalWeight.toFixed(1)} kg`);
  setText("resShipping", formatCurrency(shippingCost));
  setText("resTotal", formatCurrency(totalPrice));
  setText("resEstimate", estimateText);
  setText("resEstimateNote", estimateNote);

  const summary = [
    "Hello Ridwan Rattan Export,",
    "",
    "I would like to order:",
    `Product: ${product.name} (${variant.name})`,
    `Quantity: ${quantity}`,
    `Destination: ${destination.country}`,
    `Shipping: ${methodName}`,
    `Products subtotal: ${formatCurrency(subtotal)}`,
    `Shipping cost: ${formatCurrency(shippingCost)}`,
    `Total price: ${formatCurrency(totalPrice)}`,
    `Estimated arrival: ${estimateText}`
  ].join("\n");

  document.getElementById("inquiryLink").href = buildInquiryLink(summary);
  showResult(true);
}

function handleVariantChange() {
  updateQuantityRules();
  calculateOrder();
}

function handleProductChange() {
  populateVariantSelect();
  updateQuantityRules();
  calculateOrder();
}

function handleReset() {
  // Wait for the form to reset its fields before rebuilding the dependent lists
  window.setTimeout(() => {
    populateVariantSelect();
    updateQuantityRules();
    clearQuantityError();
    showResult(false);
  }, 0);
}

/* ------------------------------------------------------------------
 * Shipping table
 * ------------------------------------------------------------------ */
function renderShippingTable() {
  shippingTableBody.innerHTML = DESTINATIONS.map((destination) => {
    return `
      <tr>
        <th scope="row">${destination.country}</th>
        <td>${formatCurrency(destination.sea.perKg)}</td>
        <td>${destination.sea.minDays} - ${destination.sea.maxDays} days</td>
        <td>${formatCurrency(destination.air.perKg)}</td>
        <td>${destination.air.minDays} - ${destination.air.maxDays} days</td>
      </tr>`;
  }).join("");

  setText("minChargeText", formatCurrency(MIN_SHIPPING_CHARGE));
}

/* ------------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------------ */
function renderFaq() {
  faqAccordion.innerHTML = FAQS.map((faq, index) => {
    const headingId = `faqHeading${index}`;
    const collapseId = `faqCollapse${index}`;
    const isFirst = index === 0;

    return `
      <div class="accordion-item">
        <h3 class="accordion-header" id="${headingId}">
          <button class="accordion-button ${isFirst ? "" : "collapsed"}" type="button"
                  data-bs-toggle="collapse" data-bs-target="#${collapseId}"
                  aria-expanded="${isFirst}" aria-controls="${collapseId}">
            ${faq.question}
          </button>
        </h3>
        <div id="${collapseId}" class="accordion-collapse collapse ${isFirst ? "show" : ""}"
             aria-labelledby="${headingId}" data-bs-parent="#faqAccordion">
          <div class="accordion-body">${faq.answer}</div>
        </div>
      </div>`;
  }).join("");
}

/* ------------------------------------------------------------------
 * Initialise the page
 * ------------------------------------------------------------------ */
function init() {
  renderProducts("all");
  renderShippingTable();
  renderFaq();

  populateProductSelect();
  populateVariantSelect();
  populateDestinationSelect();

  availabilityFilter.addEventListener("click", handleFilterClick);
  productGrid.addEventListener("click", handleOrderButtonClick);

  productSelect.addEventListener("change", handleProductChange);
  variantSelect.addEventListener("change", handleVariantChange);
  quantityInput.addEventListener("input", calculateOrder);
  destinationSelect.addEventListener("change", calculateOrder);
  orderForm.querySelectorAll('input[name="shippingMethod"]').forEach((radio) => {
    radio.addEventListener("change", calculateOrder);
  });
  orderForm.addEventListener("reset", handleReset);
  orderForm.addEventListener("submit", (event) => event.preventDefault());

  setText("currentYear", String(new Date().getFullYear()));
}

init();
