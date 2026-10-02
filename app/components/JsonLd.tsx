/**
 * Emits structured data. Nulls are dropped, so a caller can pass a block that
 * only sometimes exists — an FAQ, say — without guarding each one.
 */
export function JsonLd({ blocks }: { blocks: (Record<string, unknown> | null)[] }) {
  return (
    <>
      {blocks
        .filter((block): block is Record<string, unknown> => block !== null)
        .map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
    </>
  );
}
