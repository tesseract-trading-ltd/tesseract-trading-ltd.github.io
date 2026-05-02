# Tesseract Trading

> *Projectio per Geometriam* — a four-axis trading house, execution arm of The Alephain Guild.

This repository hosts the public website for **Tesseract Trading**, served via GitHub Pages at <https://tesseract.alephain.com>.

## Structure

```
.
├── index.html                  # Single-page editorial folio (EN / 中)
├── _config.yml                 # Jekyll / GitHub Pages config
├── CNAME                       # Custom domain
├── site.webmanifest            # PWA manifest
├── favicon.svg / .ico / 96x96  # Browser icons
├── apple-touch-icon.png        # iOS home-screen icon
└── web-app-manifest-*.png      # PWA install icons
```

The page is a single self-contained HTML file with inline CSS and a small vanilla-JS language toggle and mobile sheet. No build step required.

## Brand

Adheres to **The Alephain Guild Brand Guide · v2.0**. The masthead and footer marks use the official Tesseract logo (Form A — Schlegel diagram of the 4-cube). See <https://github.com/the-alephain-guild/brand-guide>.

## Analytics

Google Analytics 4 — property `G-JRQ4FRY7LZ`, declared inline in `<head>`.

## Local preview

Open `index.html` directly in any modern browser, or run a static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## License

© Tesseract Trading Ltd. All rights reserved.
