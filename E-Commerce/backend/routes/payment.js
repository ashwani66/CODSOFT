const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, userId } = req.body;

    // Validate input
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Map cart items to Stripe line items
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'usd', // Change to 'inr' if prices are in INR
        product_data: {
          name: item.name || 'Product',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/cart?canceled=true`,
      metadata: { userId },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
