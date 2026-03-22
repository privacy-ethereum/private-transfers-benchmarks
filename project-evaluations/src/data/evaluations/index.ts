import type { Evaluation } from "../../types.js";
import { evaluationSchema } from "../evaluation-schema.js";

import railgunData from "./railgun.json" with { type: "json" };
import tornadoCashData from "./tornado-cash.json" with { type: "json" };
import privacyPoolsData from "./privacy-pools.json" with { type: "json" };
import tongoData from "./tongo.json" with { type: "json" };
import intmaxData from "./intmax.json" with { type: "json" };
import fluidkeyData from "./fluidkey.json" with { type: "json" };
import moneroData from "./monero.json" with { type: "json" };
import redactData from "./redact.json" with { type: "json" };
import hinkalData from "./hinkal.json" with { type: "json" };

const rawEvaluations = [
  railgunData,
  tornadoCashData,
  privacyPoolsData,
  tongoData,
  intmaxData,
  fluidkeyData,
  moneroData,
  redactData,
  hinkalData,
];

export const evaluations: Evaluation[] = rawEvaluations.map((raw) => evaluationSchema.parse(raw) as Evaluation);
