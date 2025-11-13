
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create checkout session for order
  async createCheckoutSession(order, customerEmail) {
    try {
      const lineItems = order.items.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to paise
        },
        quantity: item.quantity,
      }));

      // Add tax as a line item
      if (order.tax > 0) {
        lineItems.push({
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Tax (GST 18%)',
            },
            unit_amount: Math.round(order.tax * 100),
          },
          quantity: 1,
        });
      }

      // Add shipping as a line item
      if (order.shippingCharges > 0) {
        lineItems.push({
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Shipping Charges',
            },
            unit_amount: Math.round(order.shippingCharges * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: customerEmail,
        client_reference_id: order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        },
        success_url: `${process.env.FRONTEND_URL}/orders/${order._id}?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Stripe session creation error:', error);
      throw new Error('Failed to create payment session: ' + error.message);
    }
  }

  // Create payment intent (for custom checkout)
  async createPaymentIntent(amount, orderId, customerEmail) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'inr',
        metadata: {
          orderId: orderId.toString(),
        },
        receipt_email: customerEmail,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw new Error('Failed to create payment intent: ' + error.message);
    }
  }

  // Retrieve payment intent
  async retrievePaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Payment intent retrieval error:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return refund;
    } catch (error) {
      console.error('Refund creation error:', error);
      throw new Error('Failed to create refund: ' + error.message);
    }
  }

  // Verify webhook signature
  constructWebhookEvent(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Webhook signature verification failed');
    }
  }
}

module.exports = new StripeService();
