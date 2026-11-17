const deliveryForm = document.getElementById('deliveryForm');

if (deliveryForm) {
    deliveryForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        // 1. Gather data
        const formData = {
            pickup: document.getElementById('pickup').value,
            dropoff: document.getElementById('dropoff').value,
            phone: document.getElementById('phone').value,
            parcel: document.getElementById('parcel').value,
            deliveryType: document.getElementById('deliveryType').value
        };

        const email = document.getElementById('email').value;
        
        // 2. Calculate Price (You can adjust these prices later)
        let amount = 50; // Default 50 GHS
        if (formData.deliveryType === 'same-day') amount = 80;
        if (formData.deliveryType === 'bulk') amount = 150;

        // Loading state
        const submitBtn = this.querySelector('button');
        submitBtn.innerText = "Redirecting to Pay...";
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/initialize-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, amount, formData })
            });

            const result = await response.json();

            if (result.success) {
                // Send user to Paystack checkout!
                window.location.href = result.authorization_url;
            } else {
                alert("Failed to start payment. Please try again.");
                submitBtn.innerText = "Submit & Pay";
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Cannot connect to server.");
            submitBtn.innerText = "Submit & Pay";
            submitBtn.disabled = false;
        }
    });
}