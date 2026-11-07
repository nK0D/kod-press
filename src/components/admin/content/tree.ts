/**
 * Depth-first order for items with a `parent` id, so children follow their
 * parent. Items whose parent is missing from the list are treated as roots.
 */
export function treeOrder<T extends { id: number; parent: number }>(items: readonly T[]): { item: T; depth: number }[] {
  const ids = new Set(items.map((item) => item.id));
  const seen = new Set<number>();
  const ordered: { item: T; depth: number }[] = [];
  const walk = (parent: number, depth: number) => {
    for (const item of items) {
      const effectiveParent = ids.has(item.parent) ? item.parent : 0;
      if (effectiveParent !== parent || seen.has(item.id)) continue;
      seen.add(item.id);
      ordered.push({ item, depth });
      walk(item.id, depth + 1);
    }
  };
  walk(0, 0);
  // Anything left over sits in a parent cycle; show it rather than drop it.
  for (const item of items) if (!seen.has(item.id)) ordered.push({ item, depth: 0 });
  return ordered;
}
