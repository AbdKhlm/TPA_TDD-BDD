// features/step_definitions/web_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { app } = require('../../src/app'); // Import Express app
const request = require('supertest');

// Inisialisasi agent supertest (akan digunakan di setiap skenario)
let agent;

Given('the system has no products', async () => {
  // Anda perlu mengimplementasikan pembersihan database, misalnya:
  // const { Product } = require('../../src/models/product');
  // await Product.deleteAll();
});

// ==================== HTTP REQUEST STEPS ====================

When('I send a GET request to {string}', async function (url) {
  // Ganti placeholder {id} jika ada di url? Bisa ditangani di langkah lain.
  agent = request.agent(app);
  this.response = await agent.get(url);
});

When('I send a GET request to {string} with id of {string}', async function (url, productName) {
  // Cari ID produk berdasarkan nama (asumsikan ada method findByName)
  const { Product } = require('../../src/models/product');
  const products = await Product.findByName(productName);
  if (!products || products.length === 0) {
    throw new Error(`Product with name "${productName}" not found`);
  }
  const productId = products[0].id;
  const fullUrl = url.replace('{id}', productId);
  agent = request.agent(app);
  this.response = await agent.get(fullUrl);
});

When('I send a POST request to {string} with the following data', async function (url, dataTable) {
  const data = dataTable.rowsHash(); // Ubah tabel menjadi objek { key: value }
  agent = request.agent(app);
  this.response = await agent.post(url).send(data);
});

When('I send a PUT request to {string} with id of {string} and the following update data', async function (url, productName, dataTable) {
  const { Product } = require('../../src/models/product');
  const products = await Product.findByName(productName);
  if (!products || products.length === 0) {
    throw new Error(`Product with name "${productName}" not found`);
  }
  const productId = products[0].id;
  const fullUrl = url.replace('{id}', productId);
  const updateData = dataTable.rowsHash();
  agent = request.agent(app);
  this.response = await agent.put(fullUrl).send(updateData);
});

When('I send a PUT request to {string} with update data', async function (url, dataTable) {
  const updateData = dataTable.rowsHash();
  agent = request.agent(app);
  this.response = await agent.put(url).send(updateData);
});

When('I send a DELETE request to {string} with id of {string}', async function (url, productName) {
  const { Product } = require('../../src/models/product');
  const products = await Product.findByName(productName);
  if (!products || products.length === 0) {
    throw new Error(`Product with name "${productName}" not found`);
  }
  const productId = products[0].id;
  const fullUrl = url.replace('{id}', productId);
  agent = request.agent(app);
  this.response = await agent.delete(fullUrl);
});

When('I send a DELETE request to {string}', async function (url) {
  agent = request.agent(app);
  this.response = await agent.delete(url);
});

// ==================== RESPONSE VERIFICATION STEPS ====================

Then('the response status code should be {int}', function (statusCode) {
  expect(this.response.statusCode).to.equal(statusCode);
});

Then('the response body should contain product details with name {string}, category {string}, price {int}, stock {int}, and availability {string}', function (name, category, price, stock, availability) {
  const body = this.response.body;
  expect(body.name).to.equal(name);
  expect(body.category).to.equal(category);
  expect(body.price).to.equal(price);
  expect(body.stock).to.equal(stock);
  expect(body.availability).to.equal(availability === 'true');
});

Then('the response body should have an error message {string}', function (message) {
  expect(this.response.body.error).to.equal(message);
});

Then('the response body should be a list containing at least {int} products', function (count) {
  expect(this.response.body).to.be.an('array');
  expect(this.response.body.length).to.be.at.least(count);
});

Then('the list should include a product with name {string}, category {string}, price {int}, stock {int}, availability {string}', function (name, category, price, stock, availability) {
  const products = this.response.body;
  const found = products.find(p => p.name === name && p.category === category && p.price === price && p.stock === stock && p.availability === (availability === 'true'));
  expect(found).to.exist;
});

Then('the response body should be a list containing exactly {int} products', function (count) {
  expect(this.response.body).to.be.an('array');
  expect(this.response.body.length).to.equal(count);
});

Then('every product in the list should have category {string}', function (category) {
  const products = this.response.body;
  products.forEach(p => {
    expect(p.category).to.equal(category);
  });
});

Then('every product in the list should have availability {string}', function (availability) {
  const expected = availability === 'true';
  const products = this.response.body;
  products.forEach(p => {
    expect(p.availability).to.equal(expected);
  });
});

Then('every product in the list should have name that contains {string} (case-insensitive)', function (substring) {
  const products = this.response.body;
  products.forEach(p => {
    expect(p.name.toLowerCase()).to.include(substring.toLowerCase());
  });
});

Then('the product should have name {string}, category {string}, price {int}', function (name, category, price) {
  const body = this.response.body;
  expect(body.name).to.equal(name);
  expect(body.category).to.equal(category);
  expect(body.price).to.equal(price);
});

Then('the category should still be {string}', function (category) {
  expect(this.response.body.category).to.equal(category);
});

Then('the response body should be an empty list', function () {
  expect(this.response.body).to.be.an('array').that.is.empty;
});

Then('the response body should be a list containing all products', async function () {
  const { Product } = require('../../src/models/product');
  const allProducts = await Product.findAll();
  expect(this.response.body).to.deep.equal(allProducts);
});

// ==================== UI STEPS (opsional, jika ada pengujian antarmuka web) ====================
// Catatan: Langkah-langkah ini membutuhkan browser automation (Puppeteer/Playwright).
// Contoh berikut menggunakan asumsi ada `page` di world.js.

When('I click the button {string}', async function (buttonText) {
  const { page } = this;
  await page.click(`button:has-text("${buttonText}")`);
});

When('I fill in {string} with {string}', async function (fieldName, value) {
  const { page } = this;
  await page.fill(`input[name="${fieldName}"]`, value);
});

Then('I should see the text {string}', async function (expectedText) {
  const { page } = this;
  const bodyText = await page.$eval('body', el => el.innerText);
  expect(bodyText).to.include(expectedText);
});

Then('I should not see the text {string}', async function (unexpectedText) {
  const { page } = this;
  const bodyText = await page.$eval('body', el => el.innerText);
  expect(bodyText).to.not.include(unexpectedText);
});

Then('the success message {string} should be displayed', async function (message) {
  const { page } = this;
  const successEl = await page.$('.alert-success, .success-message');
  if (!successEl) throw new Error('Success message element not found');
  const text = await successEl.innerText();
  expect(text).to.include(message);
});

Then('the error message {string} should be displayed', async function (message) {
  const { page } = this;
  const errorEl = await page.$('.alert-danger, .error-message');
  if (!errorEl) throw new Error('Error message element not found');
  const text = await errorEl.innerText();
  expect(text).to.include(message);
});