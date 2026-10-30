/**
 * Emits structured data. Nulls are dropped, so a caller can pass a block that
 * only sometimes exists — an FAQ, say — without guarding each one.
 */
/**
 * JSON inside a <script> is still read by the HTML parser first, so a "<" in
 * any value (an FAQ answer quoting "</script>", say) could end the tag early.
 * "\u003c" is the same character to a JSON reader and invisible to the parser.
 */
function serialise(block: Record<string, unknown>) {
  return JSON.stringify(block).replace(/</g, "\\u003c");
}

export function JsonLd({ blocks }: { blocks: (Record<string, unknown> | null)[] }) {
  return (
    <>
      {blocks
        .filter((block): block is Record<string, unknown> => block !== null)
        .map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serialise(block) }}
          />
        ))}
    </>
  );
}
