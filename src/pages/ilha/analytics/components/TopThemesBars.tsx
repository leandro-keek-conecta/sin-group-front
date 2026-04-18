import { HorizontalBars } from "./HorizontalBars";
import type { IlhaResumo } from "../../types";

export function TopThemesBars({ data }: { data: IlhaResumo }) {
  return (
    <HorizontalBars
      title="Top temas"
      subtitle="Temas mais presentes nas conversas"
      items={data.aggregates.themeDistribution}
    />
  );
}
