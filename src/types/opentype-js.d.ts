// opentype.js ships no TypeScript declarations — declare it as an untyped
// module. We deliberately use it through a narrow any-typed wrapper in
// src/lib/studio/text-overlay.ts, so no richer types are needed.
declare module "opentype.js";
