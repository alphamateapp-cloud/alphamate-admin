# Alpha Mate Admin — cleaned source package

## What was changed
- Removed hard-coded sample users, live rooms, agencies, hosts, coin seller records, moderators, reels, support tickets, gift catalog items and staff directory entries from the relevant source modules.
- Dashboard demo metrics/activity/agency leaderboard arrays are now empty; no fabricated user counts are shown from those arrays.
- Initial coin-bank figures are zero instead of seeded demo balances.
- Added `config/firestore-collections.template.json` for the owner to fill with the exact existing Firestore collection and field names.
- Existing app styling, navigation, login gate, backend health endpoint, domain/deployment configuration and logo are retained.

## Important integration status
This is a mock-data cleanup and configuration-preparation pass, NOT a completed Firestore integration. Most management modules still use local component state for editing and must be connected to authenticated backend endpoints before any action can affect real app records. Do not use coin, wallet, moderation, agency or account actions against production until secure server-side validation, authorization, audit logging and transactional ledger handling are implemented and tested.

## Firestore configuration to provide
Fill `config/firestore-collections.template.json` with the exact collection names and field names from the existing Alpha Mate Firestore database. Do not guess collection names.

## Firebase service account
Do NOT commit a Firebase service-account JSON or private key into this repository or ZIP. Add the entire service-account JSON securely as the AppDeploy secret named `FIREBASE_SERVICE_ACCOUNT_JSON`. Keep it out of GitHub and frontend environment variables.

## Build
Run `npm install` then `npm run build`. This environment did not complete a dependency install, so a fresh independent build confirmation is still required.
