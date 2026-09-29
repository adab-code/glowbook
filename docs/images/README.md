# Evidence images

Images referenced from the reports in `docs/`.

## Screenshots

- `w03-local-setup.png` — VS Code with the project running: `npm run dev` in the
  terminal and the browser on `http://localhost:3000`. Required by the W03
  *Local Development Screenshot* criterion.

## Diagrams

Both diagrams are rendered from Mermaid sources that live in the Markdown, so
they can be regenerated whenever the schema or the component tree changes.

- `w03-data-model.png` — the data model, from the Mermaid block in
  `docs/w03-reports.md`. 8 entities, 11 relationships.
- `w03-component-hierarchy.png` — the component tree, from the Mermaid block in
  `docs/architecture.md`. Regenerated on 2026-09-29 so it matches the current
  source: the `(auth)` group has no layout, the `(app)` layout renders
  `AppSidebar` and `AppHeader` inline, and there is no `AppShell`.

## Regenerating

`mermaid.ink` serves SVG, and its `/img/` endpoint returns JPEG rather than PNG.
The workflow used here:

```bash
# 1. extract the mermaid block, wrap it, base64url-encode the JSON payload
# 2. curl the SVG
curl -sS -o out.svg "https://mermaid.ink/svg/<payload>"
# 3. rasterise to PNG at 2400px wide
node -e "require('sharp')('out.svg',{density:96}).resize({width:2400}).png().toFile(out.png)"
```

`sharp` is already a transitive dependency, so this needs no install.
