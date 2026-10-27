# Theme icon gallery

The Theme page (`/themes/rose-punk#icons`) shows the current Rose Punk desktop and
server icons. The searchable gallery uses the existing SVG artwork directly,
with visible application names and lazy loading. Clicking a card copies its SVG
markup as plain text. The artwork shrinks and fades into a drawn checkmark after
the clipboard write succeeds, then returns after 1.8 seconds. Reduced motion
preferences disable the transition. Copy failures are announced without showing
a success checkmark.
It follows the site's light/dark theme and has localized search and result copy.

## Refresh the collection

From the type.hk checkout, pass the local Tijpfiles / Chezmoi source checkout:

```sh
python3 scripts/sync-theme-icons.py /path/to/chezmoi
```

The sync script reads `scripts/icons/catalog.json`, shell entries in
`scripts/icons/command-icons.json`, and `scripts/icons/homepage.json`,
then copies the managed desktop and Homepage SVG exports into
`public/rose-punk-icons/`. Desktop entries take precedence for shared identities.
The active catalogues define the collection; retired artwork and historical
review variants are not included.

`EXCLUDED` in the script omits Notjik, Bartjik, Runtjik, Tjikup, Mailtjik and
Greetjik. Those custom application
identities belong on `/os`. New shared catalogue entries are picked up on refresh.
The current gallery contains 112 unique icons. The same refresh also copies the
six transparent primary app icons to `public/os-icons/` for tjikOS. Shared dark
tiles are rejected before any export changes.

`src/lib/content/rose-punk-icons.json` is the generated presentation list.
`public/rose-punk-icons/manifest.json` records source paths, hashes and attribution
from the source catalogues. App identities and trademarks remain with their owners.
SVG exports are copied byte-for-byte; the sync validates them and does not rebuild
or modify source artwork. Existing icon credits are retained; the source
repository has additional upstream attribution in `scripts/icons/provenance.json`
and `scripts/icons/homepage-upstream/`.
