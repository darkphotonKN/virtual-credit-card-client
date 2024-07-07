import PaymentForm from "@/components/Form/PaymentForm.tsx";
import styles from "./page.module.css";

export default function VirtualTerminal() {
  return (
    <div className={styles.formArea}>
      <PaymentForm />
    </div>
  );
}
