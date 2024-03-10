const express = require('express');
const Stripe = require('stripe');
const app = express();

// Set up Stripe with your secret key
const stripe = Stripe('your_secret_key_here');

// Parse application/json requests
app.use(express.json());

// Your payment endpoint
app.post('/your-payment-endpoint', async (req, res) => {
  const { paymentMethodId, amount } = req.body;

  try {
    // Create a PaymentIntent with the amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Attach the payment method to the PaymentIntent
    await stripe.paymentMethods.attach(paymentMethodId, {
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
    });

    // Confirm the PaymentIntent with the attached payment method
    const result = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethodId,
    });

    if (result.status === 'succeeded') {
      // Payment succeeded!
      res.status(200).json({ success: true });
    } else {
      // Payment failed
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    // Handle any errors that occur during the payment process
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});