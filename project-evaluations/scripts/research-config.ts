import { Evaluation } from "../src/types";

export type ProtocolConfig = Omit<Evaluation, "properties">;

export const configs: Record<string, ProtocolConfig> = {
  zcash: {
    id: "zcash",
    title: "ZCash",
    description:
      "A privacy-focused cryptocurrency using zk-SNARKs to enable fully shielded transactions" +
      " where sender, receiver, and amount are all encrypted on its own proof-of-work blockchain.",
    documentation: "https://zcash.readthedocs.io/en/latest/",
    categories: ["Alternative L1"],
    sourceUrls: [
      "https://maxdesalle.com/mastering-zcash",
      "https://seanbowe.com/blog/tachyaction-at-a-distance/",
      "https://zcash.readthedocs.io/en/latest/",
      "https://zcash.github.io/",
    ],
  },
};
