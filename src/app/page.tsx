"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import dayjs from "dayjs";

type Product = {
  name: string;
  inventoryLevel: string;
  price: number;
  created_at: Date;
};

export default function Home() {
  const [data, setData] = useState<Product[]>([]);

  useEffect(() => {
    async function getData() {
      const { data } = await axios.get("http://localhost:6060/api/product");

      setData(data);
    }

    getData();
  }, []);

  return (
    <div className={styles.formArea}>
      A place where you can acces the virtual terminal and buy our products!
      <div className={styles.productList}>
        {/* List of Current Products*/}
        <h3 className={styles.productTitle}>Product Purchase History</h3>

        {data.length &&
          data.map((product: Product) => (
            <div>
              <div>Product Name: {product.name}</div>
              <div>
                Date Purchased:{" "}
                {dayjs(product.created_at).format("YYYY/MM/DD HH:mma")}
              </div>
              <div>Amount Paid: {product.price}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
