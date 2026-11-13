// --- Mobile Menu Toggle ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// --- Form Submissions (Sending data to the Node.js server) ---
const deliveryForm = document.getElementById('deliveryForm');

if (deliveryForm) {
    deliveryForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const formData = {
            pickup: document.getElementById('pickup').value,
            dropoff: document.getElementById('dropoff').value,
            phone: document.getElementById('phone').value,
            parcel: document.getElementById('parcel').value,
            deliveryType: document.getElementById('deliveryType').value
        };

        try {
            const response = await fetch('http://localhost:3000/book-delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert(`SUCCESS!\n\nYour Tracking Number is: ${result.trackingNumber}\n\nPlease save this number to track your delivery.`);
                this.reset(); 
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Cannot connect to the server. Is 'node server.js' running?");
        }
    });
}

// --- REAL Tracking System ---
async function trackParcel() {
    const trackingNumber = document.getElementById('trackingNumber').value;
    const resultDiv = document.getElementById('trackingResult');

    if (trackingNumber.trim() === "") {
        alert("Please enter a tracking number.");
        return;
    }

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> Searching for parcel...</p>`;

    try {
        const response = await fetch(`http://localhost:3000/track/${trackingNumber}`);
        
        if (!response.ok) {
            throw new Error("Order not found");
        }

        const result = await response.json();

        if (result.success) {
            const order = result.order;
            resultDiv.innerHTML = `
                <h3>Status: <span style="color: var(--primary-color);">${order.status}</span></h3>
                <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
                <p><strong>Current Location:</strong> ${order.location}</p>
                <p><strong>Destination:</strong> ${order.dropoff}</p>
            `;
        } else {
            resultDiv.innerHTML = `
                <h3 style="color: red;">Not Found</h3>
                <p>We could not find a parcel with the tracking number: <strong>${trackingNumber}</strong></p>
            `;
        }
    } catch (error) {
        console.error("Tracking Error:", error);
        resultDiv.innerHTML = `
            <h3 style="color: red;">Not Found</h3>
            <p>We could not find a parcel with the tracking number: <strong>${trackingNumber}</strong>.</p>
            <p><small>Please check the number and try again.</small></p>
        `;
    }
}

const trackBtn = document.querySelector('#track button');
if (trackBtn) {
    trackBtn.addEventListener('click', trackParcel);
}