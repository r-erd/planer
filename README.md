# Weekend Planner

An intuitive drag-and-drop event planner for organizing activities across multiple days.

## Features

- **Drag-and-drop scheduling** — place events onto a time grid across any number of day columns
- **Event editing** — double-click an event to rename it
- **Resize events** — drag the bottom edge to adjust duration
- **Color coding** — right-click an event to pick from 11 colors
- **Context menu** — right-click to edit color, duplicate, or delete events
- **Staging area** — hold unscheduled events until you're ready to place them
- **Overlap detection** — visual indicator for conflicting events
- **Current time indicator** — live marker on today's column
- **Configurable time range** — set custom start and end hours in settings
- **Export to ICS** — download events as an iCalendar file to import into any calendar app
- **Persistent storage** — events are saved to `localStorage` automatically

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the built output locally
```

The output in `dist/` is a static site — deploy it to any web host or GitHub Pages.

## Usage

- **Add an event** — click an empty time slot in a day column or drag from the staging area
- **Move an event** — drag it to a new time slot or day
- **Resize an event** — drag the handle at the bottom edge
- **Edit title** — double-click the event
- **Context menu** — right-click an event for color, duplicate, and delete options
- **Settings** — click the gear icon to adjust the visible time range
- **Export** — click the export button in the header to download an `.ics` file
- **Reset** — restores the default example events

## Tech Stack

- [Svelte 5](https://svelte.dev/) — reactive component framework
- [Vite](https://vitejs.dev/) — build tool and dev server

## License

This program is free software: you can redistribute it and/or modify it under the terms of the [GNU General Public License v2](LICENSE) as published by the Free Software Foundation.

All direct dependencies (Svelte, Vite) are MIT-licensed and compatible with GPL-2.0.
