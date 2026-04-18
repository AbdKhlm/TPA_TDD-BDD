// tests/routes/products.test.js
const request = require('supertest');
const app = require('../../src/app');
const { Product } = require('../../src/models/product');
const ProductFactory = require('../factories');

// Reset database sebelum setiap test
beforeEach(async () => {
  await Product.deleteAll();
});

describe('Product Routes', () => {
  // ==================== Tugas 3.1: READ ====================
  describe('GET /products/:id - READ', () => {
    it('should return 200 and the product when product exists', async () => {
      const product = await ProductFactory.create({
        name: 'Test Product',
        category: 'Electronics',
        price: 99999,
        stock: 20,
        availability: true,
      });

      const response = await request(app)
        .get(`/products/${product.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', product.id);
      expect(response.body).toHaveProperty('name', 'Test Product');
      expect(response.body).toHaveProperty('category', 'Electronics');
      expect(response.body).toHaveProperty('price', 99999);
      expect(response.body).toHaveProperty('stock', 20);
      expect(response.body).toHaveProperty('availability', true);
    });

    it('should return 404 when product not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/products/${nonExistentId}`)
        .expect(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid-id-format';
      const response = await request(app)
        .get(`/products/${invalidId}`)
        .expect(400);
      expect(response.body).toHaveProperty('error', 'Invalid product ID');
    });
  });

  // ==================== Tugas 3.2: UPDATE ====================
  describe('PUT /products/:id - UPDATE', () => {
    it('should return 200 and update product successfully when data is valid', async () => {
      const existingProduct = await ProductFactory.create({
        name: 'Old Name',
        category: 'Old Category',
        price: 10000,
        stock: 5,
        availability: false,
      });

      const updateData = {
        name: 'New Name',
        price: 25000,
        stock: 10,
        availability: true,
      };

      const response = await request(app)
        .put(`/products/${existingProduct.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingProduct.id);
      expect(response.body.name).toBe('New Name');
      expect(response.body.price).toBe(25000);
      expect(response.body.stock).toBe(10);
      expect(response.body.availability).toBe(true);
      expect(response.body.category).toBe('Old Category'); // tidak berubah

      const updatedInDb = await Product.findById(existingProduct.id);
      expect(updatedInDb.name).toBe('New Name');
    });

    it('should return 404 when trying to update non-existent product', async () => {
      const nonExistentId = 'nonexistent-id-123';
      const updateData = { name: 'New Name' };
      const response = await request(app)
        .put(`/products/${nonExistentId}`)
        .send(updateData)
        .expect(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it('should return 400 when update data is invalid (negative price)', async () => {
      const product = await ProductFactory.create();
      const invalidData = { price: -500 };
      const response = await request(app)
        .put(`/products/${product.id}`)
        .send(invalidData)
        .expect(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow partial update (only send some fields)', async () => {
      const product = await ProductFactory.create({
        name: 'Original',
        category: 'Test',
        price: 5000,
        stock: 3,
      });

      const response = await request(app)
        .put(`/products/${product.id}`)
        .send({ name: 'Updated Only Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Only Name');
      expect(response.body.price).toBe(5000);
      expect(response.body.stock).toBe(3);
    });
  });

  // ==================== Tugas 3.3: DELETE ====================
  describe('DELETE /products/:id - DELETE', () => {
    it('should return 204 when deleting an existing product', async () => {
      const product = await ProductFactory.create({
        name: 'Product to Delete',
        category: 'Test',
        price: 5000,
      });

      const response = await request(app)
        .delete(`/products/${product.id}`)
        .expect(204);

      expect(response.body).toEqual({});

      const deletedProduct = await Product.findById(product.id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 when trying to delete a non-existent product', async () => {
      const nonExistentId = 'nonexistent-id-999';
      const response = await request(app)
        .delete(`/products/${nonExistentId}`)
        .expect(404);
      expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid-format';
      const response = await request(app)
        .delete(`/products/${invalidId}`)
        .expect(400);
      expect(response.body).toHaveProperty('error', 'Invalid product ID');
    });

    it('should not affect other products when deleting one', async () => {
      const product1 = await ProductFactory.create({ name: 'Keep1' });
      const product2 = await ProductFactory.create({ name: 'Keep2' });
      const toDelete = await ProductFactory.create({ name: 'DeleteMe' });

      await request(app)
        .delete(`/products/${toDelete.id}`)
        .expect(204);

      const stillExists1 = await Product.findById(product1.id);
      const stillExists2 = await Product.findById(product2.id);
      const deletedCheck = await Product.findById(toDelete.id);

      expect(stillExists1).not.toBeNull();
      expect(stillExists2).not.toBeNull();
      expect(deletedCheck).toBeNull();
    });
  });

  // ==================== Tugas 3.4: LIST ALL ====================
  describe('GET /products - LIST ALL', () => {
    it('should return 200 and all products when no query filters are applied', async () => {
      const product1 = await ProductFactory.create({ name: 'Product A' });
      const product2 = await ProductFactory.create({ name: 'Product B' });
      const product3 = await ProductFactory.create({ name: 'Product C' });

      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      const ids = response.body.map(p => p.id);
      expect(ids).toContain(product1.id);
      expect(ids).toContain(product2.id);
      expect(ids).toContain(product3.id);
    });

    it('should return empty array when no products exist', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return products with correct structure', async () => {
      const product = await ProductFactory.create({
        name: 'Structure Test',
        category: 'Test Cat',
        price: 12345,
        stock: 99,
        availability: true,
      });

      const response = await request(app)
        .get('/products')
        .expect(200);

      const found = response.body.find(p => p.id === product.id);
      expect(found).toHaveProperty('id');
      expect(found).toHaveProperty('name', 'Structure Test');
      expect(found).toHaveProperty('category', 'Test Cat');
      expect(found).toHaveProperty('price', 12345);
      expect(found).toHaveProperty('stock', 99);
      expect(found).toHaveProperty('availability', true);
    });
  });

  // ==================== Tugas 3.5: LIST BY NAME ====================
  describe('GET /products?name=... - LIST BY NAME', () => {
    it('should return 200 and products matching exact name', async () => {
      const targetProduct = await ProductFactory.create({ name: 'ExactNameProduct' });
      await ProductFactory.create({ name: 'OtherProduct' });
      await ProductFactory.create({ name: 'AnotherName' });

      const response = await request(app)
        .get('/products?name=ExactNameProduct')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(targetProduct.id);
      expect(response.body[0].name).toBe('ExactNameProduct');
    });

    it('should return 200 and products matching partial name (case-insensitive)', async () => {
      await ProductFactory.create({ name: 'Apple MacBook' });
      await ProductFactory.create({ name: 'Apple iPhone' });
      await ProductFactory.create({ name: 'Samsung Galaxy' });

      const response = await request(app)
        .get('/products?name=apple')
        .expect(200);

      expect(response.body.length).toBe(2);
      response.body.forEach(product => {
        expect(product.name.toLowerCase()).toContain('apple');
      });
    });

    it('should return empty array when no product matches the name', async () => {
      await ProductFactory.create({ name: 'Laptop' });
      await ProductFactory.create({ name: 'Mouse' });

      const response = await request(app)
        .get('/products?name=NonExistentName')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return all products when name query parameter is empty', async () => {
      await ProductFactory.createList(3);
      const response = await request(app)
        .get('/products?name=')
        .expect(200);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ==================== Tugas 3.6: LIST BY CATEGORY ====================
  describe('GET /products?category=... - LIST BY CATEGORY', () => {
    it('should return 200 and products matching exact category', async () => {
      const product1 = await ProductFactory.create({ name: 'Laptop', category: 'Electronics' });
      const product2 = await ProductFactory.create({ name: 'Phone', category: 'Electronics' });
      await ProductFactory.create({ name: 'Book', category: 'Books' });

      const response = await request(app)
        .get('/products?category=Electronics')
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body.map(p => p.id)).toContain(product1.id);
      expect(response.body.map(p => p.id)).toContain(product2.id);
      response.body.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    it('should return 200 and products matching partial category (case-insensitive)', async () => {
      await ProductFactory.create({ name: 'TV', category: 'Electronics & Gadgets' });
      await ProductFactory.create({ name: 'Radio', category: 'Electronics' });
      await ProductFactory.create({ name: 'Novel', category: 'Books' });

      const response = await request(app)
        .get('/products?category=lectron')
        .expect(200);

      expect(response.body.length).toBe(2);
      response.body.forEach(product => {
        expect(product.category.toLowerCase()).toContain('lectron');
      });
    });

    it('should return empty array when no product matches the category', async () => {
      await ProductFactory.create({ category: 'Furniture' });
      await ProductFactory.create({ category: 'Toys' });

      const response = await request(app)
        .get('/products?category=NonExistent')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return all products when category query parameter is empty', async () => {
      await ProductFactory.createList(3);
      const response = await request(app)
        .get('/products?category=')
        .expect(200);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ==================== Tugas 3.7: LIST BY AVAILABILITY ====================
  describe('GET /products?availability=... - LIST BY AVAILABILITY', () => {
    it('should return 200 and products with availability = true', async () => {
      const available1 = await ProductFactory.create({ name: 'In Stock 1', availability: true });
      const available2 = await ProductFactory.create({ name: 'In Stock 2', availability: true });
      const unavailable = await ProductFactory.create({ name: 'Out of Stock', availability: false });

      const response = await request(app)
        .get('/products?availability=true')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.map(p => p.id)).toContain(available1.id);
      expect(response.body.map(p => p.id)).toContain(available2.id);
      expect(response.body.map(p => p.id)).not.toContain(unavailable.id);
      response.body.forEach(product => {
        expect(product.availability).toBe(true);
      });
    });

    it('should return 200 and products with availability = false', async () => {
      const unavailable1 = await ProductFactory.create({ name: 'Sold Out', availability: false });
      const unavailable2 = await ProductFactory.create({ name: 'Discontinued', availability: false });
      const available = await ProductFactory.create({ name: 'Available', availability: true });

      const response = await request(app)
        .get('/products?availability=false')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.map(p => p.id)).toContain(unavailable1.id);
      expect(response.body.map(p => p.id)).toContain(unavailable2.id);
      expect(response.body.map(p => p.id)).not.toContain(available.id);
      response.body.forEach(product => {
        expect(product.availability).toBe(false);
      });
    });

    it('should return empty array when no products match the availability filter', async () => {
      await ProductFactory.create({ availability: true });
      const response = await request(app)
        .get('/products?availability=false')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return 400 when availability parameter is not a boolean', async () => {
      const response = await request(app)
        .get('/products?availability=notaboolean')
        .expect(400);
      expect(response.body).toHaveProperty('error', 'Invalid availability value');
    });
  });
});