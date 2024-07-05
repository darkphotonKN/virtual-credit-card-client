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
import axios, { AxiosError } from "axios";

type PaymentFormProps = {};

type PaymentFormInp = {
  amount: number;
  name: string;
  email: string;
  creditCardNo: number;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY ?? "");

function PaymentForm(props: PaymentFormProps) {
  const [err, setErr] = useState("");

  useEffect(() => {
    const stripe_api_key = process.env.NEXT_PUBLIC_STRIPE_API_KEY;

    console.log("stripe_api_key:", stripe_api_key);
  }, []);

  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit({ amount }: PaymentFormInp) {
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
          const { data } = await axios.post(
            "http://localhost:6060/api/payment-intent",
            {
              amount,
              payment_method: paymentMethod.id,
              currency: "usd",
            },
            { headers },
          );

          if (!data.ok) {
            setErr(data.message);
          }

          console.log("payment intent:", data);
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
        <Field id="amount" name="amount" placeholder="Enter Amount" />

        <label htmlFor="name">Name</label>
        <Field id="name" name="name" placeholder="Enter Name" />

        <label htmlFor="email">Email</label>
        <Field id="email" name="email" placeholder="Enter Email" type="email" />
        <label htmlFor="creditCardNo">Credit Card</label>

        {/* Stripe Element */}
        <CardElement />

        {/* Form Status */}
        <div>
          {err ? (
            <div
              style={{
                color: "red",
                fontWeight: 500,
                fontSize: "16px",
                margin: "15px 0",
                textAlign: "center",
                width: "100%",
              }}
            >
              {err}
            </div>
          ) : (
            <div></div>
          )}
        </div>

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
