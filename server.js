const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Loads the .env file

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let ordersCollection; // This will hold our database collection

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB Atlas!");
        
        const db = client.db('SwiftLink'); // Database name
        ordersCollection = db.collection('orders'); // Collection name
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}
connectDB();

// --- CUSTOMER ENDPOINTS ---

app.post('/book-delivery', async (req, res) => {
    const { pickup, dropoff, phone, parcel, deliveryType } = req.body;
    const trackingNumber = 'SW-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
        trackingNumber: trackingNumber,
        status: "Order Received",
        location: "Awaiting Rider Assignment",
        pickup: pickup,
        dropoff: dropoff,
        phone: phone,
        parcel: parcel,
        type: deliveryType,
        createdAt: new Date()
    };

    // Save to REAL Database
    await ordersCollection.insertOne(newOrder);

    console.log(`✅ SAVED TO DATABASE: ${trackingNumber}`);
    res.json({ success: true, trackingNumber: trackingNumber });
});

app.get('/track/:trackingNumber', async (req, res) => {
    const trackingNum = req.params.trackingNumber;
    
    // Find in REAL Database
    const order = await ordersCollection.findOne({ trackingNumber: trackingNum });

    if (order) {
        res.json({ success: true, order: order });
    } else {
        res.json({ success: false, message: "Not found" });
    }
});

// --- ADMIN ENDPOINTS ---

app.get('/admin/orders', async (req, res) => {
    // Get all orders from database, newest first
    const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, orders: orders });
});

app.post('/admin/update-status', async (req, res) => {
    const { trackingNumber, newStatus, newLocation } = req.body;
    
    // Update in REAL Database
    const result = await ordersCollection.updateOne(
        { trackingNumber: trackingNumber },
        { $set: { status: newStatus, location: newLocation } }
    );

    if (result.modifiedCount > 0) {
        console.log(`🔄 UPDATED: ${trackingNumber} is now ${newStatus}`);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Order not found or no changes made" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ SwiftLink Server is running on http://localhost:${PORT}`);
});

// --- PAYMENT ENDPOINT ---
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);

app.post('/initialize-payment', async (req, res) => {
    const { email, amount, formData } = req.body;
    
    // Paystack expects the amount in Pesewas (multiply GHS by 100)
    const amountInPesewas = amount * 100; 
    const trackingNumber = 'SW-' + Math.floor(1000 + Math.random() * 9000);

    try {
        const response = await paystack.transaction.initialize({
            email: email,
            amount: amountInPesewas,
            reference: trackingNumber,
            callback_url: 'http://127.0.0.1:5500/index.html?payment=success', // Redirects here after payment
            metadata: {
                pickup: formData.pickup,
                dropoff: formData.dropoff,
                phone: formData.phone,
                parcel: formData.parcel,
                deliveryType: formData.deliveryType
            }
        });

        if (response.status) {
            res.json({ success: true, authorization_url: response.data.authorization_url });
        } else {
            res.json({ success: false, message: "Payment initialization failed" });
        }
    } catch (error) {
        console.error("Paystack Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});