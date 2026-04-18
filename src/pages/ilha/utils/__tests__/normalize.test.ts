import { describe, it, expect } from "bun:test";
import { normalize } from "../normalize";
import { rawFormatA, rawFormatB } from "./fixtures";

describe("normalize", () => {
  it("aceita array de arrays (formato A)", () => {
    const out = normalize(rawFormatA);
    expect(out.users).toHaveLength(1);
    expect(out.users[0].nome).toBe("Maria Silva");
    expect(out.users[0].conversations).toHaveLength(1);
    expect(out.users[0].conversations[0].messages).toHaveLength(3);
  });

  it("aceita objeto com chaves nomeadas (formato B)", () => {
    const out = normalize(rawFormatB);
    expect(out.users).toHaveLength(1);
    expect(out.users[0].conversations[0].transferredToAssistant).toBe(true);
  });

  it("detecta transferência para assistente via evento type=transfer", () => {
    const out = normalize(rawFormatA);
    const c = out.users[0].conversations[0];
    expect(c.transferredToAssistant).toBe(true);
    expect(c.assistantName).toBe("Temis");
    expect(c.transferredAt).toBeInstanceOf(Date);
  });

  it("agrega distribuições no nível global", () => {
    const out = normalize(rawFormatA);
    expect(out.aggregates.totalConversations).toBe(1);
    expect(out.aggregates.totalMessages).toBe(3);
    expect(out.aggregates.intentDistribution.length).toBeGreaterThan(0);
  });

  it("lança erro em formato não reconhecido", () => {
    expect(() => normalize({ foo: "bar" } as unknown)).toThrow(/formato/i);
  });
});
