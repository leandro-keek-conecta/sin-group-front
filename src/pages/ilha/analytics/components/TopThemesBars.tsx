import { HorizontalBars } from "./HorizontalBars";
import type { IlhaResumo } from "../../types";

export function TopThemesBars({ data }: { data: IlhaResumo }) {
  return <HorizontalBars kicker="03 — CLASSIFICAÇÃO" title="Top temas" items={data.aggregates.themeDistribution} />;
}
