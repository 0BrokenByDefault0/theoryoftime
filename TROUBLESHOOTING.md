# Troubleshooting the iOS build

Read this before fighting Xcode. **The cloud build path below avoids Xcode
entirely** and is the recommended way to get this on a phone.

---

## Read this first: never run `npm audit fix --force`

`npm install` prints a vulnerability summary and suggests `npm audit fix
--force`. **Do not run it.** On this project it downgrades Expo 57 to 53 and
React Native 0.86 to 0.72 — both major-version regressions — and the app stops
building entirely.

If you already ran it, recover with:

```bash
git checkout -- package.json package-lock.json
rm -rf node_modules
npm install
```

Both files are committed, so this restores the exact working versions.

Every advisory this project reports lives in **build tooling** — metro,
postcss, `@react-native-community/cli`, `xcode`. That code runs on your laptop
during a build and is never bundled into the app. The app makes no network
requests, runs no server, and stores nothing remotely, so the practical
exposure is nil. Every React Native project reports 15–25 of these.

The repo's `.npmrc` now suppresses the summary so it stops advertising a
destructive command. `npm audit` still works if you type it deliberately.

---

## The easy path: EAS Build (no Xcode)

Expo builds the app on their machines and hands you a QR code. You need a free
Expo account and an Apple ID. You do **not** need Xcode, CocoaPods, or a Mac.

```bash
npm install -g eas-cli
eas login
eas build:configure          # links the project to your Expo account

# Register the phone you want to install onto.
# Opens a page / QR code; open it ON THE PHONE and install the profile.
eas device:create

# Build it.
eas build --profile device --platform ios
```

When it finishes, EAS prints a QR code and a URL. **Open that URL on the
phone** in Safari and tap Install. The app appears on your home screen.

### Which profile to use

| Profile | What it produces | Installs on a phone? |
| --- | --- | --- |
| `device` | Standalone Release build | **Yes — use this one** |
| `development` | Dev client, needs Metro running | Yes, but needs your laptop |
| `simulator` | Simulator `.app` | **No** — Mac simulator only |
| `production` | App Store build | Via TestFlight only |

> A previous version of this repo documented `--profile development` with
> `simulator: true`, which produces a build that cannot be installed on a
> phone. That was wrong and is fixed; use `--profile device`.

### What EAS will ask you

- **"Generate a new Apple Distribution Certificate?"** → Yes.
- **"Generate a new Ad Hoc Provisioning Profile?"** → Yes.
- **Apple ID login** → yes, it needs this to create the signing assets. It
  stores credentials on Expo's servers unless you opt for local credentials.

A free Apple ID works for ad hoc builds, with the same 7-day expiry as Xcode
sideloading. A paid account ($99/yr) gets you a year and TestFlight.

---

## Getting an `.ipa` file

Which method applies depends on how you built. **Running the app from Xcode
with ⌘R does not produce an `.ipa`** — it installs an unpacked `.app` straight
onto the device. You have to archive it explicitly.

### From an EAS cloud build (easiest)

A cloud build already *is* an `.ipa`. Find it and download it:

```bash
eas build:list --platform ios --limit 5
eas build:view          # or open the build page URL it prints
```

The build page has a **Download** button. Note that `eas build:download` is for
simulator builds only — it will not fetch a device `.ipa`.

### From an EAS local build

Builds on your own Mac and writes the artefact wherever you point it:

```bash
eas build --platform ios --profile device --local --output ./TheoryofTime.ipa
```

### From Xcode

1. In the device dropdown at the top, select **Any iOS Device (arm64)**.
   Archive is greyed out while a simulator or a physical device is selected.
2. **Product → Archive.** The Organizer window opens when it finishes.
3. Select the archive → **Distribute App**.
4. Choose a method. **Custom → Release Testing** produces an ad hoc `.ipa`;
   **Custom → Debugging** produces a development one.
5. Export. You get a folder containing `TheoryofTime.ipa`.

> **Free Apple ID limitation.** Personal teams cannot issue distribution
> certificates, so ad hoc and App Store export will fail. Development export
> may work. If you need a reliable `.ipa`, use an EAS build or a paid developer
> account.

### The manual route

An `.ipa` is just a zip with the `.app` inside a folder named `Payload`. If you
already have a build in DerivedData:

```bash
cd ~/Library/Developer/Xcode/DerivedData/TheoryofTime-*/Build/Products/Release-iphoneos
mkdir -p Payload
cp -R TheoryofTime.app Payload/
zip -r TheoryofTime.ipa Payload
```

This is genuinely useful for sideloading tools, which re-sign the archive with
your own account anyway.

