# What the backup files in this build actually are

Written 2026-09-07 because the names mislead, and a restore point you cannot
trust is worse than none.

- **`*.gs.bak`** — the TRUE pre-round restore point, taken at 10:50 before the
  portal round began. Restore from these to get the build as it stood before
  The Golden Shore joined the crossing network.
- **`*.r19.bak`** — a MID-ROUND snapshot from 11:21. These already contain the
  new crossings. They are useful for bisecting within the round; they are not
  a way back to before it.
- `js/crossings.js` and the CHANGELOG have no `.r19.bak` at all, being new in
  that round, which is why the round's own claim of a complete snapshot was
  technically true and practically misleading.
