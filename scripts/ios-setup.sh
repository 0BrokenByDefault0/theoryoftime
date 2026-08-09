#!/usr/bin/env bash
#
# One-command iOS setup.
#
# Run this from the repo root on a Mac. It installs dependencies, generates the
# native Xcode project, points Xcode at your Node install, and opens the
# workspace — so there is never a reason to create a project in Xcode by hand.
#
#   ./scripts/ios-setup.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '\033[33m!\033[0m %s\n' "$1"; }
die()  { printf '\033[31m✗\033[0m %s\n' "$1" >&2; exit 1; }

bold "Theory of Time — iOS setup"
echo

# ── Preflight ─────────────────────────────────────────────────────────────
[[ "$(uname)" == "Darwin" ]] || die "This script needs macOS. On any other OS, use EAS Build instead — see TROUBLESHOOTING.md."

command -v node >/dev/null 2>&1 || die "Node is not installed. Install it from https://nodejs.org or via 'brew install node'."
ok "node $(node --version)"

command -v xcodebuild >/dev/null 2>&1 || die "Xcode is not installed, or the command line tools are not selected. Install Xcode from the App Store, then run: sudo xcode-select -s /Applications/Xcode.app"
ok "$(xcodebuild -version | head -1)"

if ! command -v pod >/dev/null 2>&1; then
  warn "CocoaPods not found. Installing via Homebrew…"
  command -v brew >/dev/null 2>&1 || die "Homebrew not found. Install it from https://brew.sh, then re-run this script."
  brew install cocoapods
fi
ok "CocoaPods $(pod --version)"
echo

# ── Dependencies ──────────────────────────────────────────────────────────
bold "Installing JavaScript dependencies…"
npm install
ok "Dependencies installed"
echo

# ── Native project ────────────────────────────────────────────────────────
bold "Generating the native Xcode project…"
# --clean guarantees the project matches app.json rather than an older run.
npx expo prebuild --platform ios --clean
ok "Generated ios/"
echo

# ── Xcode's PATH problem ──────────────────────────────────────────────────
# Xcode does not inherit the shell environment, so a Node installed via nvm,
# asdf or Homebrew is invisible to the build scripts. This is the single most
# common cause of "Command PhaseScriptExecution failed".
echo "export NODE_BINARY=$(command -v node)" > ios/.xcode.env.local
ok "Pointed Xcode at $(command -v node)"
echo

# ── Open ──────────────────────────────────────────────────────────────────
WORKSPACE=$(find ios -maxdepth 1 -name '*.xcworkspace' | head -1)
[[ -n "$WORKSPACE" ]] || die "No .xcworkspace was generated. Check the prebuild output above for errors."

bold "Opening $WORKSPACE"
open "$WORKSPACE"
echo
ok "Done."
echo
bold "Next, inside Xcode:"
cat <<'STEPS'
  1. Select the "TheoryofTime" target (blue icon, top of the left sidebar).
  2. Signing & Capabilities → tick "Automatically manage signing" → pick your Team.
     (Add a free Apple ID first under Xcode → Settings → Accounts.)
  3. Product → Scheme → Edit Scheme → Run → Build Configuration → Release.
  4. Pick your iPhone from the device dropdown at the top, then press Cmd-R.

On the phone, the first launch needs two things:
  • Settings → Privacy & Security → Developer Mode → On (reboots the phone)
  • Settings → General → VPN & Device Management → your Apple ID → Trust

Do NOT create a new project in Xcode. This script generates the real one.
STEPS
