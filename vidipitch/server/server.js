require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test'; // Use 'test' for sandbox, get real client ID from PayPal Developer Dashboard
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_RECEIVER_EMAIL = 'VidiBuzz@gmail.com';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../')); // Serve static files from root

// PayPal Smart Button configuration endpoint
app.get('/api/paypal-config', (req, res) => {
  res.json({
    clientId: PAYPAL_CLIENT_ID,
    environment: 'sandbox' // Change to 'production' when ready
  });
});

// Create PayPal order
app.post('/api/create-order', async (req, res) => {
  try {
    const amount = req.body.amount || 3000.00;
    
    // Return PayPal button configuration for frontend
    res.json({
      success: true,
      amount: amount,
      currency: 'USD',
      receiverEmail: PAYPAL_RECEIVER_EMAIL,
      description: 'Smart Stack Upgrade - Federal Contracting Intelligence Platform'
    });
  } catch (error) {
    console.error('PayPal order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Capture PayPal payment (called after successful PayPal checkout)
app.post('/api/capture-payment', async (req, res) => {
  try {
    const { orderId, payerEmail, payerName } = req.body;
    
    console.log('Payment captured:', {
      orderId,
      amount: '3000.00 USD',
      product: 'Smart Stack Upgrade v2.0',
      payerEmail,
      payerName,
      timestamp: new Date().toISOString()
    });
    
    // In production: save to database, send confirmation email
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      orderId: orderId || Date.now()
    });
  } catch (error) {
    console.error('Capture error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order submission endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Store order data (in production, save to database)
    console.log('Order received:', JSON.stringify(orderData, null, 2));
    
    // Send confirmation email (implement with your email service)
    // await sendConfirmationEmail(orderData);
    
    res.json({
      success: true,
      message: 'Order submitted successfully',
      orderId: Date.now()
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VidiPitch server running on http://localhost:${PORT}`);
  console.log(`📄 Landing page available at http://localhost:${PORT}/index.html`);
});

module.exports = app;
