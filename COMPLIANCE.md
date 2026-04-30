# Compliance Notes

## License

This project is published under the **GNU General Public License v2** (GPL-2.0). In short:

- You may use, copy, modify, and distribute this software freely.
- Any modified version you distribute must also be licensed under GPL-2.0 and include its source code.
- The full license text is in [LICENSE](LICENSE).

All dependencies are MIT-licensed, which is compatible with GPL-2.0.

## Privacy

This app collects **no personal data**. Specifically:

- No analytics, tracking, or telemetry of any kind.
- No cookies.
- Events you create are stored in your browser's `localStorage` and never leave your device.
- No external network requests are made at runtime — all fonts are system fonts.

GitHub Pages (the hosting platform) may log IP addresses as part of normal server operation. That is governed by [GitHub's Privacy Policy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement), not this project.

Because no personal data is processed by this app, no privacy policy is required under GDPR for the application itself.

## Impressum

No Impressum is required. This is a non-commercial, private open-source project with no editorial content, no commercial intent, and no monetization.

If you ever add advertising, affiliate links, or turn this into a commercial service, an Impressum (and likely a privacy policy) would become mandatory under German law (§ 5 DDG).

## Dependency Licenses

| Package | Version | License |
|---------|---------|---------|
| svelte | 5.x | MIT |
| vite | 8.x | MIT |
| @sveltejs/vite-plugin-svelte | 7.x | MIT |

All dependencies are build-time only and are not distributed with the application. The built output is plain HTML, CSS, and JavaScript with no bundled third-party runtime.
