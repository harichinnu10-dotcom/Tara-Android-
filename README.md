# TARA Android

TARA (Postal Research, Guidance & Management Assistant) — Android companion project for the G2 – Mails workspace.

## Current implementation status

- [x] GitHub repository write access verified
- [x] Capacitor project configuration added
- [x] Mobile-first TARA starter screen added
- [x] English/Telugu text-to-speech and optional browser speech-recognition hooks added
- [x] Render Blueprint and Express health endpoint added
- [ ] Existing Electron desktop features ported to Android
- [ ] AI provider route and authentication
- [ ] Supabase authentication and data sync
- [ ] APK built and tested on a physical device

The mobile UI currently is a **starter shell**, not a complete port of the desktop app. The supplied Electron project uses `window.tara.invoke` and Node/Electron APIs; those need a proper Android-compatible service layer before desktop functions will work.

## Build a debug APK with GitHub Actions

1. Open the repository and select the **Actions** tab.
2. Select **Build TARA Android APK**.
3. Tap **Run workflow** on branch `main`.
4. When the run succeeds, open that run and download the `TARA-debug-apk` artifact. The artifact is a test/debug APK, not a Play Store release build.

The workflow generates the native Android project during CI. It does not yet include the original Electron-only integrations.

## Deploy the backend to Render

1. In Render, choose **New → Blueprint** and select this repository.
2. Render reads `render.yaml` and deploys the `tara-api` service from `backend/`.
3. After deployment, open `https://YOUR-SERVICE.onrender.com/health`. A healthy response contains `"ok": true`.
4. Update `www/config.js` with the actual HTTPS service URL, without a trailing slash.
5. Commit the updated configuration. Do not add secrets to `www/config.js`.

## Build the Android project

Requirements: Node.js 20 or newer and Android Studio with an Android SDK installed.

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio, allow Gradle sync, then select **Build → Build APK(s)**. This builds the current starter shell only; it does not mean the desktop integrations are ported.

## Google Gemini AI setup

TARA supports Google Gemini through the backend. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey), then add it in Render as an environment variable named `GEMINI_API_KEY`. Keep the key on Render only; never put it in Android/web files or commit it to GitHub.

Optional Render variables:
- `TARA_AI_PROVIDER=gemini` (select Gemini explicitly; if omitted, Gemini is preferred when a Gemini key exists)
- `GEMINI_MODEL=gemini-2.5-flash` (optional model override)

After saving the environment variable, redeploy the Render service and test `/health`, then submit a test question in TARA. The API key may be subject to Google AI Studio usage limits, model availability, and billing/quota rules. A Google/Gemini subscription is not the same as API access.

## Security and AI

- Never commit OpenAI/API keys, Supabase service-role keys, passwords, or private departmental data.
- Keep privileged keys on the backend in Render environment variables.
- A ChatGPT subscription is not a general-purpose API key. AI must use a supported authentication/API integration; subscription sharing cannot be assumed to work or be unlimited.
- Do not connect live departmental data until authentication, authorization, and access controls have been implemented and tested.

## Next development milestone

Port the original Electron functions into Android-safe modules: document import/export using Android file pickers, a secure AI backend route, and authenticated Supabase sync. Then test on-device before enabling operational workflows.
