await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  naming: "search.js",
});

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  naming: "search.min.js",
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
});
