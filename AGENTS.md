# Working on Theory of Time

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any code. This project is on **Expo SDK 57 / React Native 0.86 / React
19.2** and several APIs moved recently.

## Layout

| Path | What lives there |
| --- | --- |
| `src/theory/` | Pure music theory. No React, no audio, no imports from anywhere else in `src/`. |
| `src/audio/` | Audio graph and playback. Depends on `theory`, nothing else. |
| `src/content/` | The curriculum **as data**. Lessons are declarative, not code. |
| `src/drills/` | Procedural question generation. |
| `src/state/` | Zustand store + SM-2 spaced repetition. |
| `src/components/` | `ui/` primitives, `music/` visualisations, `widgets/` lesson interactives. |
| `app/` | expo-router routes only. Screens compose; they do not contain theory. |

The dependency direction is one-way: `theory → audio → components → app`.
Keeping `src/theory` free of React is what makes it testable in plain Node.

## Adding curriculum content

Lessons are data. To add one, append a `Lesson` to a stage in
`src/content/lessons/*.ts`. A lesson is a list of cards, and a card is one of
`concept`, `interactive`, `quiz`, `ear`, or `build`.

To make a lesson interactive, give a card a `widget` from the `WidgetSpec`
union in `src/content/types.ts`. **Do not write a bespoke component for a
lesson.** If an idea needs a new kind of interaction, add a variant to
`WidgetSpec`, a component under `src/components/widgets/`, and one case in the
dispatcher at `src/components/widgets/index.tsx`. Every lesson and every Studio
tool then gets it for free.

Quiz and ear cards can carry `reviewId` + `reviewCategory`. That enrols the
fact in the spaced-repetition deck, and `src/drills/generator.ts` must be able
to rebuild a question from that id — see `questionFromReviewId`.

## Before you commit

```bash
npm run typecheck     # tsc, strict
npm run test:theory   # 93 assertions on the facts the app teaches
npx expo export --platform ios --output-dir /tmp/x   # catches import errors tsc misses
```

The theory test suite is not optional. It exists because a music theory app
that teaches something wrong is worse than one that ships nothing — two real
bugs (a minor-biased key estimator, a reversed Euclidean rhythm) were caught by
it during the initial build.

## Things that will bite you

- **Spelling matters.** Use `Note` objects (`letter`/`alter`/`octave`), not raw
  MIDI numbers, anywhere a note gets displayed. `fromMidi` is lossy.
- **Audio needs a dev build.** `react-native-audio-api` is native code; Expo Go
  will not run this app.
- **Release voices.** Anything that starts audio must stop it — screens call
  `audioEngine.stopAll()` on unmount, and the root layout does so on background.
- **`iosBackgroundMode` stays `false`** in the audio plugin config. Turning it
  on adds a background mode to `Info.plist` that App Store review will ask
  about, and this app does not need it.
- Native `ios/` and `android/` directories are generated, gitignored, and must
  not be committed.
