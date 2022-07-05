const express = require("express");
const app = express();
const router = express.Router();


const stripe = require("stripe")('sk_test_51LHjpdEZZiK54waal5CeD2qHjc9P5LV7sUqFgUsJ8Vi8EwSkNzGD1XQBEVPCxcKcgabBa8WxdUmWryAs6evDl0Ra00vjb96Cqe');

const calculateOrderAmount = (items) => {
  
  return 1400;
};

router.post("/create", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
module.exports = router;