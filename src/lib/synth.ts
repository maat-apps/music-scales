import { midiToFrequency } from "./music/notes";

// Keys and chords sound through Web Audio: one triangle oscillator per note
// with a short pluck envelope — no samples to download or cache.

const ATTACK_S = 0.01;
const DECAY_S = 1.1;
const SILENCE = 0.001;

type AudioContextConstructor = new () => AudioContext;

function defaultContext(): AudioContextConstructor | undefined {
  return (
    window.AudioContext ??
    (window as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext
  );
}

export function createSynth(getContext = defaultContext) {
  let context: AudioContext | undefined;

  /** Plays the notes together. Created on first use: a browser only lets a
   * page start audio from a tap. */
  function play(midis: number[]): void {
    const Context = getContext();
    if (!Context || midis.length === 0) return;
    context ??= new Context();
    // iOS suspends a context created outside a tap, and after an interruption.
    if (context.state === "suspended") void context.resume();
    const start = context.currentTime;
    // Quieter per note in a chord, so a chord is not louder than a key.
    const peak = 0.22 / midis.length + 0.05;
    for (const midi of midis) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = midiToFrequency(midi);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peak, start + ATTACK_S);
      gain.gain.exponentialRampToValueAtTime(SILENCE, start + DECAY_S);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + DECAY_S + 0.1);
    }
  }

  return { play };
}

export const synth = createSynth();
