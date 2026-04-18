// src/routes/products.js
const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');

// ==================== Helper function untuk validasi ID ====================
const isValidId = (id) => {
  return id && id !== 'undefined' && id.length > 0;
};

// ==================== READ: GET /products/:id ====================
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error in READ product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== UPDATE: PUT /products/:id ====================
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Validasi data update
    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }
    if (updateData.stock !== undefined && updateData.stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }
    if (updateData.availability !== undefined && typeof updateData.availability !== 'boolean') {
      return res.status(400).json({ error: 'Availability must be a boolean' });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await Product.update(id, updateData);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error in UPDATE product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DELETE: DELETE /products/:id ====================
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deleted = await Product.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LIST ALL / LIST BY NAME / LIST BY CATEGORY / LIST BY AVAILABILITY
// GET /products?name=&category=&availability=
router.get('/products', async (req, res) => {
  try {
    const { name, category, availability } = req.query;
    let products;

    // Validasi availability jika ada
    if (availability !== undefined && availability !== 'true' && availability !== 'false') {
      return res.status(400).json({ error: 'Invalid availability value' });
    }

    // Prioritas filter: terapkan semua filter yang ada (AND logic)
    if (name) {
      // LIST BY NAME (partial, case-insensitive)
      products = await Product.findByName(name, { partial: true, caseSensitive: false });
      
      // Filter lanjutan berdasarkan category jika ada
      if (category) {
        products = products.filter(p => 
          p.category && p.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Filter lanjutan berdasarkan availability jika ada
      if (availability !== undefined) {
        const availBool = availability === 'true';
        products = products.filter(p => p.availability === availBool);
      }
    } 
    else if (category) {
      // LIST BY CATEGORY (partial, case-insensitive)
      products = await Product.findByCategory(category, { partial: true, caseSensitive: false });
      
      // Filter lanjutan berdasarkan availability jika ada
      if (availability !== undefined) {
        const availBool = availability === 'true';
        products = products.filter(p => p.availability === availBool);
      }
    }
    else if (availability !== undefined) {
      // LIST BY AVAILABILITY
      const availBool = availability === 'true';
      products = await Product.findByAvailability(availBool);
    }
    else {
      // LIST ALL
      products = await Product.findAll();
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error in LIST products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;