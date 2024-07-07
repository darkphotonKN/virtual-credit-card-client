"use client";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

function PageTitle() {
  const pathname = usePathname();

  function renderPageTitle(): string {
    switch (pathname) {
      case "/": {
        return "";
      }
      case "/virtual-terminal": {
        return "Virtual Terminal";
      }
      case "/product": {
        return "Product";
      }
      default: {
        return "";
      }
    }
  }

  return <div className={styles.title}>{renderPageTitle()}</div>;
}

export default PageTitle;
