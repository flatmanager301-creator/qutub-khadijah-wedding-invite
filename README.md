# Qutubuddin & Khadijah — Cinematic Wedding E‑Invite

A mobile-first wedding invitation for **17–18 January 2027** in Mandsaur.

## Included

- Cinematic royal-maroon, blush, ivory and antique-gold design
- Arabic opening: **بسم الله الرحمن الرحيم**
- Embossed blush envelope with a tactile swan wax-seal opening
- Dreamy arch/portal transition with refined, lightweight reveal animations
- Personalized guest/family greetings from unique links
- Per-guest attendee limit
- Optional invitation access for both days, 17 January only, or 18 January only
- Live wedding countdown
- Event timeline, Google Maps buttons and calendar downloads
- Blue dress code for 17 January and white dress code for 18 January
- Privacy-first ornamental sections with no couple photographs included
- Ultra-premium WhatsApp RSVP card with a **13 January 2027** deadline
- Optional RSVP logging and private guest photo/video uploads through Supabase
- Private guest-link studio with individual links, batch generation and CSV export
- Mobile quick-navigation dock
- Custom social-sharing preview image (`assets/og-card.jpg`)

There is no background music.

## Preview locally

The easiest option is to open `index.html`. For a more accurate browser preview, run a local server from this folder:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

To skip the envelope while reviewing the design, add `?preview=1`:

```text
http://localhost:8080/?preview=1
```

## Create personalized guest links

1. Open `link-generator.html`.
2. Enter the final deployed invitation URL.
3. Enter the guest/family name and maximum attendee count.
4. Select whether the guest is invited to both days, 17 January only, or 18 January only.
5. Generate, copy, preview, or send the link through WhatsApp.

For many guests, paste one guest per line in this format:

```text
Guest Name, Maximum Attendees, Guest Code, both/day1/day2
```

Example:

```text
Hatim Bhai & Family, 4, HATIM01, both
Ali Bhai, 2, ALI02, day1
Murtaza & Family, 5, MURTAZA03, day2
```

The guest information is encoded into the `g` query parameter and read locally by the invitation. This provides personalization, not identity verification. Do not place sensitive data in guest names or codes.

Keep `link-generator.html` private. You may remove it from the public deployment after generating your final links.

## Deploy on Cloudflare Pages

The project is static and has no build step.

1. Upload the **contents of this folder** to a GitHub repository. `index.html` must be at the repository root.
2. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Use:
   - Framework preset: `None`
   - Build command: leave blank, or use `exit 0`
   - Build output directory: `.`
5. Deploy.

After deployment, open the live `link-generator.html` only from your own device, enter the deployed invitation URL, and create the guest links.

### WhatsApp sharing preview

A custom preview card is included at `assets/og-card.jpg`. After your final domain is connected, replace this line in `index.html`:

```html
<meta property="og:image" content="assets/og-card.jpg" />
```

with the complete public address, for example:

```html
<meta property="og:image" content="https://invite.example.com/assets/og-card.jpg" />
```

This gives WhatsApp and other messaging apps the most reliable preview.

## Enable photo uploads and RSVP logging

The invitation, personalized links and WhatsApp RSVP work without a database. Supabase is only required for photo/video uploads and for keeping a copy of RSVP submissions.

1. Create a Supabase project.
2. In **SQL Editor**, run `supabase-setup.sql`.
3. In **Authentication → Providers**, enable **Anonymous Sign-Ins**.
4. Open **Project Settings → API** and copy the project URL and publishable/anon key.
5. Edit `config.js`:

```js
window.WEDDING_CONFIG = {
  enableSupabase: true,
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY",
  uploadBucket: "wedding-photos"
};
```

6. Redeploy the changed `config.js`.

Uploaded files are kept in a private `wedding-photos` bucket under each guest’s anonymous user folder. Guests can access only their own uploads. You can review all files and RSVP records from the Supabase dashboard.

## Important files

- `index.html` — invitation wording and page structure
- `styles.css` — cinematic design, envelope/portal animations and responsive layout
- `script.js` — personalization, opening sequence, scratch reveal, event filtering, countdown, RSVP, calendars, gallery and uploads
- `link-generator.html` — private personalized-link studio
- `config.js` — optional Supabase connection
- `supabase-setup.sql` — database, storage bucket and security policies
- `assets/og-card.jpg` — WhatsApp/social preview image
- `assets/` — swan artwork, icons and the privacy-safe social preview image

## Editing wedding details

Names, event wording, venue names, timings, map links and RSVP contact are in `index.html`. Calendar timings and the WhatsApp number are near the top of `script.js`.


## Premium spacing pass

This revision includes a full spacing and responsive-layout refinement across the opening, hero, event cards, RSVP form, gallery, uploads and mobile navigation.
