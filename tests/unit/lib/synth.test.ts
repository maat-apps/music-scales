import { describe, expect, it, vi } from "vitest";

import { createSynth } from "@/lib/synth";

function fakeParam() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

function fakeContextClass(state: AudioContextState = "running") {
  const oscillators: { frequency: { value: number }; start: unknown }[] = [];
  const resume = vi.fn().mockResolvedValue(undefined);
  const created = vi.fn();
  class FakeContext {
    state = state;
    currentTime = 1;
    destination = {};
    resume = resume;
    constructor() {
      created();
    }
    createOscillator() {
      const oscillator = {
        type: "sine",
        frequency: fakeParam(),
        connect: (node: unknown) => node,
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(oscillator);
      return oscillator;
    }
    createGain() {
      return { gain: fakeParam(), connect: (node: unknown) => node };
    }
  }
  return {
    Context: FakeContext as unknown as new () => AudioContext,
    oscillators,
    resume,
    created,
  };
}

describe("createSynth", () => {
  it("plays one oscillator per note at its pitch", () => {
    const fake = fakeContextClass();
    const synth = createSynth(() => fake.Context);

    synth.play([69, 60]);

    expect(fake.oscillators.map((o) => o.frequency.value)).toEqual([
      440,
      expect.closeTo(261.63, 2),
    ]);
    expect(fake.oscillators[0].start).toHaveBeenCalledWith(1);
  });

  it("creates the audio context once, on first use", () => {
    const fake = fakeContextClass();
    const synth = createSynth(() => fake.Context);
    expect(fake.created).not.toHaveBeenCalled();

    synth.play([60]);
    synth.play([62]);

    expect(fake.created).toHaveBeenCalledTimes(1);
  });

  it("resumes a suspended context", () => {
    const fake = fakeContextClass("suspended");
    createSynth(() => fake.Context).play([60]);
    expect(fake.resume).toHaveBeenCalled();
  });

  it("stays silent without Web Audio or notes", () => {
    const fake = fakeContextClass();
    createSynth(() => undefined).play([60]);
    createSynth(() => fake.Context).play([]);
    expect(fake.created).not.toHaveBeenCalled();
  });

  it("finds the browser's AudioContext by default", () => {
    const fake = fakeContextClass();
    vi.stubGlobal("AudioContext", fake.Context);
    try {
      createSynth().play([60]);
      expect(fake.created).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
