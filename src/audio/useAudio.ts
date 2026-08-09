/**
 * React bindings for the audio engine.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AudioManager } from 'react-native-audio-api';

import { audioEngine } from './engine';
import { DrumLoop, DrumLoopOptions, Metronome, MetronomeOptions } from './sequencer';

let sessionConfigured = false;

/**
 * Configure the iOS audio session once per app launch.
 *
 * `playback` with `mixWithOthers` means the app makes sound even with the
 * ringer switch on silent — which is what a music app has to do — while still
 * letting a user keep a podcast running underneath.
 */
export function configureAudioSession() {
  if (sessionConfigured) return;
  sessionConfigured = true;
  try {
    AudioManager.setAudioSessionOptions({
      iosCategory: 'playback',
      iosMode: 'default',
      iosOptions: ['mixWithOthers'],
      iosAllowHaptics: true,
    });
    AudioManager.observeAudioInterruptions(true);
  } catch {
    // Not fatal — the engine still works with system defaults.
  }
}

/**
 * Boot the engine and keep it in step with the app lifecycle. Mount this once,
 * at the root.
 */
export function useAudioEngine() {
  const [ready, setReady] = useState(audioEngine.isReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    configureAudioSession();

    audioEngine
      .init()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Audio failed to start');
      });

    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        audioEngine.resume();
      } else {
        // Release every sounding voice on backgrounding; otherwise a held pad
        // keeps ringing in the background and drains the battery.
        audioEngine.stopAll();
        audioEngine.suspend();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return { ready, error };
}

/** Silence everything when a screen unmounts. */
export function useStopAudioOnUnmount() {
  useEffect(() => () => audioEngine.stopAll(), []);
}

/**
 * A metronome bound to component lifetime. Returns the current beat so the UI
 * can pulse in time.
 */
export function useMetronome(options: MetronomeOptions) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [bar, setBar] = useState(0);
  const metronomeRef = useRef<Metronome | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const metronome = new Metronome({
      ...optionsRef.current,
      onBeat: (b, br) => {
        setBeat(b);
        setBar(br);
        optionsRef.current.onBeat?.(b, br);
      },
    });
    metronomeRef.current = metronome;
    return () => {
      metronome.stop();
      metronomeRef.current = null;
    };
  }, []);

  useEffect(() => {
    metronomeRef.current?.update({
      bpm: options.bpm,
      beats: options.beats,
      subdivision: options.subdivision,
      accentDownbeat: options.accentDownbeat,
    });
  }, [options.bpm, options.beats, options.subdivision, options.accentDownbeat]);

  const start = useCallback(() => {
    metronomeRef.current?.start();
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    metronomeRef.current?.stop();
    setRunning(false);
    setBeat(-1);
  }, []);

  const toggle = useCallback(() => {
    if (metronomeRef.current?.isRunning) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  return { running, beat, bar, start, stop, toggle };
}

/** A looping drum pattern bound to component lifetime. */
export function useDrumLoop(options: Omit<DrumLoopOptions, 'onStep'>) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const loopRef = useRef<DrumLoop | null>(null);

  useEffect(() => {
    const loop = new DrumLoop({ ...options, onStep: setStep });
    loopRef.current = loop;
    return () => {
      loop.stop();
      loopRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loopRef.current?.update({
      bpm: options.bpm,
      steps: options.steps,
      tracks: options.tracks,
      swing: options.swing,
    });
  }, [options.bpm, options.steps, options.tracks, options.swing]);

  const start = useCallback(() => {
    loopRef.current?.start();
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    loopRef.current?.stop();
    setRunning(false);
    setStep(-1);
  }, []);

  const toggle = useCallback(() => {
    if (loopRef.current?.isRunning) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  return { running, step, start, stop, toggle };
}

/**
 * Track which notes are currently sounding so a keyboard can light up.
 * Handles both tap-to-play and press-and-hold.
 */
export function useKeyboardVoices(instrument: string) {
  const [active, setActive] = useState<number[]>([]);
  const heldRef = useRef<Set<number>>(new Set());

  const press = useCallback(
    (midi: number, velocity = 0.85) => {
      if (heldRef.current.has(midi)) return;
      heldRef.current.add(midi);
      setActive([...heldRef.current]);
      audioEngine.noteOn(midi, { instrument, velocity });
    },
    [instrument],
  );

  const release = useCallback(
    (midi: number) => {
      if (!heldRef.current.has(midi)) return;
      heldRef.current.delete(midi);
      setActive([...heldRef.current]);
      audioEngine.noteOff(midi, instrument);
    },
    [instrument],
  );

  const releaseAll = useCallback(() => {
    heldRef.current.forEach((midi) => audioEngine.noteOff(midi, instrument));
    heldRef.current.clear();
    setActive([]);
  }, [instrument]);

  useEffect(() => releaseAll, [releaseAll]);

  return { active, press, release, releaseAll };
}
