# Khadijah & Qutubuddin Invitation

Static, mobile-first invitation website ready for Cloudflare Pages, GitHub Pages, Netlify, or any basic web host.

## Files
- `index.html` — invitation website
- `styles.css` — complete design and animations
- `script.js` — envelope opening, music, countdown, guest names, calendar download
- `generate.html` — personalized guest-link generator
- `assets/logo.jpeg` — supplied logo
- `assets/invitation-music.m4a` — audio extracted from the supplied tune

## Personalized links
Open `generate.html`, enter a guest name, and copy the generated link.

Manual format:
`https://your-domain.com/?g=Guest-Name`

The website also recognizes `?guest=` and `?name=`.

## Deployment on Cloudflare Pages
Upload this entire folder to a GitHub repository, then connect it to Cloudflare Pages.
- Framework preset: None
- Build command: leave blank
- Build output directory: `/`

## Calendar note
The supplied start time is 1:00 PM. Since no ending time was provided, the calendar file currently uses a one-hour placeholder duration. Change `DTEND` in `script.js` when the ending time is confirmed.
