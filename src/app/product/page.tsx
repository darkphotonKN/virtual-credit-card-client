"use client";

import ProductForm from "@/components/Form/ProductForm.tsx";
import styles from "./page.module.css";

function Product() {
  return (
    <div className={styles.formArea}>
      <ProductForm></ProductForm>
    </div>
  );
}

export default Product;
