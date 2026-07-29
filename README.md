# The Knaff Guide 1.0

A mobile-first Long Beach Island guide for family, friends, and guests.

## Fastest Netlify test
1. Download and unzip this package.
2. In Netlify, open the existing `knaff-lbi-guide` site.
3. Go to **Deploys** and drag the complete `the-knaff-guide-1.0` folder into the deploy area.
4. Live weather, tides, and ocean conditions may take a few seconds after the deploy completes.

## Put it on GitHub
1. Create a new GitHub repository named `the-knaff-guide`.
2. Choose **Add file → Upload files**.
3. Upload the CONTENTS of this folder (index.html should be at the repository root).
4. Commit the files.
5. In Netlify: **Site configuration → Build & deploy → Link repository**, then choose the repository.
6. Build command: leave blank. Publish directory: `.`. Functions directory is read from `netlify.toml`.

## Update places
Edit `data/places.json`. Copy an existing object, change the values, and keep commas between objects.

Badge choices:
- `"pick": true` gives a Knaff Pick badge.
- `"local": true` gives a Local Favorite badge.

## Update concerts
Edit `data/concerts.json`. The app deliberately links to current schedules because performers and cancellations change.

## Live data
- Weather: National Weather Service API for Surf City
- Tides: NOAA station 8533615, Barnegat Inlet
- Water temperature and waves: NOAA buoy 44091 near Barnegat Light

No paid API key is required.

## Version 1.01 tide correction

The tide panel now ignores tide events that already happened and displays the
next upcoming high tide and next upcoming low tide, using NOAA predictions
covering today and the following two days.
