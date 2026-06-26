Hammerfest Driver iPhone app package

How to use on iPhone:
1. Upload this folder to a normal HTTPS host, for example Netlify, Vercel, Cloudflare Pages, GitHub Pages, or your own server.
2. Open the public HTTPS URL in Safari on the iPhone.
3. Tap Share -> Add to Home Screen.
4. Open it from the Home Screen icon, not from Files.

Why this is needed:
iPhone does not treat loose .html files as installable apps. A PWA needs to be served from a website, preferably HTTPS, with index.html, manifest.webmanifest, and service-worker.js.

Notes:
- The app still uses the same Supabase backend from your original driver.html.
- Notifications in this version work while the app is open. True background push notifications on iPhone require a server-side push setup, not just a static HTML/PWA package.
