import { CATEGORY_EXPLAINERS } from "../data/explainers.js";

interface TagProps {
  cat: string;
  withPop?: boolean;
}

export default function Tag({ cat, withPop = true }: TagProps) {
  const desc = CATEGORY_EXPLAINERS[cat];
  const longCls = cat.length > 16 ? " tag--long" : "";
  return (
    <span className={`tag purple pop-trigger${longCls}`}>
      {cat}
      {withPop && desc !== undefined && <span className="pop">{desc}</span>}
    </span>
  );
}
