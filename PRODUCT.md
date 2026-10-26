# Skale (Scales)

## Product

Skale is a phone-first PWA for learning musical scales on a keyboard:
pick a root and a scale, see its notes lit on the keys, hear the keys and
the scale's chords. No accounts, no server, fully offline once installed.
Polish first (the default language and the H/B notation switch), English
too.

## Platform

web - PWA, mobile-only (like routines, notes and albums); portrait and
landscape.

## Behavior

- **Root and scale** from a floating button within the thumb's reach,
  which names the current scale: it opens a drawer with two wheels, like an
  alarm clock's hours and minutes — 12 roots; major, the three minors
  (natural, harmonic, melodic), the other modes (Dorian, Phrygian, Lydian,
  Mixolydian, Locrian), both pentatonics and blues. A choice applies at
  once; a new root sounds. A root is named the way its scale spells it (D♭
  major, C♯ minor).
- **The scale**: its name, notes (each letter once in a seven-note scale,
  so F major reads B♭, not A♯), degrees (1 2 ♭3 …) and steps in tones.
- **Keyboard**: the scale's keys lit, the root in its own colour, each lit
  key labelled; unlit Cs carry their octave (C4 is middle C). 1–4 octaves
  from a chosen C (Settings). It spans the screen's width, white keys at
  least 56px wide in either orientation (black ones two thirds of that),
  scrolling sideways when they don't fit. Tapping a key plays it.
- **Chords** for seven-note scales, one per degree with its Roman numeral
  (upper case major, lower case minor): the triads, then the seventh
  chords (Cmaj7, Dm7, G7, Bm7♭5 — viiø7, …), each group under its own
  heading and explanation. Each chord lists its root position and every
  inversion (two for a triad, three for a seventh chord), one per row: the
  notes (G B D F) and a small keyboard with those keys lit, the bass in
  the root's colour; tapping a row plays it.
  Pentatonics and blues explain why they have none.
- **Polish notation** (Settings): H for B, B for B♭ — everywhere notes are
  named.
- **Keep the screen on**: a phone button in the header, beside settings
  (Screen Wake Lock), filled while on, each tap saying in a short note
  what it did ("Ekran nie zgaśnie" / "Ekran może zgasnąć"); taken again on returning to the app, and absent where
  the browser has no Wake Lock.
- **Remembered**: root, scale, octaves, start octave and
  notation come back on the next launch.
- The ecosystem's app lock, install and update actions, and language, in
  Settings.
