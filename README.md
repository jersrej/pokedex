# Pokédex

The original Pokédex, rebuilt for the modern web: a folding device with a
searchable index of the first 151 Pokémon on one LCD and the selected entry on
the other. Data comes from [PokéAPI](https://pokeapi.co).

It is deliberately Generation I throughout — Kanto #001–#151 only, Red/Blue
sprites, the fifteen original types, the single Special stat, Red-version
Pokédex text and the original cries. The range is enforced in the data layer
(`src/features/pokemon/dex.ts`), not filtered in the UI.

## Requirements

Node 24 (see `.nvmrc` — run `nvm use`).

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server                 |
| `npm run build`   | Type-check, then build to `dist/`         |
| `npm run preview` | Serve the production build locally        |
| `npm test`        | Run the test suite once (Vitest)          |
| `npm run lint`    | ESLint                                    |

There are no environment variables. The API base URL lives in
`src/features/pokemon/api/client.ts`.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query 5 · Vitest

## Structure

```
src/
  components/          shared UI (icon button, screen messages)
  lib/                 query client, storage, media-query helpers
  features/
    pokemon/           the data: API functions, types, queries, and the
      api/             components that display Pokémon (list, entry, types,
      hooks/           stats, cry, favourites)
      components/
    pokedex/           the device: shell, cover, fold state, theme, LEDs
      hooks/
      components/
```

Colours are defined once as `--pokedex-*` tokens at the top of
`src/index.css`. The keys under the left screen switch the display between
Classic (olive LCD), Mono (greyscale) and Color (Red/Blue sprites in their
Super Game Boy palettes); a mode only re-inks the LCD tokens and picks the
sprite set (`src/lib/displayMode.ts`), and is remembered in localStorage. Interface sound effects (`src/lib/sfx.ts`) are synthesised,
off by default, and switched on from the speaker button on the device.

Data flows one way: PokéAPI → `api/` functions (which trim responses to typed
domain objects) → query options and hooks in `queries.ts` → components.

## Keyboard

| Key       | Action                              |
| --------- | ----------------------------------- |
| `/`       | Focus search                        |
| `↓` / `↑` | Move through the list               |
| `Enter`   | Open the first search result        |
| `←` / `→` | Previous / next (wraps 001 ↔ 151)   |
| `Esc`     | Clear search, or return to the list |

Pokémon and Pokémon character names are trademarks of Nintendo. This is an
unofficial fan project.
