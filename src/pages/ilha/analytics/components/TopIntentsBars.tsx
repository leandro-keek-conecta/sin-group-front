import { HorizontalBars } from "./HorizontalBars";
import type { IlhaResumo } from "../../types";

export function TopIntentsBars({ data }: { data: IlhaResumo }) {
  return (
    <HorizontalBars
      title="Top intenções"
      subtitle="Ocorrências classificadas pelo bot"
      items={data.aggregates.intentDistribution}
    />
  );
}
