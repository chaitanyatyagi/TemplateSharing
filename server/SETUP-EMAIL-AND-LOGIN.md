# Setup: Email delivery & Google login

There are **two separate credentials** here. They are often confused, but they
are unrelated systems:

| Feature | Uses | Credential |
|---|---|---|
| **Sending emails** (purchase confirmation + template) | Gmail SMTP via nodemailer | a Gmail **App Password** |
| **Google login** | Firebase Authentication | Firebase project config + server service-account key |

A Gmail App Password is **only** for email. It has nothing to do with login.

---

## 1. Enable email (Gmail App Password)

1. Use a Gmail account that will send the mail (a dedicated one is best).
2. Turn on **2-Step Verification**: https://myaccount.google.com/security
   (App Passwords are only available once 2FA is on.)
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Create a password (name it e.g. "SmartTemp Server"). You get a **16-character**
   code like `abcd efgh ijkl mnop`.
5. Put it in **`server/.env.development`** (and `.env.production` for prod):

   ```
   EMAIL_USER=youraddress@gmail.com
   EMAIL_PASS=abcdefghijklmnop      # the 16 chars, no spaces
   EMAIL_FROM=SmartTemp <youraddress@gmail.com>   # optional
   ```

6. Restart the server (`npm run dev`). Done — purchases now email the buyer with
   the template attached.

> If `EMAIL_USER`/`EMAIL_PASS` are left blank, the app still works normally; it
> just logs "skipping purchase email" and skips sending. Orders never fail
> because of email.

**File to edit:** `server/.env.development` → `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`.

---

## 2. Fix Google login

Login uses **Firebase**, not a Gmail App Password — so an expired App Password
would not affect it. Check these, in order:

1. **Firebase project is alive & Google provider enabled**
   - Firebase console → your project (`amit-dev-f8f1a`) → Authentication →
     Sign-in method → **Google** must be **Enabled**.
   - Authentication → Settings → **Authorized domains** must include
     `localhost` (for dev) and your production domain.

2. **Client web config** — `client/src/config/firebase-config.js`
   - The `apiKey`, `authDomain`, `projectId`, etc. must match the current
     Firebase project. If the project/app was recreated, copy the fresh config
     from Firebase console → Project settings → Your apps.

3. **Server service-account key** — `server/config/firebase-config.json`
   - The backend verifies login tokens with this key
     (`admin.auth().verifyIdToken`). If it was rotated/revoked, every login gets
     rejected with 401 "Invalid authorization token".
   - Regenerate: Firebase console → Project settings → **Service accounts** →
     **Generate new private key** → replace `server/config/firebase-config.json`.
     (This file is gitignored, so it never gets committed.)

4. **Clock skew** — if the server's system clock is far off, token verification
   fails. Make sure the machine time is correct.

**Files to edit:** `client/src/config/firebase-config.js` (web config) and/or
`server/config/firebase-config.json` (service-account key). No `.env` change is
needed for login.

---

## 3. Dummy templates for testing

- Sample deliverables live in **`server/sample-templates/`**
  (`.xlsx`, `.pdf`, `.docx`, `.csv`). Upload any of them via **Admin → Templates
  → Add** in the new "Deliverable File" box.
- To make **existing** templates downloadable without re-uploading, run:

  ```
  cd server
  node scripts/seedTemplateFiles.js
  ```

  It copies a sample file to `server/private/templates/` and attaches it to every
  template that has no deliverable yet. Safe to re-run (idempotent).

- Buyers download from **Profile → Purchased Items → Download**. Downloads are
  gated: only the purchaser (or admin, or free templates) can fetch the file.
