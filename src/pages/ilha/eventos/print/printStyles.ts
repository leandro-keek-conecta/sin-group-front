import { ilhaTokens } from "../../theme/tokens";

// CSS global injetado via <style> na página de impressão.
// Usa @page e @media print pra controlar o comportamento do dialog do browser.
export const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 15mm 15mm 20mm 15mm;
}

@media print {
  html, body {
    background: #FFFFFF !important;
  }
  .print-root {
    background: #FFFFFF !important;
  }
  .print-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .print-hide-on-print {
    display: none !important;
  }
}

@media screen {
  .print-root {
    max-width: 210mm;
    margin: 0 auto;
    padding: 15mm;
    background: #FFFFFF;
    min-height: 100vh;
    box-shadow: 0 0 12px rgba(0,0,0,0.05);
  }
}

body {
  font-family: ${ilhaTokens.font.family};
  color: #111;
  margin: 0;
}
`;

// Estilos inline aplicados aos cards e seções via sx do MUI.
// Exportados como objetos pra manter o JSX limpo.
export const printTheme = {
  pageTitle: {
    fontSize: "20pt",
    fontWeight: 700,
    color: "#111",
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: {
    fontSize: "11pt",
    fontWeight: 400,
    color: "#666",
    marginTop: "4px",
    marginBottom: "12px",
  },
  accentLine: {
    height: "3px",
    backgroundColor: ilhaTokens.color.accent,
    width: "100%",
    marginBottom: "16px",
  },
  summary: {
    fontSize: "11pt",
    color: "#333",
    marginBottom: "16px",
  },
  card: {
    border: "1px solid #E5E5E5",
    borderRadius: "6px",
    padding: "10px 14px",
    marginBottom: "10px",
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  cardDayTime: {
    fontSize: "10pt",
    fontWeight: 700,
    color: "#111",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  },
  cardStatus: {
    fontSize: "9pt",
    fontWeight: 700,
    color: ilhaTokens.color.accent,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  },
  cardTitle: {
    fontSize: "13pt",
    fontWeight: 600,
    color: "#111",
    marginBottom: "4px",
  },
  cardMetaLabel: {
    fontSize: "9pt",
    fontWeight: 600,
    color: "#555",
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
    marginRight: "6px",
  },
  cardMetaValue: {
    fontSize: "10pt",
    color: "#333",
  },
  cardLink: {
    fontSize: "9pt",
    color: "#555",
    wordBreak: "break-all" as const,
  },
  footer: {
    marginTop: "24px",
    paddingTop: "8px",
    borderTop: "1px solid #E5E5E5",
    fontSize: "8pt",
    color: "#999",
    display: "flex",
    justifyContent: "space-between",
  },
  emptyState: {
    fontSize: "12pt",
    color: "#666",
    textAlign: "center" as const,
    padding: "48px 0",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "12px",
  },
};
