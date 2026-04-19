import { describe, it, expect } from "bun:test";
import { rollingSevenDays } from "../eventFormatters";

describe("rollingSevenDays", () => {
  it("devolve janela de 7 dias com start no início do dia e end no fim do 7º dia", () => {
    const from = new Date(2026, 3, 19, 14, 32, 10); // 19 abr 2026 14:32:10
    const { start, end } = rollingSevenDays(from);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(3);
    expect(start.getDate()).toBe(19);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(3);
    expect(end.getDate()).toBe(26);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });

  it("não muta a data recebida", () => {
    const from = new Date(2026, 3, 19, 14, 32, 10);
    const snapshot = from.getTime();
    rollingSevenDays(from);
    expect(from.getTime()).toBe(snapshot);
  });

  it("atravessa virada de mês corretamente", () => {
    const from = new Date(2026, 3, 28, 10, 0, 0); // 28 abr
    const { end } = rollingSevenDays(from);
    expect(end.getMonth()).toBe(4); // mai
    expect(end.getDate()).toBe(5);
  });

  it("usa new Date() como default quando from ausente", () => {
    const before = Date.now();
    const { start } = rollingSevenDays();
    const after = Date.now();
    expect(start.getTime()).toBeLessThanOrEqual(after);
    expect(start.getTime() + 86_400_000).toBeGreaterThanOrEqual(before);
  });
});
