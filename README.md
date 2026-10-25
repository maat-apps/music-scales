# Skale

Aplikacja PWA do nauki skal muzycznych na klawiaturze: wybierasz dźwięk
podstawowy i skalę, widzisz jej dźwięki na klawiszach, słyszysz klawisze
i akordy (trójdźwięki i septymowe, z cyframi rzymskimi). Działa
offline, na telefonie w pionie i w poziomie. Opis funkcji:
[PRODUCT.md](./PRODUCT.md).

Część ekosystemu [Ma'at Apps](https://github.com/maat-apps) — konwencje w
[CLAUDE.md](./CLAUDE.md) oraz w
[STRUCTURE.md](https://github.com/maat-apps/maat-core/blob/main/STRUCTURE.md)
i [VERIFICATION.md](https://github.com/maat-apps/maat-core/blob/main/VERIFICATION.md)
z maat-core.

## Uruchomienie lokalne

Wymaga Node 24+ i npm 11+.

```sh
npm install
npm run dev            # serwer deweloperski: http://localhost:5173/music-scales/
npm run test:unit      # testy jednostkowe (Vitest) — m.in. skale i akordy
npm run build          # build produkcyjny do dist/
npm run preview        # podgląd buildu: http://localhost:4173/music-scales/
npm run test:e2e       # testy E2E (Playwright; najpierw npx playwright install)
```

Aplikacja jest tylko na telefon — na komputerze włącz w narzędziach
deweloperskich przeglądarki widok urządzenia mobilnego. Service worker
(praca offline) działa tylko w buildzie (`npm run preview`), nie w
`npm run dev`.

## GitHub Pages

Aplikacja jest serwowana spod `https://maat-apps.github.io/music-scales/`
(`base` w `vite.config.ts`; manifest i service worker używają tej samej
ścieżki). Jeśli zmienisz nazwę repozytorium, zmień też `/music-scales/` w
`vite.config.ts`, `public/manifest.json` i `playwright.config.ts`.

Jednorazowo w repozytorium na GitHubie: **Settings → Pages → Build and
deployment → Source: GitHub Actions.**

Potem:

- **CI** (`.github/workflows/ci.yml`) — przy każdym PR: lint, format,
  typecheck, testy jednostkowe z pokryciem, testy E2E (Chromium i WebKit),
  build i `npm audit`.
- **CD** (`.github/workflows/cd.yml`) — przy pushu na `main`: build i
  wdrożenie na Pages (przez gałąź `pages-content`, która trzyma też
  podglądy PR-ów). Testów tu nie powtarza: na `main` trafia tylko to, co
  przeszło CI w PR (zasada z VERIFICATION.md). Dlatego włącz ochronę
  gałęzi `main` (Settings → Rules → Rulesets) z wymaganymi checkami
  `ci / code-quality`, `ci / test`, `ci / build-and-audit`.
- **Podgląd PR** — ręcznie z zakładki Actions („Deploy PR Preview”, numer
  PR-a) pod `/music-scales/pr-<numer>/`.

Wszystkie wywołują wspólne workflowy z
[maat-core](https://github.com/maat-apps/maat-core/tree/main/.github/workflows).

## Instalacja na telefonie

Otwórz `https://maat-apps.github.io/music-scales/` w przeglądarce telefonu.

- **Android (Chrome):** menu ⋮ → „Zainstaluj aplikację” (albo „Dodaj do
  ekranu głównego”); można też w aplikacji: Ustawienia (⚙) → Aplikacja →
  Zainstaluj.
- **iPhone / iPad (Safari):** przycisk Udostępnij → „Do ekranu
  początkowego” → Dodaj.

Aplikacja uruchamia się wtedy na pełnym ekranie, jak natywna, i działa bez
internetu. Nową wersję pobierzesz z Ustawienia → Aplikacja → Aktualizuj.
