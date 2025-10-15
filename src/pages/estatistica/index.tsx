import { Layout } from "@/components/Layout";
import styles from "./estatistica.module.css";
import { useLocation } from "react-router-dom";

export default function Estatisticas() {
  const url = "https://ourworldindata.org/grapher/renewables-share-energy";

  return (
    <Layout titulo="Apresentação e Introdução">
{/*       <iframe
        className={styles.iframe}
        src={url}
        allowFullScreen
        title=
        "Apresentação YouTube"
      /> */}
       <p>Tela de Estatisticas</p>
    </Layout>
  );
}
