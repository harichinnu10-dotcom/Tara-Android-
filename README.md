# TARA Android

TARA (Postal Research, Guidance & Management Assistant) — Android companion project for the G2 – Mails workspace.

## Status

This repository is being set up. The initial commit only documents the project; it is not yet a complete Android app.

## Planned components

- Android app shell with English and Telugu voice interaction
- G2 – Mails workspace and departmental workflows
- Supabase-backed sync (credentials must be configured securely)
- Optional backend service deployed on Render
- AI provider integration using an officially supported authentication/API method

## Important

A ChatGPT subscription is not an unlimited API credential. Do not embed API keys, Supabase service-role keys, or other secrets in the Android app or commit them to GitHub.

## Next steps

1. Add the Android app source and build configuration.
2. Add the backend service and Render deployment configuration.
3. Configure Supabase URL and public anon key through environment/app configuration; keep service-role secrets server-side.
4. Build and test the APK on a real Android device.
