# Compliance & Legal

## License

This project is licensed under the **GNU General Public License v3.0** (GPL-3.0).
See the [`LICENSE`](LICENSE) file for the full license text.

## Dependency Audit

All direct dependencies used in the production build are compatible
with GPL-3.0:

| Package | License | Notes |
|---------|---------|-------|
| `svelte` | MIT | Runtime framework |
| `@sveltejs/vite-plugin-svelte` | MIT | Build-time plugin |
| `vite` | MIT | Build tool |

Build-time dependencies carrying the Apache-2.0 license (`aria-query`,
`axobject-query`, `detect-libc`) are used only during compilation
and do not appear in the distributed application bundle.

The complete transitive dependency tree includes packages under MIT,
ISC, BSD-3-Clause, and MPL-2.0 licenses — all compatible with GPL-3.0.
Notable transitive dependencies:

| Package | License | Notes |
|---------|---------|-------|
| `lightningcss` | MPL-2.0 | CSS processing (via Vite) |
| `postcss` | MIT | CSS processing |
| `rolldown` | MIT | Bundler (via Vite) |
| `magic-string` | MIT | Source manipulation |
| `nanoid` | MIT | ID generation |
| `picocolors` | ISC | Terminal colors (dev-only) |
| `source-map-js` | BSD-3-Clause | Source maps |
| `clsx` | MIT | Runtime utility |
| `esrap` | MIT | Svelte compiler |
| `acorn` | MIT | JavaScript parser |
| `deepmerge` | MIT | Object merging |

The built output is plain HTML, CSS, and JavaScript with **no bundled
third-party runtime**.

## Privacy

Weekend Planner is designed with **privacy-by-default** principles:

- **No server:** The application is a fully static client-side build. There is no backend.
- **No cookies:** We do not use cookies or any similar tracking mechanisms.
- **No analytics:** No third-party analytics, telemetry, or tracking scripts are included.
- **No external data transmission:** Your planner data never leaves your device.
- **Local storage only:** Events, day names, and time range settings are stored in your browser's `localStorage`.
- **You own your data:** You can export your schedule as an `.ics` file at any time, or clear it completely via the reset function.
- **No account required:** There is no registration, login, or personal information collected.

### Data Stored in localStorage

| Key | Purpose | Retention |
|-----|---------|-----------|
| `weekend-planner-state` | Events, day names, start/end hour settings | Until manually reset or cleared |

To delete all data, use your browser's developer tools or site data clearing features.

## Attribution

- Icons embedded in the application are simple geometric SVG paths.
- The application uses system fonts — no external font CDN requests are made.

## No Impressum Required

Under German law (Telemediengesetz § 5), an **Impressum** is required for
*geschäftsmäßige Online-Dienste* (commercial online services offered in the
course of business).

Weekend Planner is **not a commercial service**:

- It is a free, open-source personal tool distributed under GPL-3.0.
- There is no payment, no advertising, no revenue model, and no business activity.
- It is not operated in the course of a trade, business, or profession.
- There is no journalistic or editorial content.

Because the application is **non-commercial and non-business**, the Impressum
requirement under § 5 TMG does not apply.

## Contributing

By contributing to this project, you agree that your contributions will be
licensed under the same GPL-3.0 license.
