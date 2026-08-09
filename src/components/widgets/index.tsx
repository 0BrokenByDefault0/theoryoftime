import React from 'react';

import { WidgetSpec } from '../../content/types';
import {
  ChordDetectiveWidget,
  ChordSetWidget,
  ChordWidget,
  CircleWidget,
  FretboardWidget,
  IntervalLabWidget,
  ModeCompareWidget,
  PianoWidget,
  ProgressionWidget,
  ScaleWidget,
  StaffWidget,
  VoicingsWidget,
} from './TheoryWidgets';
import {
  ADSRWidget,
  CompressorWidget,
  DelayCalcWidget,
  DrumMachineWidget,
  EuclideanWidget,
  FilterWidget,
  FrequencyBandsWidget,
  MetronomeWidget,
  WaveformWidget,
} from './StudioWidgets';

/**
 * The widget dispatcher.
 *
 * Lesson content declares what it needs; this maps that declaration onto a
 * real, audible, interactive component. Adding a new kind of interaction means
 * adding one case here and one variant to `WidgetSpec`.
 */
export function Widget({ spec }: { spec: WidgetSpec }) {
  switch (spec.type) {
    case 'piano':
      return (
        <PianoWidget
          startMidi={spec.startMidi}
          octaves={spec.octaves}
          scale={spec.scale}
          chord={spec.chord}
          notes={spec.notes}
          labelMode={spec.labelMode}
          showDegrees={spec.showDegrees}
          caption={spec.caption}
        />
      );
    case 'scale':
      return <ScaleWidget tonic={spec.tonic} scaleId={spec.scaleId} caption={spec.caption} />;
    case 'chord':
      return (
        <ChordWidget symbol={spec.symbol} showStaff={spec.showStaff} caption={spec.caption} />
      );
    case 'chordSet':
      return <ChordSetWidget symbols={spec.symbols} caption={spec.caption} />;
    case 'progression':
      return (
        <ProgressionWidget
          romans={spec.romans}
          tonic={spec.tonic}
          mode={spec.mode}
          progressionId={spec.progressionId}
          caption={spec.caption}
        />
      );
    case 'circle':
      return <CircleWidget caption={spec.caption} />;
    case 'staff':
      return (
        <StaffWidget
          notes={spec.notes}
          clef={spec.clef}
          keyTonic={spec.keyTonic}
          keyMode={spec.keyMode}
          chord={spec.chord}
          caption={spec.caption}
        />
      );
    case 'fretboard':
      return <FretboardWidget scale={spec.scale} chord={spec.chord} caption={spec.caption} />;
    case 'intervalLab':
      return <IntervalLabWidget caption={spec.caption} />;
    case 'drumMachine':
      return <DrumMachineWidget patternId={spec.patternId} caption={spec.caption} />;
    case 'euclidean':
      return (
        <EuclideanWidget pulses={spec.pulses} steps={spec.steps} caption={spec.caption} />
      );
    case 'metronome':
      return <MetronomeWidget bpm={spec.bpm} beats={spec.beats} caption={spec.caption} />;
    case 'adsr':
      return <ADSRWidget caption={spec.caption} />;
    case 'filter':
      return <FilterWidget caption={spec.caption} />;
    case 'waveform':
      return <WaveformWidget caption={spec.caption} />;
    case 'compressor':
      return <CompressorWidget caption={spec.caption} />;
    case 'frequencyBands':
      return <FrequencyBandsWidget caption={spec.caption} />;
    case 'delayCalc':
      return <DelayCalcWidget bpm={spec.bpm} caption={spec.caption} />;
    case 'voicings':
      return <VoicingsWidget symbol={spec.symbol} caption={spec.caption} />;
    case 'modeCompare':
      return <ModeCompareWidget tonic={spec.tonic} caption={spec.caption} />;
    case 'chordDetective':
      return <ChordDetectiveWidget caption={spec.caption} />;
  }
}

export * from './TheoryWidgets';
export * from './StudioWidgets';
export * from './shared';
