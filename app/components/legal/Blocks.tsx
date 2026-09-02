import type { Block, Run } from "../../lib/legal/types";

/** Runs concatenate directly — the spacing is already baked into each run. */
export function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((run, i) => {
        if (run.href) {
          return (
            <a key={i} href={run.href} target="_blank" rel="noopener noreferrer">
              {run.t}
            </a>
          );
        }
        if (run.b) {
          return <strong key={i}>{run.t}</strong>;
        }
        return <span key={i}>{run.t}</span>;
      })}
    </>
  );
}

/** Keeps single-token cells such as a date from breaking at their hyphens. */
function noWrap(cell: string) {
  return cell.length <= 14 && !cell.includes(" ") ? "lg-nowrap" : undefined;
}

function List({ items }: { items: Run[][] }) {
  return (
    <ul className="lg-list">
      {items.map((item, i) => (
        <li key={i} className="lg-list-item">
          <span className="lg-dot" aria-hidden="true" />
          <span>
            <Runs runs={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.t) {
          case "p":
            return (
              <p key={i} className="lg-para">
                <Runs runs={block.runs} />
              </p>
            );

          case "clause":
            return (
              <div key={i} className="lg-clause">
                <span className="lg-clause-num">{block.num}</span>
                <p className="lg-para">
                  <Runs runs={block.runs} />
                </p>
              </div>
            );

          case "h3":
            return (
              <h3 key={i} className="lg-h3">
                {block.text}
              </h3>
            );

          case "ul":
          case "dl":
            return <List key={i} items={block.items} />;

          case "callout":
            return (
              <div key={i} className="lg-callout">
                <span className="lg-eyebrow">Note</span>
                <p>
                  <Runs runs={block.runs} />
                </p>
              </div>
            );

          case "table":
            return (
              <div key={i} className="lg-table-scroll">
                <table className="lg-table">
                  <thead>
                    <tr>
                      {block.head.map((cell, c) => (
                        <th key={c} scope="col" className={noWrap(cell)}>
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c} className={noWrap(cell)}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </>
  );
}
