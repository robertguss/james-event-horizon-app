import { describe, expect, it } from "vitest";
import { mission01 } from "../fixtures/mission01";
import { evidenceExactSetMatch, gradeEvidence } from "./evidence";
import { evidenceMode, gradeAnswer } from "./grade";

const q1 = mission01.questions[0]!;
const q2 = mission01.questions[1]!;
const q3 = mission01.questions[2]!;
const q4 = mission01.questions[3]!;
const q5 = mission01.questions[4]!;

describe("evidence grading", () => {
  it("exact requires single matching id", () => {
    expect(gradeEvidence("exact", "s3", ["s3"])).toBe(true);
    expect(gradeEvidence("exact", "s4", ["s3"])).toBe(false);
    expect(gradeEvidence("exact", "s3", ["s3", "s4"])).toBe(false);
  });

  it("anyOf accepts either id", () => {
    expect(gradeEvidence("anyOf", "s5", ["s5", "s6"])).toBe(true);
    expect(gradeEvidence("anyOf", "s6", ["s5", "s6"])).toBe(true);
    expect(gradeEvidence("anyOf", "s7", ["s5", "s6"])).toBe(false);
  });

  it("exact-set helper rejects forged multi-id claims", () => {
    expect(evidenceExactSetMatch(["s3"], ["s3"])).toBe(true);
    expect(evidenceExactSetMatch(["s3", "s4"], ["s3"])).toBe(false);
    expect(evidenceExactSetMatch(["s5"], ["s5", "s6"])).toBe(false);
  });
});

describe("MC + locate + exit ticket", () => {
  it("accepts Q1 locate on s3 only", () => {
    expect(gradeAnswer({ question: q1, evidenceId: "s3" }).correct).toBe(true);
    expect(gradeAnswer({ question: q1, evidenceId: "s4" }).correct).toBe(false);
  });

  it("grades main-idea MC by choice", () => {
    expect(gradeAnswer({ question: q2, choiceId: "B" }).correct).toBe(true);
    expect(gradeAnswer({ question: q2, choiceId: "A" }).correct).toBe(false);
  });

  it("requires Q4 choice B and anyOf evidence", () => {
    expect(
      gradeAnswer({
        question: q4,
        choiceId: "B",
        evidenceId: "s5",
      }).correct,
    ).toBe(true);
    expect(
      gradeAnswer({
        question: q4,
        choiceId: "B",
        evidenceId: "s6",
      }).correct,
    ).toBe(true);
    expect(gradeAnswer({ question: q4, choiceId: "B" }).correct).toBe(false);
    expect(
      gradeAnswer({
        question: q4,
        choiceId: "A",
        evidenceId: "s5",
      }).correct,
    ).toBe(false);
    expect(
      gradeAnswer({
        question: q4,
        choiceId: "B",
        evidenceId: "s7",
      }).correct,
    ).toBe(false);
  });

  it("exit ticket accepts A", () => {
    expect(gradeAnswer({ question: q5, choiceId: "A" }).correct).toBe(true);
    expect(gradeAnswer({ question: q5, choiceId: "B" }).correct).toBe(false);
  });

  it("evidenceMode: locate / choice+evidence / choice-only", () => {
    expect(evidenceMode(q1)).toBe("evidence_only");
    expect(evidenceMode(q2)).toBe("choice_only");
    expect(evidenceMode(q3)).toBe("choice_only");
    expect(evidenceMode(q4)).toBe("choice_and_evidence");
    expect(evidenceMode(q5)).toBe("choice_only");
  });

  it("Q3/Q5 choice-only ignore wrong evidenceId when choice is right", () => {
    expect(
      gradeAnswer({
        question: q3,
        choiceId: "A",
        evidenceId: "s1",
      }).correct,
    ).toBe(true);
    expect(
      gradeAnswer({
        question: q5,
        choiceId: "A",
        evidenceId: "s2",
      }).correct,
    ).toBe(true);
    expect(
      gradeAnswer({
        question: q3,
        choiceId: "B",
        evidenceId: "s4",
      }).correct,
    ).toBe(false);
  });

  it("ignores forged claimedCorrect", () => {
    expect(
      gradeAnswer({
        question: q1,
        evidenceId: "s2",
        claimedCorrect: true,
      }).correct,
    ).toBe(false);
    expect(
      gradeAnswer({
        question: q2,
        choiceId: "C",
        claimedCorrect: true,
      }).correct,
    ).toBe(false);
  });
});
