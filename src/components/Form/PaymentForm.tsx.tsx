"use client";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import styles from "./styles.module.css";

import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

type PaymentFormProps = {};

type PaymentFormInp = {
  amount: number;
  name: string;
  email: string;
  creditCardNo: number;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? "");

function PaymentForm(props: PaymentFormProps) {
  useEffect(() => {
    const stripe_api_key = process.env.NEXT_PUBLIC_STRIPE_API_KEY;

    console.log("stripe_api_key:", stripe_api_key);
  }, []);

  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(values: PaymentFormInp) {
    console.log("Submitted form values:", values);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        console.error(error);
      } else {
        // Call your backend to create the payment intent
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 1000, // Amount in cents
            payment_method: paymentMethod.id,
          }),
        });

        const paymentIntent = await response.json();
        console.log(paymentIntent);
      }
    }
  }

  return (
    <Formik
      initialValues={{
        amount: 0,
        name: "",
        email: "",
        creditCardNo: 0,
      }}
      onSubmit={handleSubmit}
    >
      <Form className={styles.formWrapper}>
        <label htmlFor="amount">Amount</label>
        <Field id="amount" name="amount" placeholder="Enter Amount" />

        <label htmlFor="name">Name</label>
        <Field id="name" name="name" placeholder="Enter Name" />

        <label htmlFor="email">Email</label>
        <Field id="email" name="email" placeholder="Enter Email" type="email" />
        <label htmlFor="creditCardNo">Credit Card</label>

        {/* Stripe Element */}
        <CardElement />

        <button type="submit" disabled={!stripe}>
          Submit
        </button>
      </Form>
    </Formik>
  );
}

const WrappedPaymentForm: React.FC = () => (
  <Elements stripe={stripePromise}>
    <PaymentForm />
  </Elements>
);

export default WrappedPaymentForm;
