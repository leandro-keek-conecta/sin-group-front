import { HorizontalBars } from "./HorizontalBars";
import type { IlhaResumo } from "../../types";

export function TopIntentsBars({ data }: { data: IlhaResumo }) {
  return <HorizontalBars kicker="02 — CLASSIFICAÇÃO" title="Top intenções" items={data.aggregates.intentDistribution} />;
}
