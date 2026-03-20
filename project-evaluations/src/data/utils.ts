import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { Category, Evaluation, EvaluationsData } from "../types.js";
import { evaluations as defaultData } from "./evaluations/index.js";

const EVALUATIONS_DATA_URL =
  "https://raw.githubusercontent.com/privacy-ethereum/private-transfers-benchmarks/tree/chore/project-evaluations-content/project-evaluations/src/data/evaluations.json";

export const useEvaluationsData = (
  url: string = EVALUATIONS_DATA_URL,
): {
  evaluations: Evaluation[];
  setEvaluations: Dispatch<SetStateAction<Evaluation[]>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  addEvaluation: (title: string, description: string, documentation: string, categories: Category[]) => void;
} => {
  const fallbackData = structuredClone(defaultData);

  const [evaluations, setEvaluations] = useState<Evaluation[]>(fallbackData);
  const [selectedId, setSelectedId] = useState<string | null>(fallbackData[0]?.id ?? null);

  useEffect(() => {
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch evaluations data");
        }

        return res.json() as Promise<EvaluationsData>;
      })
      .then((remote) => {
        setEvaluations(remote.evaluations);
        setSelectedId(remote.evaluations[0]?.id ?? null);
      })
      .catch(() => undefined);
  }, [url]);

  const addEvaluation = (title: string, description: string, documentation: string, categories: Category[]): void => {
    const newEvaluation: Evaluation = {
      id: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      title,
      description,
      documentation,
      categories,
      properties: [],
    };

    setEvaluations((prev) => [...prev, newEvaluation]);
    setSelectedId(newEvaluation.id);
  };

  return {
    evaluations,
    setEvaluations,
    selectedId,
    setSelectedId,
    addEvaluation,
  };
};
