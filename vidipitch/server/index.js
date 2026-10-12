// ============================================
// VidiPitch - Smart Stack Upgrade Landing Page
// Express Server
// ============================================

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Store orders in memory (use database in production)
let orders = [];

// Load existing orders from file if it exists
const ordersFile = path.join(__dirname, 'orders.json');
if (fs.existsSync(ordersFile)) {
    try {
        const data = fs.readFileSync(ordersFile);
        orders = JSON.parse(data);
        console.log(`Loaded ${orders.length} existing orders`);
    } catch (error) {
        console.error('Error loading orders:', error.message);
    }
}

// Save orders to file
function saveOrders() {
    try {
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    } catch (error) {
        console.error('Error saving orders:', error.message);
    }
}

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// API endpoint to submit order
app.post('/api/orders', (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            company, 
            role, 
            currentSetup, 
            timeline, 
            budgetConfirmed,
            notes 
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                error: 'Please fill in all required fields'
            });
        }

        // Create order object
        const order = {
            id: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            firstName,
            lastName,
            email,
            phone,
            company,
            role,
            currentSetup,
            timeline,
            budgetConfirmed,
            notes,
            amount: 3000,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save order
        orders.push(order);
        saveOrders();

        console.log('New order received:', order.id);
        console.log('Order details:', {
            name: `${firstName} ${lastName}`,
            email,
            company,
            amount: 3000
        });

        // In production, you would:
        // 1. Send confirmation email to customer
        // 2. Send notification to sales team
        // 3. Create record in CRM/database
        // 4. Set up payment processing (Stripe, PayPal, etc.)

        res.json({
            success: true,
            orderId: order.id,
            message: 'Order received successfully'
        });

    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to get all orders (admin only - add authentication in production)
app.get('/api/orders', (req, res) => {
    // In production, add authentication here
    res.json({
        success: true,
        count: orders.length,
        orders: orders.map(({ id, firstName, lastName, email, company, amount, status, createdAt }) => ({
            id,
            name: `${firstName} ${lastName}`,
            email,
            company,
            amount,
            status,
            createdAt
        }))
    });
});

// API endpoint to get order statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        recentOrders: orders.slice(-5).reverse()
    };

    res.json({ success: true, stats });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('========================================');
    console.log('VidiPitch - Smart Stack Upgrade Landing Page');
    console.log('========================================');
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Orders received: ${orders.length}`);
    console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    saveOrders();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    saveOrders();
    process.exit(0);
});

module.exports = app;
