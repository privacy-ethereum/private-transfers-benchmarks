import { LONG_TITLE_LEN } from "../constants.js";
import { evaluations } from "../data/evaluations/index.js";
import { CATEGORY_EXPLAINERS } from "../data/explainers.js";
import { CATEGORIES } from "../data/schema.js";

interface CategoryBrowserProps {
  onGoToProfile: (id: string) => void;
}

export default function CategoryBrowser({ onGoToProfile }: CategoryBrowserProps) {
  return (
    <div className="direction">
      <div className="direction-intro">
        <div className="big-num">CATEGORIES</div>
        <div>
          <h2>Category browser</h2>
          <p>
            Categories taxonomising the space. Each card lists the protocols we&apos;ve evaluated in that category, plus
            a short definition. Empty categories stay visible so the full taxonomy is legible.
          </p>
        </div>
      </div>

      <div className="cat-grid">
        {CATEGORIES.map((cat) => {
          const protos = evaluations.filter((p) => p.categories.includes(cat));
          const desc = CATEGORY_EXPLAINERS[cat];
          return (
            <div key={cat} className={`cat-card${protos.length === 0 ? " empty" : ""}`}>
              <div className="head">
                <h3>{cat}</h3>
                <span className="count">{protos.length}</span>
              </div>
              {desc !== undefined && <div className="desc">{desc}</div>}
              <div className="protos">
                {protos.length > 0 ? (
                  protos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`proto-link${p.title.length > LONG_TITLE_LEN ? " long" : ""}`}
                      onClick={() => {
                        onGoToProfile(p.id);
                      }}
                      title={`Open ${p.title} profile →`}
                    >
                      {p.title}
                      <span className="proto-link__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                  ))
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--body-medium)", fontSize: 12 }}>
                    No evaluations yet
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
