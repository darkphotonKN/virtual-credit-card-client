import PaymentForm from "@/components/Form/PaymentForm.tsx";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.main}>
      <div className={styles.title}>Virtual Terminal</div>

      <div className={styles.formArea}>
        <PaymentForm />
      </div>
    </div>
  );
}
