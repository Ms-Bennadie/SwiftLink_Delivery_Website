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
                //Save the form data before leaving te page
                localStorage.setItem('pendingOrder', JSON.stringify(formData));

                // Redirect to Paystack
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

// --- CHECK FOR PAYMENT SUCCESS ON PAGE LOAD ---
window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const trackingNum = urlParams.get('trxref'); // Paystack sends the reference here

    if (paymentStatus === 'success' && trackingNum) {
        // Show a loading message
        alert("Payment successful! Finalizing your order...");

        // Retrieve the saved form data from local storage
        const savedFormData = JSON.parse(localStorage.getItem('pendingOrder'));

        try {
            // Tell the server to verify and save it
            const response = await fetch('http://localhost:3000/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    reference: trackingNum, 
                    formData: savedFormData 
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`Order Confirmed!\n\nYour Tracking Number is: ${result.trackingNumber}\n\nPlease save this number to track your delivery.`);
                localStorage.removeItem('pendingOrder'); // Clean up
            } else {
                alert("Payment was successful, but we couldn't save your order. Please contact support.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Cannot connect to server.");
        }

        // Clean the URL so the alert doesn't pop up again on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});