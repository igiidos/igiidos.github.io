# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Blog Overview

**Blog name:** sub3 engineering  
**GitHub Pages site:** igiidos.github.io  
**Topics:** Running, marathon, trail running, running-related IT technology, running travel  

This is an Astro static site deployed to GitHub Pages via GitHub Actions.

## Commands

```bash
# Install dependencies
npm install

# Local development server (http://localhost:4321)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# TypeScript type check
npm run check
```

## Content Architecture

### Adding blog posts

Posts live in `src/content/posts/` as markdown files with frontmatter:

```
src/content/posts/YYYY-MM-DD-slug.md
```

Required frontmatter fields:
```yaml
---
title: "Post title"
date: YYYY-MM-DD
category: running  # one of: running | marathon | trail | tech | travel
---
```

Optional frontmatter fields: `tags` (array), `excerpt` (string), `draft` (boolean, default false).

### Routing

| URL | File |
|-----|------|
| `/` | `src/pages/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/running`, `/marathon`, `/trail`, `/tech`, `/travel` | `src/pages/[category]/index.astro` (one file, dynamic) |
| `/posts/[slug]` | `src/pages/posts/[...slug].astro` |

### Component structure

- `src/layouts/Base.astro` — HTML shell (head, fonts, global.css)
- `src/layouts/BlogPost.astro` — Individual post layout with prev/next nav
- `src/components/Nav.astro` — Fixed top navigation bar
- `src/components/Footer.astro` — Footer with elapsed timer
- `src/content/config.ts` — Content Collections Zod schema
- `src/styles/global.css` — CSS custom properties and shared utilities

### Design tokens

```css
--bg: #111111         /* dark background */
--accent: #D4FF00     /* electric chartreuse — primary accent */
--text: #EDEAE0       /* warm white */
--display: 'Barlow Condensed'  /* headlines */
--mono: 'DM Mono'              /* code, labels */
--serif: 'Crimson Pro'         /* body text */
```

## Deployment

Push to `main` branch triggers GitHub Actions (`.github/workflows/deploy.yml`) which builds with `withastro/action@v3` and deploys to GitHub Pages.

**GitHub Pages setting:** Settings → Pages → Source must be set to **"GitHub Actions"** (not the legacy Jekyll builder).
