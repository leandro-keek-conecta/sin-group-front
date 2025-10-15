import React from "react";
import styles from "./itemMenu.module.css";
import { useTheme } from "@mui/material/styles";

interface ItemMenuProps {
  icone?: React.ReactElement;
  rotulo: string;
  para?: string;
  estaAberta: boolean;
  onClick?: () => void;
  isTitle?: boolean;
  isActive?: boolean; // ← nova prop
}

export function ItemMenu({
  icone,
  rotulo,
  para,
  estaAberta,
  onClick,
  isTitle,
  isActive = false,
}: ItemMenuProps) {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const color = "#ff7a01";

  const isPlaceholder = !para || para === "#";

  const content = (
    <>
      {icone && (
        <div className={styles.icon}>
          {React.cloneElement(icone, { style: { fontSize: "1rem" } })}
        </div>
      )}
      {estaAberta && (
        <span className={`${styles.label} ${isTitle ? styles.title : ""}`}>
          {rotulo}
        </span>
      )}
    </>
  );

  // 🔹 Título (sem ação)
  if (isTitle) {
    return (
      <li>
        <div
          className={styles.menuItem}
          style={{
            cursor: "default",
            padding: "0px 0px",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          {content}
        </div>
      </li>
    );
  }

  // 🔹 Item clicável (Power BI)
  if (isPlaceholder) {
    return (
      <li>
        <div
          className={`${styles.menuItem} ${styles.clicavel}`}
          onClick={onClick}
          style={{
            cursor: "pointer",
            backgroundColor: isActive ? color : "transparent",
            color: isActive ? theme.palette.primary.contrastText : "inherit",
            fontWeight: isActive ? 500 : 400,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isActive)
              (e.currentTarget as HTMLElement).style.background = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            if (!isActive)
              (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          {content}
        </div>
      </li>
    );
  }

  // 🔹 Links normais (mantém compatibilidade)
  return (
    <li>
      <a href={para} className={styles.menuItem} onClick={onClick}>
        {content}
      </a>
    </li>
  );
}
