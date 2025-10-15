// src/utils/mappedBySection.ts
import {
  BarChart,
  AccountBalance,
  School,
  LocalHospital,
  Security,
  EmojiPeople,
  WaterDrop,
  Handshake,
  Apartment,
  Public,
  Work,
  SportsSoccer,
  MusicNote,
  Layers,
  Group,
  Assessment,
  Nature,
  AccountCircle,
} from "@mui/icons-material";
import React from "react";

type optionsMenu = {
  name: string;
  displayName: string;
};

export type Section = {
  section: string;
  items: (optionsMenu & { icon: React.ReactElement })[];
};

// Normaliza texto
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// 🔹 Mapa de seções e palavras-chave
const SECTION_KEYWORDS: Record<string, string[]> = {
  "Painéis Gerais": ["visao", "geral", "perfil", "eleitorado"],
  "Gestão Pública": [
    "prefeito",
    "governador",
    "presidente",
    "deputado",
    "senador",
  ],
  "Temas Sociais": [
    "educacao",
    "saude",
    "seguranca",
    "saneamento",
    "meio ambiente",
    "religiosa",
  ],
  Infraestrutura: ["transporte", "obras", "energia", "infraestrutura"],
  Economia: ["comercio", "industria", "emprego", "renda"],
  "Esporte e Cultura": ["esporte", "cultura", "lazer"],
  Outros: [],
};

// 🔹 Mapa de ícones por palavra-chave
const ICON_KEYWORDS: Record<string, React.ReactElement> = {
  visao: <BarChart />,
  geral: <BarChart />,
  perfil: <Assessment />,
  eleitorado: <Group />,

  prefeito: <AccountBalance />,
  governador: <AccountBalance />,
  presidente: <AccountCircle />,
  deputado: <AccountBalance />,
  senador: <AccountBalance />,

  educacao: <School />,
  saude: <LocalHospital />,
  seguranca: <Security />,
  saneamento: <WaterDrop />,
  ambiente: <Nature />,
  religiosa: <EmojiPeople />,

  transporte: <Public />,
  energia: <Apartment />,
  infraestrutura: <Layers />,
  obras: <Work />,

  comercio: <Handshake />,

  emprego: <Work />,
  renda: <Work />,

  esporte: <SportsSoccer />,
  cultura: <MusicNote />,
  lazer: <MusicNote />,
};

// 🔹 Função principal
export function mappedBySection(list: optionsMenu[]): Section[] {
  const grouped: Record<
    string,
    (optionsMenu & { icon: React.ReactElement })[]
  > = {};
  for (const section of Object.keys(SECTION_KEYWORDS)) grouped[section] = [];

  for (const item of list) {
    const nameNorm = normalizeText(item.displayName);
    let foundSection = "Outros";

    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.some((k) => nameNorm.includes(k))) {
        foundSection = section;
        break;
      }
    }

    const foundKeyword = Object.keys(ICON_KEYWORDS).find((k) =>
      nameNorm.includes(k)
    );
    const icon = foundKeyword ? ICON_KEYWORDS[foundKeyword] : <BarChart />;

    grouped[foundSection].push({ ...item, icon });
  }

  const result: Section[] = Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .map(([section, items]) => ({ section, items }));

  // 🔹 Se sobrou só uma seção, renomeia para "Painéis Gerais"
  if (result.length === 1) {
    result[0].section = "Painéis Gerais";
  }

  return result;
}
