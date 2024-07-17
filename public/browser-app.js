document.addEventListener('DOMContentLoaded', function() {
  const stripe = Stripe('your_stripe_publishable_key');
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  const form = document.getElementById('payment-form');
  const tourIdInput = document.getElementById('tour-id');
  const cardErrors = document.getElementById('card-errors');
  const submitButton = document.getElementById('submit');

  form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitButton.disabled = true;

      const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
              name: 'Customer Name',
          },
      });

      if (error) {
          cardErrors.textContent = error.message;
          submitButton.disabled = false;
          return;
      }

      const response = await fetch('/api/v1/payments/create-and-confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              tourId: tourIdInput.value,
              payment_method_id: paymentMethod.id,
          }),
      });

      const result = await response.json();

      if (result.status === 'success') {
          window.location.href = '/success';
      } else {
          cardErrors.textContent = result.message || 'Payment failed';
          submitButton.disabled = false;
      }
  });
});
