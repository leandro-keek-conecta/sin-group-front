export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Dicionário para restaurar acentos em termos PT-BR comuns cujo backend envia
// sem diacríticos (ex.: "informacao", "espaco"). Chave = forma sem acento em
// lowercase.
const ACCENT_DICT: Record<string, string> = {
  informacao: "informação",
  informacoes: "informações",
  espaco: "espaço",
  espacos: "espaços",
  operacao: "operação",
  operacoes: "operações",
  acao: "ação",
  acoes: "ações",
  atencao: "atenção",
  situacao: "situação",
  conversao: "conversão",
  conversoes: "conversões",
  classificacao: "classificação",
  aplicacao: "aplicação",
  avaliacao: "avaliação",
  gestao: "gestão",
  promocao: "promoção",
  promocoes: "promoções",
  selecao: "seleção",
  opcao: "opção",
  opcoes: "opções",
  deteccao: "detecção",
  detecao: "detecção",
  interacao: "interação",
  interacoes: "interações",
  disposicao: "disposição",
  comunicacao: "comunicação",
  reservacao: "reservação",
  reserva: "reserva",
  reservas: "reservas",
  integracao: "integração",
  localizacao: "localização",
  apresentacao: "apresentação",
  negociacao: "negociação",
  negociacoes: "negociações",
  confirmacao: "confirmação",
  solicitacao: "solicitação",
  solicitacoes: "solicitações",
  proximo: "próximo",
  proxima: "próxima",
  ultimo: "último",
  ultima: "última",
  minima: "mínima",
  maxima: "máxima",
  historico: "histórico",
  pratica: "prática",
  analise: "análise",
  analises: "análises",
  auditorio: "auditório",
  horario: "horário",
  horarios: "horários",
  telefone: "telefone",
  sabado: "sábado",
  domingo: "domingo",
  duvida: "dúvida",
  duvidas: "dúvidas",
  nao: "não",
  sao: "são",
  voce: "você",
  esta: "está",
  estao: "estão",
  ja: "já",
  tambem: "também",
  porque: "porque",
  preco: "preço",
  precos: "preços",
  servico: "serviço",
  servicos: "serviços",
  consulta: "consulta",
  endereco: "endereço",
  enderecos: "endereços",
};

export function restoreAccents(value: unknown): string {
  const raw = String(value ?? "");
  if (!raw) return "";
  return raw.replace(/[A-Za-zÀ-ú]+/g, (word) => {
    const key = word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const accented = ACCENT_DICT[key];
    if (!accented) return word;
    // Preservar caixa original (UPPERCASE, Title Case ou lowercase).
    if (word === word.toUpperCase()) return accented.toUpperCase();
    if (word[0] === word[0].toUpperCase())
      return accented[0].toUpperCase() + accented.slice(1);
    return accented;
  });
}

export function titleize(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const cased = raw
    .split(/\s+/)
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
  return restoreAccents(cased);
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

export function formatPercent(part: number, total: number): string {
  if (!total || !isFinite(total)) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function maskPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  const last2 = digits.slice(-2);
  return `${phone.slice(0, phone.length - 6)}****-**${last2}`;
}
