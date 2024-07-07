"use client";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import styles from "./styles.module.css";

import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

type ProductFormProps = {};

type ProductFormInp = {
  amount: number;
  name: string;
  email: string;
  creditCardNo: number;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? "");
const FIXED_CURRENCY_USD = "usd";

function ProductForm(props: ProductFormProps) {
  const [err, setErr] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const stripe_api_key = process.env.NEXT_PUBLIC_STRIPE_API_KEY;
    console.log("stripe_api_key:", stripe_api_key);
  }, []);

  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit({ amount, name }: ProductFormInp) {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      console.log("paymentMethod:", paymentMethod);

      if (error) {
        console.error(error);
        setErr(error.message ?? "");
      } else {
        // headers with stripe secret
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? ""}`,
        };
        // Call your backend to create the payment intent
        try {
          // first status of payment intent
          const { data } = await axios.post(
            "http://localhost:6060/api/payment-intent",
            {
              amount,
              payment_method: paymentMethod.id,
              currency: FIXED_CURRENCY_USD,
            },
            { headers },
          );

          if (!data.ok) {
            setErr(data.message);
          }

          console.log("payment intent:", data);

          // confirm payment with payment intent id and client secret
          const confirmPaymentIntentRes = await stripe.confirmCardPayment(
            data.client_secret,
            {
              payment_method: {
                // use initialized cardElement instance
                card: cardElement,
                billing_details: {
                  name: name,
                },
              },
            },
          );

          console.log("confirmed payment res:", confirmPaymentIntentRes);
          if (confirmPaymentIntentRes.error) {
            setErr(
              "Error when confirming payment: " + confirmPaymentIntentRes.error,
            );
          } else if (
            confirmPaymentIntentRes.paymentIntent.status === "succeeded"
          ) {
            // payment succeeded
            setPaymentSuccess(true);
          }
        } catch (err: any) {
          console.log("Error when request payment intent.", err.message);
        }
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
        <Field
          className={styles.input}
          id="amount"
          name="amount"
          placeholder="Enter Amount"
        />

        <label htmlFor="name">Name</label>
        <Field
          className={styles.input}
          id="name"
          name="name"
          placeholder="Enter Name"
        />

        <label htmlFor="email">Email</label>
        <Field
          className={styles.input}
          id="email"
          name="email"
          placeholder="Enter Email"
          type="email"
        />
        <label htmlFor="creditCardNo">Credit Card</label>

        {/* Stripe Element */}
        <CardElement className={styles.cardInput} />

        {/* Form Status */}
        <div>
          {err ? (
            <div className={styles.error + " " + styles.statusMessage}>
              {err}
            </div>
          ) : null}
          {paymentSuccess ? (
            <div className={styles.success + " " + styles.statusMessage}>
              Your payment was successful.
            </div>
          ) : null}
        </div>

        <button type="submit" disabled={!stripe}>
          Submit
        </button>
      </Form>
    </Formik>
  );
}

const WrappedProductForm: React.FC = () => (
  <Elements stripe={stripePromise}>
    <ProductForm />
  </Elements>
);

export default WrappedProductForm;
