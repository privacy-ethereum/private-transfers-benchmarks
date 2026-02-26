export type Category =
  | "Stealth addresses"
  | "Mixer"
  | "Shielded pool"
  | "zkWormholes"
  | "TEEs"
  | "Homomorphic encryption (FHE - HE)"
  | "Multi Party Computation (MPC)"
  | "Garbled circuits"
  | "EVM Obfuscators"
  | "Cross-L1 CEX aggregator and mixer"
  | "VPN (Private Intents)";

export type PropertyGroup =
  | "Privacy"
  | "Cost and Performance"
  | "UX"
  | "Decentralization & Security"
  | "Compliance"
  | "Verifiable"
  | "State"
  | "Composability";

export type PropertyInputType = "text" | "number" | "select";

/** Metadata that drives UI rendering for each property */
export interface PropertyDefinition {
  name: string;
  group: PropertyGroup;
  description: string;
  metric: string;
  inputType: PropertyInputType;
  options?: readonly string[];
}

/** One property value stored on an evaluation */
export interface Property {
  name: string;
  value: string;
}

export interface Evaluation {
  id: string;
  title: string;
  description: string;
  category: Category;
  properties: Property[];
}

export interface EvaluationsData {
  evaluations: Evaluation[];
}
