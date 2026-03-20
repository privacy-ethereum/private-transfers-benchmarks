// eslint-disable-next-line @typescript-eslint/no-shadow
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Evaluation } from "../types.js";
import { PROPERTY_DEFINITIONS } from "../schema.js";
import ProtocolDetail from "../components/ProtocolDetail.js";
import evaluationsData from "../data/evaluations.json" with { type: "json" };

const evaluations = evaluationsData.evaluations as Evaluation[];
const noop = (): void => undefined;

afterEach(cleanup);

function renderProtocol(id: string): void {
  render(<ProtocolDetail evaluations={evaluations} selectedId={id} setEvaluations={noop} setSelectedId={noop} />);
}

describe("UI renders evaluation data from JSON", () => {
  evaluations.forEach((expected) => {
    it(`${expected.id}: renders title, description, documentation, and categories`, () => {
      renderProtocol(expected.id);

      expect(screen.getByText(expected.title)).toBeTruthy();
      expect(screen.getByText(expected.description)).toBeTruthy();
      if (expected.documentation) {
        expect(screen.getByText(expected.documentation)).toBeTruthy();
      }
      expected.categories.forEach((cat) => {
        expect(screen.getByText(cat)).toBeTruthy();
      });
    });

    it(`${expected.id}: renders all property values, notes, and urls`, () => {
      renderProtocol(expected.id);

      expected.properties.forEach((prop) => {
        const def = PROPERTY_DEFINITIONS.find((d) => d.name === prop.name);
        if (!def) return;

        // Select/number/text values appear as input display values
        if (prop.value && (def.inputType === "select" || def.inputType === "number" || def.inputType === "text")) {
          const matches = screen.queryAllByDisplayValue(prop.value);
          expect(matches.length).toBeGreaterThan(0);
        }

        // Notes rendered in textarea
        if (prop.notes) {
          const textareas = document.querySelectorAll("textarea");
          const found = Array.from(textareas).some((ta) => ta.value === prop.notes);
          expect(found, `notes not found for "${prop.name}"`).toBe(true);
        }

        // URL rendered in input
        if (prop.url) {
          const matches = screen.queryAllByDisplayValue(prop.url);
          expect(matches.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
