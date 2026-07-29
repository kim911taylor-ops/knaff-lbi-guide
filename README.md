# The Knaff Guide 1.5 Beta

A polished, mobile-first Long Beach Island companion centered on Surf City, NJ 08008.

## Major additions
- Surf City weather clearly labeled for ZIP 08008
- Next upcoming high and low tides
- Ocean water temperature and wave height
- Sunrise and sunset
- LBI Locals 2026 free-concert schedule
- Chamber featured events and full event calendar
- Favorites saved on each phone
- Dark mode
- Improved search and tabs
- Installable web-app manifest
- Easy-to-edit JSON data files

## Deploy through GitHub
Upload all files and folders in this package to the ROOT of the existing GitHub repository.
Choose to replace files with the same names and commit to `main`.
Netlify should deploy automatically.

## Important
Because this version includes a new service worker, after Netlify says Published:
1. Open the site.
2. Refresh once with Command + Shift + R.
3. If an older version remains, close the browser tab and reopen the site.

## Update content
- Places: `data/places.json`
- Concert series: `data/concerts.json`
- Event links and weekly reminders: `data/events.json`
