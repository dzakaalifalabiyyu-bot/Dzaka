"use strict";

/*
 * Ridwan Rattan Export - website data
 * All products, variants, shipping rates and FAQs live here.
 * Prices are in US dollars (USD). Weights are in kilograms (kg).
 *
 * Variant availability rules:
 *   stock > 0                  -> "Ready stock"
 *   stock = 0 and leadDays > 0 -> "Pre-order" (made after the order is placed)
 *   stock = 0 and leadDays = 0 -> "Sold out"
 */

const PRODUCTS = [
  {
    id: "peacock-chair",
    name: "Cirebon Peacock Chair",
    category: "Furniture",
    image: "images.jpg",
    description:
      "A statement chair with a fan-shaped back, hand-woven from solid rattan poles and peeled core. Strong, light and made for terraces, cafes and living rooms.",
    variants: [
      { id: "peacock-natural", name: "Natural finish", price: 85, weight: 6, stock: 40, leadDays: 0 },
      { id: "peacock-black", name: "Black stained", price: 95, weight: 6, stock: 0, leadDays: 14 },
      { id: "peacock-white", name: "White washed", price: 92, weight: 6, stock: 0, leadDays: 0 }
    ]
  },
  {
    id: "storage-basket",
    name: "Woven Storage Basket Set",
    category: "Home Decor",
    image: "images (1).jpg",
    description:
      "A set of three nesting baskets with sturdy handles. Perfect for laundry, toys, blankets or as a plant cover. Finished with a water-resistant coating.",
    variants: [
      { id: "basket-small", name: "Small set (25, 30, 35 cm)", price: 38, weight: 2.5, stock: 120, leadDays: 0 },
      { id: "basket-large", name: "Large set (35, 42, 50 cm)", price: 64, weight: 4.5, stock: 55, leadDays: 0 },
      { id: "basket-lid", name: "Large set with lids", price: 79, weight: 5.5, stock: 0, leadDays: 10 }
    ]
  },
  {
    id: "pendant-lamp",
    name: "Rattan Pendant Lamp",
    category: "Lighting",
    image: "images (2).jpg",
    description:
      "A dome-shaped pendant lamp that casts soft, patterned light. Supplied with a 1.5 m cable and an E27 fitting, ready to hang.",
    variants: [
      { id: "lamp-40", name: "40 cm diameter", price: 29, weight: 1.2, stock: 80, leadDays: 0 },
      { id: "lamp-60", name: "60 cm diameter", price: 45, weight: 2, stock: 30, leadDays: 0 },
      { id: "lamp-80", name: "80 cm diameter", price: 69, weight: 3.2, stock: 0, leadDays: 12 }
    ]
  },
  {
    id: "round-table",
    name: "Round Rattan Coffee Table",
    category: "Furniture",
    image: "images (3).jpg",
    description:
      "A low round table with a woven rattan frame and a tempered glass top. Easy to assemble and ships flat-packed to protect it in transit.",
    variants: [
      { id: "table-70", name: "70 cm, natural", price: 110, weight: 9, stock: 18, leadDays: 0 },
      { id: "table-90", name: "90 cm, natural", price: 145, weight: 12, stock: 0, leadDays: 18 }
    ]
  },
  {
    id: "rattan-webbing",
    name: "Rattan Webbing Roll",
    category: "Raw Material",
    image: "images (4).jpg",
    description:
      "Pre-woven cane webbing for furniture makers, upholsterers and designers. Cut to size and use it in cabinet doors, headboards and chair backs.",
    variants: [
      { id: "webbing-open", name: "Open weave, 50 cm x 10 m", price: 55, weight: 4, stock: 200, leadDays: 0 },
      { id: "webbing-close", name: "Close weave, 50 cm x 10 m", price: 62, weight: 4.5, stock: 90, leadDays: 0 },
      { id: "webbing-wide", name: "Open weave, 90 cm x 10 m", price: 95, weight: 7, stock: 0, leadDays: 0 }
    ]
  }
];

/*
 * Shipping tariffs per destination country.
 * Cost = rate per kg x total weight (with a minimum charge, see script.js).
 * Transit days are counted after the order has been packed.
 */
const DESTINATIONS = [
  {
    id: "sg",
    country: "Singapore",
    sea: { perKg: 1.2, minDays: 5, maxDays: 8 },
    air: { perKg: 6.5, minDays: 2, maxDays: 4 }
  },
  {
    id: "my",
    country: "Malaysia",
    sea: { perKg: 1.4, minDays: 6, maxDays: 10 },
    air: { perKg: 6.8, minDays: 2, maxDays: 5 }
  },
  {
    id: "au",
    country: "Australia",
    sea: { perKg: 2.6, minDays: 14, maxDays: 20 },
    air: { perKg: 9.5, minDays: 3, maxDays: 6 }
  },
  {
    id: "jp",
    country: "Japan",
    sea: { perKg: 2.4, minDays: 12, maxDays: 18 },
    air: { perKg: 9.0, minDays: 3, maxDays: 6 }
  },
  {
    id: "ae",
    country: "United Arab Emirates",
    sea: { perKg: 2.9, minDays: 18, maxDays: 25 },
    air: { perKg: 10.2, minDays: 3, maxDays: 7 }
  },
  {
    id: "nl",
    country: "Netherlands",
    sea: { perKg: 3.4, minDays: 28, maxDays: 38 },
    air: { perKg: 11.5, minDays: 4, maxDays: 8 }
  },
  {
    id: "de",
    country: "Germany",
    sea: { perKg: 3.5, minDays: 28, maxDays: 40 },
    air: { perKg: 11.8, minDays: 4, maxDays: 8 }
  },
  {
    id: "us",
    country: "United States",
    sea: { perKg: 3.8, minDays: 30, maxDays: 42 },
    air: { perKg: 12.5, minDays: 4, maxDays: 9 }
  }
];

const FAQS = [
  {
    question: "What is the minimum order quantity?",
    answer:
      "There is no minimum order for finished products, so you can order a single chair as a sample. For raw material such as webbing rolls, we recommend at least 10 rolls to make shipping worthwhile."
  },
  {
    question: "How long does it take to make a pre-order item?",
    answer:
      "Pre-order items are made by our artisans after your order is confirmed. Production takes between 10 and 18 days depending on the product. The lead time is already included in the arrival estimate in the order calculator."
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept international bank transfer (T/T) and PayPal. For first orders we ask for a 50% deposit, and the balance is paid before the goods are shipped."
  },
  {
    question: "How is the shipping cost calculated?",
    answer:
      "The cost is calculated from the total weight of your order and the tariff per kilogram for your country and shipping method. A minimum shipping charge applies to small parcels."
  },
  {
    question: "What is the difference between sea freight and air freight?",
    answer:
      "Sea freight is the cheapest option and is ideal for large or heavy orders, but it takes longer. Air freight is much faster and suits samples or urgent orders, at a higher price per kilogram."
  },
  {
    question: "How do you protect the products during shipping?",
    answer:
      "Every item is dried, checked for moisture and treated against insects before packing. We wrap each product in paper and bubble film, then pack it in double-wall cartons, or wooden crates for large orders."
  },
  {
    question: "Can I ask for custom sizes or colors?",
    answer:
      "Yes. Our workshop in Cirebon can produce custom sizes, stains and weave patterns. Send us a sketch or a photo by email, and we will reply with a quotation within two working days."
  },
  {
    question: "Do you provide export documents?",
    answer:
      "Yes. We prepare the commercial invoice, packing list, certificate of origin and a phytosanitary certificate whenever your country requires one."
  }
];
