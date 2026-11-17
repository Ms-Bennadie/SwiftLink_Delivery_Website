const ADMIN_PASSWORD = "swiftlink123"; 

function login() {
    const passwordInput = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('loginError');

    if (passwordInput === ADMIN_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex'; // Changed to flex for the layout
        loadOrders();
    } else {
        errorMsg.style.display = 'block';
    }
}

function logout() {
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

async function loadOrders() {
    try {
        const response = await fetch('http://localhost:3000/admin/orders');
        const result = await response.json();

        const tableBody = document.getElementById('ordersTableBody');
        const noOrdersMsg = document.getElementById('noOrdersMsg');
        tableBody.innerHTML = ''; 

        // Stats variables
        let total = 0;
        let inTransit = 0;
        let delivered = 0;

        if (result.success && result.orders.length > 0) {
            noOrdersMsg.style.display = 'none';
            
            result.orders.forEach(order => {
                total++;
                if (order.status === 'In Transit') inTransit++;
                if (order.status === 'Delivered') delivered++;

                // Determine badge color
                let badgeClass = 'status-received';
                if (order.status === 'In Transit') badgeClass = 'status-transit';
                if (order.status === 'Delivered') badgeClass = 'status-delivered';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${order.trackingNumber}</strong></td>
                    <td>${order.phone}</td>
                    <td>${order.dropoff}</td>
                    <td><span class="status-badge ${badgeClass}">${order.status}</span></td>
                    <td>
                        <select onchange="updateStatus('${order.trackingNumber}', this.value)">
                            <option value="Order Received" ${order.status === 'Order Received' ? 'selected' : ''}>Order Received</option>
                            <option value="Rider Assigned" ${order.status === 'Rider Assigned' ? 'selected' : ''}>Rider Assigned</option>
                            <option value="In Transit" ${order.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            noOrdersMsg.style.display = 'block';
        }

        // Update the stat cards
        document.getElementById('totalOrders').innerText = total;
        document.getElementById('inTransitOrders').innerText = inTransit;
        document.getElementById('deliveredOrders').innerText = delivered;

    } catch (error) {
        console.error("Error loading orders:", error);
        alert("Failed to load orders. Is the server running?");
    }
}

async function updateStatus(trackingNumber, newStatus) {
    try {
        const response = await fetch('http://localhost:3000/admin/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                trackingNumber: trackingNumber, 
                newStatus: newStatus,
                newLocation: "Updated by Admin" 
            })
        });
        const result = await response.json();
        if (result.success) {
            // Instead of an alert, just silently reload the table to show the new badge and stats
            loadOrders(); 
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

async function loadMessages() {
    try {
        const response = await fetch('http://localhost:3000/admin/messages');
        const result = await response.json();

        if (result.success && result.messages.length > 0) {
            // For now, let's just show them in an alert or console
            let msgText = "--- CUSTOMER MESSAGES ---\n\n";
            result.messages.forEach(msg => {
                msgText += `From: ${msg.name} (${msg.email})\nMessage: ${msg.message}\n\n`;
            });
            alert(msgText);
        } else {
            alert("No messages yet.");
        }
    } catch (error) {
        console.error("Error loading messages:", error);
        alert("Failed to load messages.");
    }
}