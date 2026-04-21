# Waitlist

Stores waitlist configuration. Registrations are captured via Formspree.

## Setup (one-time, ~5 min)

1. Go to [formspree.io](https://formspree.io) and create a free account (50 submissions/month free)
2. Create a new form — set the notification email to `thomasgavin777@gmail.com`
3. Copy the form ID (8-char string, e.g. `xabcd1234`)
4. In `landing/index.html`, find the line:
   ```js
   const WAITLIST_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
   Replace `YOUR_FORM_ID` with your actual form ID.
5. Push the change — the form will go live immediately.

## Exporting registrations

From the Formspree dashboard, you can export all submissions as CSV and drop it here as `registrations.csv` for a snapshot record alongside the codebase.
