# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VectorStrat AI is a portfolio website showcasing AI projects and innovations. It's built with Next.js 14 (App Router), TypeScript, and Tailwind CSS, designed to run on Vercel with the domain vectorstrat.ai.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm start

# Run linter
npm run lint
```

## Architecture

### Current State: Single-Page Application

Currently a single-page application with all content in one file:
- [app/page.tsx](app/page.tsx) - Main landing page containing Hero, Projects, About, and Contact sections
- [app/layout.tsx](app/layout.tsx) - Root layout with metadata, Inter font, and EmailJS initialization
- [app/globals.css](app/globals.css) - Global styles with dark theme CSS variables

### Planned Architecture: Multi-Page AI Use Case Showcase

**The site is being re-developed incrementally** to become a multi-page application where:

1. **Main Page (Gallery/Hub)**
   - Displays clickable preview boxes for each AI use case
   - Each box contains a thumbnail/preview image of the target page
   - Visual design creates the feeling of "traveling into" the showcased site

2. **Individual AI Use Case Pages**
   - Each use case gets its own route in the Next.js app directory (e.g., `app/use-case-name/page.tsx`)
   - Pages are accessed by clicking preview boxes on the main page
   - Each page demonstrates a specific AI application or implementation

3. **Navigation & Transitions**
   - Smooth, elegant transitions between main page and use case pages
   - Visual continuity from preview box → full page experience
   - Use Next.js Link component with prefetching for optimal performance

4. **Development Approach**
   - Build one use case page at a time
   - Maintain consistent design language across all pages
   - Keep the sophisticated cream/amber color palette and understated elegance

### Component Architecture

The application currently uses inline components within [app/page.tsx](app/page.tsx):
- `ProjectCard` component is defined at the bottom of the file
- All other UI elements are rendered directly in the main `Home` component
- Navigation, sections, and forms are all part of the single page component

**When adding new use case pages:**
- Create a new directory under `app/` for each use case (e.g., `app/chatbot-demo/`)
- Each directory should have its own `page.tsx` file
- Shared components should be extracted to a `components/` directory as the app grows

### Styling Approach

- **Tailwind CSS**: Utility-first approach with inline classes
- **Color Palette**: Sophisticated cream and amber theme (amber-400, yellow-600, stone-300) for accent colors against dark backgrounds (gray-950, gray-900, gray-800)
- **Design Philosophy**: Understated elegance with gradients, backdrop blur effects, and subtle borders
- **Dark Theme**: Custom CSS variables in [globals.css](app/globals.css) define --background and --foreground

### External Integrations

**EmailJS Contact Form** (configured in [layout.tsx](app/layout.tsx)):
- Service ID: `service_kvd1v9r`
- Template ID: `template_d2f5vgo`
- Public Key: `H3EYgg8SuEgjbnXSB`
- EmailJS SDK is loaded asynchronously and initialized in the document head
- Form submission logic is embedded as inline script in [page.tsx](app/page.tsx)

### Path Aliases

TypeScript path alias configured in [tsconfig.json](tsconfig.json):
- `@/*` maps to the root directory

## Deployment

The site is deployed on Vercel with automatic deployments from the main branch:
- **Domain**: vectorstrat.ai (DNS configured via Porkbun)
- **Deployment Process**: Push to main branch → automatic Vercel build and deploy
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed DNS configuration and deployment instructions

## Code Style

- **Strict TypeScript**: All files use TypeScript with strict mode enabled
- **ESLint**: Next.js ESLint configuration is active
- **Component Props**: Use explicit interface definitions (see `ProjectCardProps` in [page.tsx](app/page.tsx))
- **HTML Entities**: Use proper escaping (e.g., `&apos;` instead of apostrophes in JSX)
- **Inline Scripts**: Client-side JavaScript is embedded using `dangerouslySetInnerHTML` for EmailJS integration

## Project Status & Vision

**Current State:** Single-page portfolio website with placeholder project cards showing "Coming Soon", "Planned", and "Concept" status.

**Future Vision:** An immersive multi-page showcase where:
- The main page serves as a visual gallery of AI use case previews
- Clicking a preview box creates a smooth, elegant transition that feels like "diving into" the showcased application
- Each AI use case has its own dedicated page demonstrating practical AI implementations
- The experience emphasizes fluid navigation and visual continuity

**Development Strategy:** Build incrementally, one use case at a time, ensuring each addition maintains the site's sophisticated aesthetic and smooth user experience.
