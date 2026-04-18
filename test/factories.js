// tests/factories.js
const { faker } = require('@faker-js/faker');
const { Product } = require('../src/models/product');

/**
 * Membangun objek produk palsu (tanpa menyimpan ke database)
 * @param {Object} overrides - Data yang akan menimpa nilai default
 * @returns {Object} - Objek produk palsu
 */
const buildProduct = (overrides = {}) => {
  return {
    id: overrides.id || faker.string.uuid(),
    name: overrides.name || faker.commerce.productName(),
    category: overrides.category || faker.commerce.department(),
    price: overrides.price !== undefined ? overrides.price : parseFloat(faker.commerce.price({ min: 1000, max: 10000000 })),
    stock: overrides.stock !== undefined ? overrides.stock : faker.number.int({ min: 0, max: 1000 }),
    availability: overrides.availability !== undefined ? overrides.availability : faker.datatype.boolean(),
    description: overrides.description || faker.commerce.productDescription(),
    created_at: overrides.created_at || faker.date.past(),
    updated_at: overrides.updated_at || faker.date.recent(),
  };
};

/**
 * Membuat produk palsu dan menyimpannya ke database
 * @param {Object} overrides - Data yang akan menimpa nilai default
 * @returns {Promise<Object>} - Produk yang telah disimpan
 */
const createProduct = async (overrides = {}) => {
  const productData = buildProduct(overrides);
  const product = await Product.create(productData);
  return product;
};

/**
 * Factory untuk membuat produk palsu
 */
const ProductFactory = {
  /**
   * Membangun objek produk palsu (tanpa simpan ke database)
   * @param {Object} overrides - Data yang akan menimpa nilai default
   * @returns {Object} - Objek produk palsu
   */
  build: buildProduct,

  /**
   * Membuat produk palsu dan menyimpannya ke database
   * @param {Object} overrides - Data yang akan menimpa nilai default
   * @returns {Promise<Object>} - Produk yang telah disimpan
   */
  create: createProduct,

  /**
   * Membangun daftar objek produk palsu (tanpa simpan ke database)
   * @param {number} count - Jumlah produk yang akan dibuat
   * @param {Object} overrides - Data yang akan menimpa nilai default
   * @returns {Array} - Array objek produk palsu
   */
  buildList: (count, overrides = {}) => {
    return Array.from({ length: count }, () => buildProduct(overrides));
  },

  /**
   * Membuat daftar produk palsu dan menyimpannya ke database
   * @param {number} count - Jumlah produk yang akan dibuat
   * @param {Object} overrides - Data yang akan menimpa nilai default
   * @returns {Promise<Array>} - Array produk yang telah disimpan
   */
  createList: async (count, overrides = {}) => {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push(await createProduct(overrides));
    }
    return products;
  },
};

module.exports = ProductFactory;