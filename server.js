const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Temporary database
const database = {}; 

// --- CUSTOMER ENDPOINTS ---
app.post('/book-delivery', (req, res) => {
    const { pickup, dropoff, phone, parcel, deliveryType } = req.body;
    const trackingNumber = 'SW-' + Math.floor(1000 + Math.random() * 9000);

    database[trackingNumber] = {
        trackingNumber: trackingNumber,
        status: "Order Received",
        location: "Awaiting Rider Assignment",
        pickup: pickup,
        dropoff: dropoff,
        phone: phone,
        parcel: parcel,
        type: deliveryType
    };

    console.log(`✅ SAVED TO DATABASE: ${trackingNumber}`);
    res.json({ success: true, trackingNumber: trackingNumber });
});

app.get('/track/:trackingNumber', (req, res) => {
    const trackingNum = req.params.trackingNumber;
    if (database[trackingNum]) {
        res.json({ success: true, order: database[trackingNum] });
    } else {
        res.json({ success: false, message: "Not found" });
    }
});

// --- ADMIN ENDPOINTS ---

// 1. Get all orders for the dashboard
app.get('/admin/orders', (req, res) => {
    const ordersArray = Object.values(database);
    res.json({ success: true, orders: ordersArray });
});

// 2. Update an order's status
app.post('/admin/update-status', (req, res) => {
    const { trackingNumber, newStatus, newLocation } = req.body;
    
    if (database[trackingNumber]) {
        database[trackingNumber].status = newStatus;
        database[trackingNumber].location = newLocation;
        console.log(`🔄 UPDATED: ${trackingNumber} is now ${newStatus}`);
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Order not found" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ SwiftLink Server is running on http://localhost:${PORT}`);
});