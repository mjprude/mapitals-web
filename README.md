# Mapitals

A geography guessing game where players identify capital cities by guessing letters, similar to hangman. The game features an interactive map that progressively zooms in with each wrong guess, providing visual hints about the location.

## Features

Mapitals offers multiple play modes including World capitals and region-specific options (Americas, Europe, Asia, Africa, Oceania, and US States). Players guess letters to reveal a hidden capital city and its country or state name. Each wrong guess zooms the map closer to the target location, with a maximum of 6 wrong guesses allowed before the game ends. The score is calculated based on efficiency: `6 - wrongGuesses` for each successful game.

The game tracks your progress with persistent statistics including total score, games played, current streak, and best streak. Completed capitals are marked with stars on the map, giving you a visual representation of your geography knowledge.

## Tech Stack

The application is built with React 18 and TypeScript, using Vite as the build tool for fast development and optimized production builds. The interactive map is powered by Leaflet with react-leaflet bindings. UI components are built using shadcn/ui (Radix UI primitives with Tailwind CSS styling).

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
git clone https://github.com/mjprude/mapitals-v2.git
cd mapitals-v2
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Testing

The project uses Vitest for testing with React Testing Library for component testing. Tests are located alongside source files with the `.test.ts` or `.test.tsx` extension.

Run the test suite:

```bash
npm run test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

## Linting

ESLint is configured with TypeScript and React-specific rules. Always ensure linting passes before committing changes:

```bash
npm run lint
```

## Building for Production

Build the application for production:

```bash
npm run build
```

This command runs TypeScript type checking followed by the Vite build process. The output is placed in the `dist` directory.

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

The source code lives in the `src/` directory. The main game logic is in `App.tsx`, with capital city data in `capitals.ts`. UI components are organized under `src/components/`, with game-specific components separate from the reusable shadcn/ui component library.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
