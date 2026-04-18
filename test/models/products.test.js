// tests/models/product.test.js
const { Product } = require('../../src/models/product');
const ProductFactory = require('../factories');

// Reset database sebelum setiap test
beforeEach(async () => {
  await Product.deleteAll();
});

describe('Product Model', () => {
  // ==================== Tugas 2.1: READ ====================
  describe('READ', () => {
    it('should read an existing product by id', async () => {
      const fakeProduct = await ProductFactory.create({
        name: 'Laptop Gaming',
        category: 'Elektronik',
        price: 15000000,
        stock: 10,
        availability: true,
      });

      const foundProduct = await Product.findById(fakeProduct.id);

      expect(foundProduct).not.toBeNull();
      expect(foundProduct.id).toEqual(fakeProduct.id);
      expect(foundProduct.name).toEqual('Laptop Gaming');
      expect(foundProduct.category).toEqual('Elektronik');
      expect(foundProduct.price).toEqual(15000000);
      expect(foundProduct.stock).toEqual(10);
      expect(foundProduct.availability).toBe(true);
    });

    it('should return null when product not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const foundProduct = await Product.findById(nonExistentId);
      expect(foundProduct).toBeNull();
    });
  });

  // ==================== Tugas 2.2: UPDATE ====================
  describe('UPDATE', () => {
    it('should update an existing product successfully', async () => {
      const fakeProduct = await ProductFactory.create({
        name: 'Smartphone',
        category: 'Gadget',
        price: 3000000,
        stock: 25,
        availability: true,
      });

      const updateData = {
        name: 'Smartphone Pro',
        price: 4500000,
        stock: 15,
        availability: false,
      };

      const updatedProduct = await Product.update(fakeProduct.id, updateData);

      expect(updatedProduct).not.toBeNull();
      expect(updatedProduct.id).toEqual(fakeProduct.id);
      expect(updatedProduct.name).toEqual('Smartphone Pro');
      expect(updatedProduct.price).toEqual(4500000);
      expect(updatedProduct.stock).toEqual(15);
      expect(updatedProduct.availability).toBe(false);
      expect(updatedProduct.category).toEqual('Gadget'); // tidak berubah
    });

    it('should return null when updating non-existent product', async () => {
      const nonExistentId = 'invalid-id-12345';
      const updateData = { name: 'New Name' };
      const result = await Product.update(nonExistentId, updateData);
      expect(result).toBeNull();
    });

    it('should only update specified fields', async () => {
      const fakeProduct = await ProductFactory.create({
        name: 'Original',
        category: 'Test',
        price: 1000,
        stock: 5,
      });

      await Product.update(fakeProduct.id, { name: 'Updated Name', price: 2000 });

      const found = await Product.findById(fakeProduct.id);
      expect(found.name).toEqual('Updated Name');
      expect(found.price).toEqual(2000);
      expect(found.category).toEqual('Test');
      expect(found.stock).toEqual(5);
    });
  });

  // ==================== Tugas 2.3: DELETE ====================
  describe('DELETE', () => {
    it('should delete an existing product successfully', async () => {
      const fakeProduct = await ProductFactory.create({
        name: 'Product to Delete',
        category: 'Test Category',
        price: 50000,
        stock: 10,
        availability: true,
      });

      let found = await Product.findById(fakeProduct.id);
      expect(found).not.toBeNull();

      const deleteResult = await Product.delete(fakeProduct.id);
      expect(deleteResult).toBe(true);

      const deletedProduct = await Product.findById(fakeProduct.id);
      expect(deletedProduct).toBeNull();
    });

    it('should return false when trying to delete non-existent product', async () => {
      const nonExistentId = 'nonexistent-id-99999';
      const deleteResult = await Product.delete(nonExistentId);
      expect(deleteResult).toBe(false);
    });

    it('should not affect other products when deleting one product', async () => {
      const product1 = await ProductFactory.create({ name: 'Keep1' });
      const product2 = await ProductFactory.create({ name: 'Keep2' });
      const productToDelete = await ProductFactory.create({ name: 'Delete Me' });

      await Product.delete(productToDelete.id);

      const stillExists1 = await Product.findById(product1.id);
      const stillExists2 = await Product.findById(product2.id);
      const deletedCheck = await Product.findById(productToDelete.id);

      expect(stillExists1).not.toBeNull();
      expect(stillExists2).not.toBeNull();
      expect(deletedCheck).toBeNull();
    });
  });

  // ==================== Tugas 2.4: LIST ALL ====================
  describe('LIST ALL', () => {
    it('should return all products when no filter is applied', async () => {
      const product1 = await ProductFactory.create({ name: 'Product A' });
      const product2 = await ProductFactory.create({ name: 'Product B' });
      const product3 = await ProductFactory.create({ name: 'Product C' });

      const allProducts = await Product.findAll();

      expect(allProducts).toBeInstanceOf(Array);
      expect(allProducts.length).toBeGreaterThanOrEqual(3);
      const ids = allProducts.map(p => p.id);
      expect(ids).toContain(product1.id);
      expect(ids).toContain(product2.id);
      expect(ids).toContain(product3.id);
    });

    it('should return empty array when no products exist', async () => {
      await Product.deleteAll();
      const allProducts = await Product.findAll();
      expect(allProducts).toEqual([]);
    });

    it('should return products with correct structure', async () => {
      const fakeProduct = await ProductFactory.create({
        name: 'Structure Test',
        category: 'Test Cat',
        price: 12345,
        stock: 99,
        availability: false,
      });

      const allProducts = await Product.findAll();
      const found = allProducts.find(p => p.id === fakeProduct.id);

      expect(found).toHaveProperty('id');
      expect(found).toHaveProperty('name');
      expect(found).toHaveProperty('category');
      expect(found).toHaveProperty('price');
      expect(found).toHaveProperty('stock');
      expect(found).toHaveProperty('availability');
      expect(found.name).toBe('Structure Test');
      expect(found.price).toBe(12345);
    });
  });

  // ==================== Tugas 2.5: FIND BY NAME ====================
  describe('FIND BY NAME', () => {
    it('should find products by exact name match', async () => {
      const targetProduct = await ProductFactory.create({ name: 'UniqueProductXYZ' });
      await ProductFactory.create({ name: 'OtherProduct' });
      await ProductFactory.create({ name: 'AnotherOne' });

      const found = await Product.findByName('UniqueProductXYZ', { exact: true });

      expect(found).toBeInstanceOf(Array);
      expect(found.length).toBe(1);
      expect(found[0].id).toBe(targetProduct.id);
      expect(found[0].name).toBe('UniqueProductXYZ');
    });

    it('should find products by partial name match (case-insensitive)', async () => {
      await ProductFactory.create({ name: 'Apple MacBook' });
      await ProductFactory.create({ name: 'Apple iPhone' });
      await ProductFactory.create({ name: 'Samsung Galaxy' });

      const found = await Product.findByName('apple', { partial: true, caseSensitive: false });

      expect(found.length).toBe(2);
      expect(found[0].name).toContain('Apple');
      expect(found[1].name).toContain('Apple');
    });

    it('should return empty array when no product matches the name', async () => {
      await ProductFactory.create({ name: 'Laptop' });
      await ProductFactory.create({ name: 'Mouse' });

      const found = await Product.findByName('NonExistentName');
      expect(found).toEqual([]);
    });

    it('should handle empty search term', async () => {
      await ProductFactory.createList(3);
      const found = await Product.findByName('');
      expect(found.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ==================== Tugas 2.6: FIND BY CATEGORY ====================
  describe('FIND BY CATEGORY', () => {
    it('should find products by exact category match', async () => {
      const target1 = await ProductFactory.create({ name: 'Product A', category: 'Electronics' });
      const target2 = await ProductFactory.create({ name: 'Product B', category: 'Electronics' });
      await ProductFactory.create({ name: 'Product C', category: 'Books' });

      const found = await Product.findByCategory('Electronics', { exact: true });

      expect(found).toBeInstanceOf(Array);
      expect(found.length).toBe(2);
      expect(found.map(p => p.id)).toContain(target1.id);
      expect(found.map(p => p.id)).toContain(target2.id);
      found.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    it('should find products by partial category match (case-insensitive)', async () => {
      await ProductFactory.create({ name: 'Laptop', category: 'Electronics & Gadgets' });
      await ProductFactory.create({ name: 'Phone', category: 'Electronics' });
      await ProductFactory.create({ name: 'Novel', category: 'Books' });

      const found = await Product.findByCategory('lectron', { partial: true, caseSensitive: false });

      expect(found.length).toBe(2);
      expect(found[0].category).toContain('Electronics');
      expect(found[1].category).toContain('Electronics');
    });

    it('should return empty array when no product matches the category', async () => {
      await ProductFactory.create({ category: 'Furniture' });
      await ProductFactory.create({ category: 'Toys' });

      const found = await Product.findByCategory('NonExistentCategory');
      expect(found).toEqual([]);
    });

    it('should return all products when category filter is empty', async () => {
      await ProductFactory.createList(3);
      const found = await Product.findByCategory('');
      expect(found.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ==================== Tugas 2.7: FIND BY AVAILABILITY ====================
  describe('FIND BY AVAILABILITY', () => {
    it('should find all products with availability = true', async () => {
      const available1 = await ProductFactory.create({ name: 'In Stock 1', availability: true });
      const available2 = await ProductFactory.create({ name: 'In Stock 2', availability: true });
      const unavailable = await ProductFactory.create({ name: 'Out of Stock', availability: false });

      const found = await Product.findByAvailability(true);

      expect(found).toBeInstanceOf(Array);
      expect(found.length).toBeGreaterThanOrEqual(2);
      expect(found.map(p => p.id)).toContain(available1.id);
      expect(found.map(p => p.id)).toContain(available2.id);
      expect(found.map(p => p.id)).not.toContain(unavailable.id);
      found.forEach(product => {
        expect(product.availability).toBe(true);
      });
    });

    it('should find all products with availability = false', async () => {
      const unavailable1 = await ProductFactory.create({ name: 'Sold Out', availability: false });
      const unavailable2 = await ProductFactory.create({ name: 'Discontinued', availability: false });
      const available = await ProductFactory.create({ name: 'Available', availability: true });

      const found = await Product.findByAvailability(false);

      expect(found.length).toBeGreaterThanOrEqual(2);
      expect(found.map(p => p.id)).toContain(unavailable1.id);
      expect(found.map(p => p.id)).toContain(unavailable2.id);
      expect(found.map(p => p.id)).not.toContain(available.id);
      found.forEach(product => {
        expect(product.availability).toBe(false);
      });
    });

    it('should return empty array when no products match the availability', async () => {
      await Product.deleteAll();
      await ProductFactory.create({ availability: true });

      const found = await Product.findByAvailability(false);
      expect(found).toEqual([]);
    });

    it('should return correct data structure for found products', async () => {
      const product = await ProductFactory.create({
        name: 'Test Avail',
        category: 'Test',
        price: 100,
        stock: 5,
        availability: true,
      });

      const found = await Product.findByAvailability(true);
      const foundProduct = found.find(p => p.id === product.id);

      expect(foundProduct).toHaveProperty('id');
      expect(foundProduct).toHaveProperty('name');
      expect(foundProduct).toHaveProperty('availability');
      expect(foundProduct.availability).toBe(true);
    });
  });
});