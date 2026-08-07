/**
 * Transport and step sequencing.
 *
 * Web Audio scheduling is sample-accurate but JavaScript timers are not, so
 * this uses the standard lookahead pattern: a coarse timer wakes up often and
 * schedules every event that falls inside a short window ahead of the audio
 * clock. Timing jitter in the timer never reaches the audio output.
 */

import { audioEngine } from './engine';

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;

export interface StepEvent {
  /** Step index within the loop. */
  step: number;
  /** Audio-clock time this step fires at. */
  time: number;
  /** Bar number since the transport started. */
  bar: number;
  /** True on the first step of a bar. */
  downbeat: boolean;
}

export interface TransportOptions {
  bpm: number;
  /** Steps per bar. 16 = sixteenth notes in 4/4. */
  stepsPerBar: number;
  /** Steps per beat, used to work out where the downbeats are. */
  stepsPerBeat: number;
  /** 0 = straight, 1 = full triplet swing. */
  swing?: number;
  /** Called on the audio thread's schedule, ahead of time. Do audio here. */
  onSchedule: (event: StepEvent) => void;
  /** Called on the JS thread roughly when the step is heard. Do UI here. */
  onStep?: (step: number, bar: number) => void;
}

export class Transport {
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private currentBar = 0;
  private options: TransportOptions;
  private pendingUiTimeouts: Array<ReturnType<typeof setTimeout>> = [];

  constructor(options: TransportOptions) {
    this.options = options;
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }

  update(partial: Partial<TransportOptions>) {
    this.options = { ...this.options, ...partial };
  }

  start() {
    if (this.timer) return;
    this.currentStep = 0;
    this.currentBar = 0;
    this.nextStepTime = audioEngine.now + 0.08;
    this.timer = setInterval(() => this.tick(), LOOKAHEAD_MS);
    this.tick();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.pendingUiTimeouts.forEach(clearTimeout);
    this.pendingUiTimeouts = [];
  }

  private secondsPerStep(): number {
    const { bpm, stepsPerBeat } = this.options;
    return 60 / bpm / stepsPerBeat;
  }

  private tick() {
    const horizon = audioEngine.now + SCHEDULE_AHEAD;
    while (this.nextStepTime < horizon) {
      const { stepsPerBar, stepsPerBeat, swing = 0 } = this.options;

      // Swing delays every second subdivision. Applying it to the scheduled
      // time rather than the grid keeps the loop from drifting.
      const isOffbeat = this.currentStep % 2 === 1;
      const swingDelay = isOffbeat ? swing * (2 / 3 - 0.5) * (60 / this.options.bpm) * (4 / stepsPerBeat) : 0;
      const time = this.nextStepTime + swingDelay;

      this.options.onSchedule({
        step: this.currentStep,
        time,
        bar: this.currentBar,
        downbeat: this.currentStep === 0,
      });

      if (this.options.onStep) {
        const step = this.currentStep;
        const bar = this.currentBar;
        const delay = Math.max(0, (time - audioEngine.now) * 1000);
        const handle = setTimeout(() => {
          this.options.onStep?.(step, bar);
          this.pendingUiTimeouts = this.pendingUiTimeouts.filter((h) => h !== handle);
        }, delay);
        this.pendingUiTimeouts.push(handle);
      }

      this.nextStepTime += this.secondsPerStep();
      this.currentStep = (this.currentStep + 1) % stepsPerBar;
      if (this.currentStep === 0) this.currentBar += 1;
    }
  }
}

// ── Metronome ─────────────────────────────────────────────────────────────

export interface MetronomeOptions {
  bpm: number;
  /** Beats per bar. */
  beats: number;
  /** Subdivisions per beat to click. 1 = beats only, 2 = eighths, 4 = sixteenths. */
  subdivision?: number;
  /** Accent the first beat of the bar. */
  accentDownbeat?: boolean;
  onBeat?: (beat: number, bar: number) => void;
}

export class Metronome {
  private transport: Transport | null = null;
  private options: MetronomeOptions;

  constructor(options: MetronomeOptions) {
    this.options = options;
  }

  get isRunning(): boolean {
    return this.transport?.isRunning ?? false;
  }

  start() {
    if (this.transport) this.stop();
    const { bpm, beats, subdivision = 1, accentDownbeat = true } = this.options;
    this.transport = new Transport({
      bpm,
      stepsPerBar: beats * subdivision,
      stepsPerBeat: subdivision,
      onSchedule: ({ step, time }) => {
        const onBeat = step % subdivision === 0;
        const accent = accentDownbeat && step === 0;
        audioEngine.playDrum(accent ? 'clickAccent' : 'click', {
          time,
          velocity: accent ? 1 : onBeat ? 0.7 : 0.35,
        });
      },
      onStep: (step, bar) => {
        if (step % subdivision === 0) this.options.onBeat?.(step / subdivision, bar);
      },
    });
    this.transport.start();
  }

  setBpm(bpm: number) {
    this.options.bpm = bpm;
    this.transport?.update({ bpm });
  }

  update(partial: Partial<MetronomeOptions>) {
    const wasRunning = this.isRunning;
    this.options = { ...this.options, ...partial };
    if (wasRunning) this.start();
  }

  stop() {
    this.transport?.stop();
    this.transport = null;
  }
}

// ── Drum machine ──────────────────────────────────────────────────────────

export interface DrumLoopTrack {
  voice: string;
  hits: number[];
}

export interface DrumLoopOptions {
  bpm: number;
  steps: number;
  tracks: DrumLoopTrack[];
  swing?: number;
  onStep?: (step: number) => void;
}

/** Loop a 16-step drum pattern until stopped. */
export class DrumLoop {
  private transport: Transport | null = null;
  private options: DrumLoopOptions;

  constructor(options: DrumLoopOptions) {
    this.options = options;
  }

  get isRunning(): boolean {
    return this.transport?.isRunning ?? false;
  }

  start() {
    if (this.transport) this.stop();
    const { bpm, steps, swing = 0 } = this.options;
    this.transport = new Transport({
      bpm,
      stepsPerBar: steps,
      stepsPerBeat: steps / 4,
      swing,
      onSchedule: ({ step, time }) => {
        this.options.tracks.forEach((track) => {
          if (track.hits.includes(step)) {
            // Accenting the downbeat and the backbeat keeps a programmed loop
            // from sounding like a machine gun.
            const velocity = step % 4 === 0 ? 1 : step % 2 === 0 ? 0.8 : 0.62;
            audioEngine.playDrum(track.voice, { time, velocity });
          }
        });
      },
      onStep: (step) => this.options.onStep?.(step),
    });
    this.transport.start();
  }

  update(partial: Partial<DrumLoopOptions>) {
    const wasRunning = this.isRunning;
    this.options = { ...this.options, ...partial };
    if (wasRunning) this.start();
  }

  stop() {
    this.transport?.stop();
    this.transport = null;
  }
}
