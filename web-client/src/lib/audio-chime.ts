/**
 * Web Audio API synthesized chime for instant, zero-latency order notifications.
 * Uses high-precision Web Audio oscillators and exponential gain decays.
 * Guarantees crisp notification alerts without relying on external mp3 assets or network requests.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  } catch (err) {
    console.warn("Failed to initialize AudioContext:", err);
    return null;
  }
}

/**
 * Plays a pleasant, multi-harmonic restaurant order chime (A5 -> D6 chime).
 * @param volume Master volume between 0.0 and 1.0 (default 0.7)
 */
export function playOrderChime(volume = 0.7): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const clampedVolume = Math.max(0, Math.min(1, volume));

    // Master volume gain node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(clampedVolume, now);
    masterGain.connect(ctx.destination);

    // Tone 1: High crisp bell ding (880 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2: Warm harmonic resonance (1174.66 Hz - D6) starting slightly later (+100ms)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1174.66, now + 0.1);
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.9, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.9);

    // Tone 3: Low body chime tone (440 Hz - A4)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(440, now);
    gain3.gain.setValueAtTime(0.3, now);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now);
    osc3.stop(now + 0.75);
  } catch (err) {
    console.warn("Could not play Web Audio API chime:", err);
  }
}

