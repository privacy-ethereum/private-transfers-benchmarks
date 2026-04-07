import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { Category, Evaluation } from "../types.js";
import { evaluations as defaultData } from "./evaluations/index.js";

export const useEvaluationsData = (): {
  evaluations: Evaluation[];
  setEvaluations: Dispatch<SetStateAction<Evaluation[]>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  addEvaluation: (title: string, description: string, documentation: string, categories: Category[]) => void;
} => {
  const evaluationData = structuredClone(defaultData);

  const [evaluations, setEvaluations] = useState<Evaluation[]>(evaluationData);
  const [selectedId, setSelectedId] = useState<string | null>(evaluationData[0]?.id ?? null);

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
