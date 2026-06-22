# CrimsonSync: Next-Gen Blood Donation Network

CrimsonSync is a secure, centralized blood donation platform frontend for coordinating donors, recipients, hospitals, and blood banks. It preserves the original clean white/crimson visual identity while expanding the static homepage into a production-ready vanilla HTML/CSS/JavaScript interface.

## What is included

- Role-based signup for Donor, Hospital, Recipient, and Blood Bank accounts.
- Separate verification step after signup with ID/license/document upload placeholders.
- Login, logout, forgot password, reset password, session persistence, and protected frontend routes.
- Role-specific dashboards:
  - Donor: eligibility, appointments, donation history, reward points, badges, leaderboard rank, nearby centers, approved requests, profile summary.
  - Hospital: create requests, inventory view, request tracking, donor matching, urgent alerts, analytics cards.
  - Recipient: submit requests, track status, matched donor/hospital information, verification state, request history, saved care locations.
  - Blood Bank: inventory, verification queue, approve/deny placeholders, donor matching, emergency queue, stock analytics, chat management.
- Request system with create, accept, decline, fulfill, cancel-ready status actions, history, details modal, urgency tags, compatibility hints, and status timelines.
- Secure healthcare messaging UI that only appears for approved/accepted request threads.
- Leaderboard and badge progress UI with professional impact ranking.
- Editable profile page with notification/privacy settings and upload placeholders.
- Light/dark theme support using CSS variables and localStorage persistence.
- Responsive mobile-first layout with mobile navigation, accessible controls, toasts, empty states, loading shell, skeleton-ready styles, and confirmation/detail modals.
- Mock API layer and configuration placeholders for later Django, FastAPI, MongoDB, upload, and websocket integration.

## Demo accounts

Use any of these with password `demo123`:

| Role | Email |
| --- | --- |
| Donor | `donor@crimsonsync.test` |
| Hospital | `hospital@crimsonsync.test` |
| Recipient | `recipient@crimsonsync.test` |
| Blood Bank | `bloodbank@crimsonsync.test` |

## Run locally

No framework or build step is required.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser.

Because the app uses ES modules, open it through a local server instead of directly as a `file://` URL.

## Environment variables

Copy `.env.example` and wire these values into `window.CRIMSONSYNC_ENV` or a future build tool when backend services are available.

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Display/application name. |
| `API_BASE_URL` | Future REST API base URL for Django/FastAPI services. |
| `AUTH_TOKEN_KEY` | localStorage key for auth token persistence. |
| `UPLOAD_ENDPOINT` | Future document/profile upload endpoint. |
| `WEBSOCKET_URL` | Future realtime chat websocket endpoint. |
| `DEFAULT_THEME` | Initial theme: `light`, `dark`, or future `system`. |

## Project structure

```text
index.html                 # Vanilla app shell
css/style.css              # CrimsonSync design system, responsive layout, themes
js/
  api/client.js            # API endpoint map and fetch/websocket placeholders
  config/appConfig.js      # Frontend runtime config and route metadata
  data/mockData.js         # Mock users, requests, chats, badges, inventory
  services/store.js        # localStorage-backed auth/session/app state
  utils/helpers.js         # Formatting, validation, compatibility helpers
  components/              # Component folders kept for easy React migration
  context/ hooks/ routes/  # Reserved frontend architecture boundaries
assets/                    # Static assets placeholder
.env.example               # Backend integration configuration template
```

Legacy `loginpage/`, `signuppage/`, and `forgotpassword/` URLs redirect into the new single-page app routes for compatibility.

## Backend integration notes

The current frontend is mock-data only. Later backend work can replace `js/services/store.js` calls with `js/api/client.js` requests while keeping the same UI routes and component boundaries.

Suggested mapping:

- Auth: `endpoints.auth.login`, `signup`, `verify`, `forgotPassword`, `resetPassword`.
- Requests: `endpoints.requests` for create/update/history/status timelines.
- Chat: `endpoints.chat` plus `createRealtimePlaceholder()` websocket replacement.
- Uploads: `endpoints.users.uploadDocument` for profile pictures and verification documents.
- Inventory/verifications: `endpoints.inventory` and `endpoints.verifications` for hospital/blood bank workflows.

## Quality checks

Current repo has no package manager, bundler, linter, or pre-commit hooks. Syntax can be checked with:

```bash
node --check js/main.js
node --check js/services/store.js
node --check js/data/mockData.js
node --check js/api/client.js
node --check js/config/appConfig.js
node --check js/utils/helpers.js
```
