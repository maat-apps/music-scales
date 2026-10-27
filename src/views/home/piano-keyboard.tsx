import { useTranslation } from "../../i18n/use-translation";
import type { KeyboardPrefs } from "../../lib/app-settings";
import { keyboardKeys, type PianoKey } from "../../lib/music/keyboard";
import {
  noteName,
  simpleSpellings,
  type Notation,
  type SpelledNote,
} from "../../lib/music/notes";
import { synth } from "../../lib/synth";

/** A black key's width, and how far it reaches over the white key on its
 * left, as a share of a white key. */
const BLACK_KEY_WIDTH = 0.66;

export function PianoKeyboard({
  prefs,
  rootPc,
  scaleNotes,
  notation,
}: {
  prefs: KeyboardPrefs;
  rootPc: number;
  /** The scale's notes by pitch class. */
  scaleNotes: Map<number, SpelledNote>;
  notation: Notation;
}) {
  const { t } = useTranslation();
  const keys = keyboardKeys(prefs.startOctave, prefs.octaves);
  const whiteCount = keys.filter((key) => !key.black).length;
  const whiteWidth = 100 / whiteCount;

  function label(key: PianoKey): string {
    const scaleNote = scaleNotes.get(key.pitchClass);
    const name =
      noteName(scaleNote ?? simpleSpellings(key.pitchClass)[0], notation) +
      key.octave;
    if (!scaleNote) return name;
    return t(key.pitchClass === rootPc ? "keyRoot" : "keyInScale", {
      note: name,
    });
  }

  return (
    <section aria-label={t("keyboard")} className="grid gap-2">
      {/* Edge to edge: through the page's side padding, short of the notch. */}
      <div className="mr-[calc(env(safe-area-inset-right)_-_var(--gutter-right))] ml-[calc(env(safe-area-inset-left)_-_var(--gutter-left))] [scrollbar-width:thin] overflow-x-auto overscroll-x-contain">
        <div
          className="relative flex h-44 touch-pan-x select-none landscape:h-32"
          // --white-key-min (globals.css): a roomy tap; the keys widen to
          // fill the screen when they'd leave it partly empty.
          style={{ minWidth: `calc(${whiteCount} * var(--white-key-min))` }}
        >
          {keys.map((key) => {
            const scaleNote = scaleNotes.get(key.pitchClass);
            const role = !scaleNote
              ? "none"
              : key.pitchClass === rootPc
                ? "root"
                : "scale";
            return (
              <button
                key={key.midi}
                type="button"
                data-role={role}
                data-black={key.black || undefined}
                aria-label={label(key)}
                className="piano-key"
                style={
                  key.black
                    ? {
                        left: `${(key.whiteIndex + 1 - BLACK_KEY_WIDTH / 2) * whiteWidth}%`,
                        width: `${BLACK_KEY_WIDTH * whiteWidth}%`,
                      }
                    : undefined
                }
                onPointerDown={() => synth.play([key.midi])}
                // Enter/Space: a click with no pointer behind it.
                onClick={(event) => {
                  if (event.detail === 0) synth.play([key.midi]);
                }}
              >
                {/* A span, so the root's can wear its dot (globals.css). */}
                <span>
                  {scaleNote
                    ? noteName(scaleNote, notation)
                    : key.pitchClass === 0 && `C${key.octave}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="piano-swatch" data-role="root" />
          {t("legendRoot")}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="piano-swatch" data-role="scale" />
          {t("legendScale")}
        </span>
      </div>
    </section>
  );
}
