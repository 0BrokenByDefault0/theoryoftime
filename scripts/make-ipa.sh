#!/usr/bin/env bash
#
# Build a standalone .ipa for sideloading.
#
#   ./scripts/make-ipa.sh              # unsigned — best for AltStore / Sideloadly
#   ./scripts/make-ipa.sh --signed     # signed with your development team
#
# Sideloading tools re-sign the archive with your own Apple ID before
# installing, so the signature on the file they are given does not matter.
# Building unsigned is therefore both simpler and more reliable: it needs no
# certificates, no provisioning profile, and no paid developer account.
#
# The result lands in build/TheoryofTime.ipa.
set -euo pipefail

cd "$(dirname "$0")/.."

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$1"; }
die()  { printf '\033[31m✗\033[0m %s\n' "$1" >&2; exit 1; }

SIGNED=0
[[ "${1:-}" == "--signed" ]] && SIGNED=1

[[ "$(uname)" == "Darwin" ]] || die "Needs macOS. On another OS use: eas build --platform ios --profile device"
command -v xcodebuild >/dev/null 2>&1 || die "Xcode is not installed or its command line tools are not selected."

# The native project is generated, not committed, so create it if absent.
if [[ ! -d ios ]]; then
  bold "No ios/ directory — generating it first…"
  npx expo prebuild --platform ios
  echo "export NODE_BINARY=$(command -v node)" > ios/.xcode.env.local
fi

WORKSPACE=$(find ios -maxdepth 1 -name '*.xcworkspace' | head -1)
[[ -n "$WORKSPACE" ]] || die "No .xcworkspace in ios/. Run ./scripts/ios-setup.sh first."
SCHEME=$(basename "$WORKSPACE" .xcworkspace)

ARCHIVE="build/$SCHEME.xcarchive"
rm -rf build
mkdir -p build

bold "Archiving $SCHEME (Release)…"
if [[ $SIGNED -eq 1 ]]; then
  xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE" \
    -quiet
else
  # Skipping code signing avoids needing a distribution certificate, which
  # free Apple accounts cannot issue at all.
  xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    -quiet
fi
ok "Archived"

APP="$ARCHIVE/Products/Applications/$SCHEME.app"
[[ -d "$APP" ]] || die "Archive produced no .app at $APP"

# An .ipa is a zip containing the .app inside a directory named Payload.
bold "Packaging .ipa…"
rm -rf build/Payload
mkdir -p build/Payload
cp -R "$APP" build/Payload/
( cd build && zip -qry "$SCHEME.ipa" Payload )
rm -rf build/Payload
ok "build/$SCHEME.ipa"

SIZE=$(du -h "build/$SCHEME.ipa" | cut -f1)
echo
bold "Done — $SIZE, $([[ $SIGNED -eq 1 ]] && echo 'signed' || echo 'unsigned')"
cat <<'NEXT'

To install it:
  • Sideloadly — drag the .ipa in, enter your Apple ID, hit Start.
  • AltStore    — AltServer > Install .ipa, or put it in your AltStore library.

Both re-sign with your own Apple ID, so an unsigned archive is fine.

A free Apple ID gives a 7-day signature. AltStore refreshes apps in the
background over Wi-Fi while AltServer is running, which handles that for you.
NEXT
