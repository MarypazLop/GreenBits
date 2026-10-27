/* ==========================================================================
   GreenBits — Sample data
   All producers, lots and prices are EXAMPLES for the demo.
   Later this file can be replaced by a call to the real API.
   ========================================================================== */
window.GB = window.GB || {};

(function (GB) {
  "use strict";

  /** Builds an ISO date "n" days in the past (keeps the demo always fresh) */
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

  /** San Carlos districts used as zones */
  const zones = [
    "Ciudad Quesada", "Florencia", "Aguas Zarcas", "Pital",
    "Venecia", "La Fortuna", "Santa Rosa", "Pocosol",
  ];

  /** Main categories of the marketplace */
  const categories = {
    segunda: {
      label: "Producto de segunda",
      short: "Segunda calidad",
      description: "Fruta y verdura fuera del estándar de tamaño o aspecto, perfecta para jugos, salsas, repostería y consumo.",
    },
    biomasa: {
      label: "Biomasa",
      short: "Biomasa",
      description: "Cáscaras, bagazo, hojas y podas con uso real en compost, alimentación animal y cosmética natural.",
    },
  };

  /** Product types: each one links to an illustration and a background tone */
  const products = {
    tomate:        { name: "Tomate",              category: "segunda", art: "tomato",      tone: "tomato",    unit: "kg" },
    banano:        { name: "Banano",              category: "segunda", art: "banana",      tone: "banana",    unit: "kg" },
    pina:          { name: "Piña",                category: "segunda", art: "pineapple",   tone: "pineapple", unit: "unid." },
    naranja:       { name: "Naranja",             category: "segunda", art: "orange",      tone: "orange",    unit: "kg" },
    papaya:        { name: "Papaya",              category: "segunda", art: "papaya",      tone: "orange",    unit: "kg" },
    chile:         { name: "Chile dulce",         category: "segunda", art: "pepper",      tone: "tomato",    unit: "kg" },
    yuca:          { name: "Yuca",                category: "segunda", art: "cassava",     tone: "root",      unit: "kg" },
    cascaraPina:   { name: "Cáscara de piña",     category: "biomasa", art: "pineapplePeel", tone: "pineapple", unit: "kg" },
    bagazo:        { name: "Bagazo de caña",      category: "biomasa", art: "bagasse",     tone: "earth",     unit: "kg" },
    hojas:         { name: "Hojas de plátano",    category: "biomasa", art: "leaf",        tone: "green",     unit: "kg" },
    pulpaCafe:     { name: "Pulpa de café",       category: "biomasa", art: "coffee",      tone: "coffee",    unit: "kg" },
    podas:         { name: "Podas de cítricos",   category: "biomasa", art: "branches",    tone: "green",     unit: "kg" },
    cascaraNaranja:{ name: "Cáscara de naranja",  category: "biomasa", art: "orangePeel",  tone: "orange",    unit: "kg" },
  };

  /** Who buys on GreenBits (used in filters and the landing page) */
  const buyerTypes = ["Sodas", "Reposterías", "Compostaje", "Cosmética natural", "Fincas"];

  /**
   * Sample lots.
   * `uses` = suggested uses shown on the card detail.
   * `delivery` = whether the producer can deliver or only allows pickup.
   */
  const lots = [
    {
      id: "L-001", product: "tomate", title: "Tomate de segunda", qty: 120, price: 350,
      zone: "Pital", producer: "Eduardo Solís", rating: 4.8, createdAt: daysAgo(0), delivery: true,
      uses: ["Salsas", "Sodas", "Conservas"],
      note: "Tomate maduro con detalles de forma. Ideal para salsa y picadillo.",
    },
    {
      id: "L-002", product: "pina", title: "Piña pequeña MD2", qty: 300, price: 250,
      zone: "Venecia", producer: "Finca Los Laureles", rating: 4.9, createdAt: daysAgo(1), delivery: true,
      uses: ["Jugos", "Repostería", "Fermentados"],
      note: "Piña bajo calibre de exportación, dulce y en buen estado.",
    },
    {
      id: "L-003", product: "cascaraPina", title: "Cáscara y corona de piña", qty: 800, price: 30,
      zone: "Venecia", producer: "Finca Los Laureles", rating: 4.9, createdAt: daysAgo(1), delivery: false,
      uses: ["Compost", "Alimentación animal", "Vinagre"],
      note: "Producida a diario en la planta de empaque. Retiro en finca.",
    },
    {
      id: "L-004", product: "banano", title: "Banano maduro", qty: 180, price: 200,
      zone: "Aguas Zarcas", producer: "Marta Vargas", rating: 4.6, createdAt: daysAgo(2), delivery: true,
      uses: ["Repostería", "Batidos", "Harina"],
      note: "Banano con pecas, perfecto para queques y batidos.",
    },
    {
      id: "L-005", product: "naranja", title: "Naranja para jugo", qty: 450, price: 180,
      zone: "Santa Rosa", producer: "Cooperativa Cítricos del Norte", rating: 4.7, createdAt: daysAgo(3), delivery: true,
      uses: ["Jugos", "Sodas", "Mermeladas"],
      note: "Cáscara manchada pero mucho jugo. Se vende por saco de 20 kg.",
    },
    {
      id: "L-006", product: "bagazo", title: "Bagazo de caña seco", qty: 1500, price: 20,
      zone: "Florencia", producer: "Trapiche La Esperanza", rating: 4.5, createdAt: daysAgo(4), delivery: false,
      uses: ["Compost", "Cama para animales", "Combustible"],
      note: "Bagazo seco de la última molienda, en sacos.",
    },
    {
      id: "L-007", product: "papaya", title: "Papaya pintona", qty: 90, price: 300,
      zone: "Pital", producer: "Luis Rojas", rating: 4.4, createdAt: daysAgo(1), delivery: true,
      uses: ["Batidos", "Ensaladas", "Sodas"],
      note: "Papaya con raspones superficiales, pulpa intacta.",
    },
    {
      id: "L-008", product: "pulpaCafe", title: "Pulpa de café fresca", qty: 600, price: 25,
      zone: "Ciudad Quesada", producer: "Beneficio Altura Norte", rating: 4.8, createdAt: daysAgo(2), delivery: false,
      uses: ["Compost", "Cosmética natural", "Infusión de cáscara"],
      note: "Pulpa del despulpado del día. Se recomienda retirar en 48 h.",
    },
    {
      id: "L-009", product: "chile", title: "Chile dulce de segunda", qty: 60, price: 600,
      zone: "Ciudad Quesada", producer: "Ana Jiménez", rating: 4.7, createdAt: daysAgo(0), delivery: true,
      uses: ["Sodas", "Salsas", "Encurtidos"],
      note: "Chiles torcidos o pequeños, mismo sabor de siempre.",
    },
    {
      id: "L-010", product: "hojas", title: "Hojas de plátano", qty: 200, price: 60,
      zone: "La Fortuna", producer: "Finca El Arenal", rating: 4.6, createdAt: daysAgo(5), delivery: true,
      uses: ["Tamales", "Alimentación animal", "Compost"],
      note: "Hojas limpias, ideales para envolver tamales en temporada.",
    },
    {
      id: "L-011", product: "yuca", title: "Yuca de segunda", qty: 250, price: 280,
      zone: "Pocosol", producer: "Hermanos Quesada", rating: 4.5, createdAt: daysAgo(3), delivery: true,
      uses: ["Sodas", "Harina", "Alimentación animal"],
      note: "Yuca fuera de calibre para exportación, fresca de la semana.",
    },
    {
      id: "L-012", product: "podas", title: "Podas de cítricos", qty: 900, price: 15,
      zone: "Santa Rosa", producer: "Cooperativa Cítricos del Norte", rating: 4.7, createdAt: daysAgo(6), delivery: false,
      uses: ["Compost", "Mulch", "Biocarbón"],
      note: "Ramas y hojas de la poda de enero, ya picadas.",
    },
    {
      id: "L-013", product: "cascaraNaranja", title: "Cáscara de naranja", qty: 350, price: 40,
      zone: "Santa Rosa", producer: "Cooperativa Cítricos del Norte", rating: 4.7, createdAt: daysAgo(1), delivery: false,
      uses: ["Cosmética natural", "Aceites esenciales", "Compost"],
      note: "Subproducto de la planta de jugo, separado del resto de residuos.",
    },
    {
      id: "L-014", product: "tomate", title: "Tomate cherry de segunda", qty: 40, price: 700,
      zone: "Aguas Zarcas", producer: "Invernadero Doña Rosa", rating: 5.0, createdAt: daysAgo(2), delivery: true,
      uses: ["Repostería salada", "Sodas", "Ensaladas"],
      note: "Cherry rajado por lluvia, recogido el mismo día.",
    },
    {
      id: "L-015", product: "banano", title: "Banano verde", qty: 220, price: 150,
      zone: "Pocosol", producer: "Hermanos Quesada", rating: 4.5, createdAt: daysAgo(4), delivery: true,
      uses: ["Harina", "Patacones", "Alimentación animal"],
      note: "Racimos pequeños rechazados por tamaño.",
      soldOut: true,
    },
    {
      id: "L-016", product: "pina", title: "Piña para fermentar", qty: 150, price: 180,
      zone: "Pital", producer: "Eduardo Solís", rating: 4.8, createdAt: daysAgo(3), delivery: true,
      uses: ["Vinagre", "Chicha", "Jugos"],
      note: "Piña muy madura, ideal para fermentados y vinagre.",
    },
  ];

  /** Impact numbers shown on the landing page (example values) */
  const impact = [
    { value: 18400, suffix: " kg", label: "Producto rescatado" },
    { value: 126, suffix: "", label: "Productores en San Carlos" },
    { value: 74, suffix: "", label: "Compradores activos" },
    { value: 9.6, suffix: " t", label: "CO₂e evitado", decimals: 1 },
  ];

  GB.data = { zones, categories, products, buyerTypes, lots, impact };
})(window.GB);