### An `.ipa` is not portable

This trips everyone up. An `.ipa` is signed for **specific devices** listed in
its provisioning profile. Handing the file to someone else does not work — iOS
refuses to install it on an unregistered device.

To get it onto other people's phones you need one of:

- **TestFlight** — the real answer for sharing. Requires a paid developer
  account, then `eas build --profile production` and `eas submit`.
- **Register their device** — add the UDID, then rebuild or use
  `eas build:resign`.
- **Sideloading tools** (AltStore, Sideloadly) — these re-sign the `.ipa` with
  the recipient's own Apple ID on their machine, which sidesteps the profile.

---

## If you insist on Xcode

Run `./scripts/ios-setup.sh` from the repo root. It handles everything below
that can be automated. The failures that remain, roughly in order of frequency:

### You are looking at a list of dates with an "Edit" button and a "+"

That is **Xcode's own blank app template**, not this project. It happens when
you open Xcode and choose *File → New → Project*.

Never create a project in Xcode for this app. There is no `ios/` folder in the
repo — the Xcode project does not exist until it is generated from the source:

```bash
./scripts/ios-setup.sh          # or: npx expo prebuild --platform ios --clean
```

That produces `ios/TheoryofTime.xcworkspace`, which is the only thing you
should ever open.

### "Command PhaseScriptExecution failed" / "env: node: No such file or directory"

**The single most common Expo/Xcode failure.** Xcode does not inherit your
shell's `PATH`, so if Node came from nvm, asdf, or Homebrew, Xcode cannot find
it. Fix it by telling Xcode where Node lives:

```bash
echo "export NODE_BINARY=$(which node)" > ios/.xcode.env.local
```

Then clean the build folder (⇧⌘K) and build again. `.xcode.env.local` is
gitignored by Expo's template, so it stays a local override.

### "No such module 'ExpoModulesCore'" or hundreds of missing headers

You opened `ios/TheoryofTime.xcodeproj` instead of
`ios/TheoryofTime.xcworkspace`. The `.xcodeproj` has none of the CocoaPods
dependencies linked. Close it and open the **workspace**.

### `pod install` fails, or `expo prebuild` fails at the pods step

CocoaPods installed via macOS's system Ruby breaks constantly. Install it
through Homebrew instead:

```bash
brew install cocoapods
cd ios && pod install --repo-update
```

If that still fails, clear the caches and retry:

```bash
rm -rf ios ~/Library/Caches/CocoaPods ~/.cocoapods/repos/trunk
npx expo prebuild --platform ios --clean
```

### "Failed to register bundle identifier" / "already in use"

`com.theoryoftime.app` is taken, or belongs to a different team. Change it in
`app.json` → `expo.ios.bundleIdentifier` to something unique like
`com.yourname.theoryoftime`, then regenerate:

```bash
npx expo prebuild --platform ios --clean
```

Change it in `app.json`, **not** in Xcode — prebuild overwrites the Xcode copy.

### "Unable to install… This app cannot be installed because its integrity could not be verified"

Two possible causes:

1. **Developer Mode is off.** iOS 16+: Settings → Privacy & Security →
   Developer Mode → On. The phone reboots.
2. **Certificate not trusted.** Settings → General → VPN & Device Management →
   your Apple ID → Trust.

### The app installs, launches, then dies immediately (or shows a red error screen)

You built the **Debug** configuration, which loads JavaScript from Metro over
the network. Either keep `npx expo start` running on the same Wi-Fi, or switch
to Release: Product → Scheme → Edit Scheme → Run → Build Configuration →
**Release**.

### Build succeeds but the screen is blank / white

Usually a Metro bundling failure that Xcode swallowed. Run the bundler by hand
to see the real error:

```bash
npx expo start --clear
```

### Sandbox / "Operation not permitted" during a build script

Newer Xcode versions enable user script sandboxing. In Xcode: select the
project → Build Settings → search "sandbox" → set **User Script Sandboxing** to
**No**.

### Everything is broken and you want a clean slate

```bash
rm -rf ios node_modules
npm install
npx expo prebuild --platform ios --clean
```

`ios/` is gitignored and fully regenerated, so deleting it is always safe.

---

## Sanity checks that do not need a Mac

If you want to confirm the app itself is sound before blaming it:

```bash
npm run typecheck     # strict TypeScript, should be silent
npm run test:theory   # should print: PASS — 93/93 checks passed
npx expo export --platform ios --output-dir /tmp/x   # should bundle ~1825 modules
```

All three pass in CI-like conditions on Linux. If they pass for you too, the
problem is in the native toolchain, not in the app code.
