// src/pages/CheckoutForm.jsx
import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.message,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Payment Successful',
        text: `Payment of ${amount} DA was successful!`,
      });
      // You can further handle the payment on your backend server here
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <Button type="submit" disabled={!stripe} className="mt-3">
        Pay {amount} DA
      </Button>
    </form>
  );
};

export default CheckoutForm;
