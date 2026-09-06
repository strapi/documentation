/* The chief (anchorage) hand prints small-caps with an open set (0.06em);
   measure her claim the way she prints, not as a lowercase line. */
const fs = require('fs');
const F = 'deadreckoning.js';
let s = fs.readFileSync(F, 'utf8');
const from = `    const w = textW(t, fs, '', 0.2) + 5, h = fs + 3.4;
    const s = I.mark.sz * Z;`;
const to = `    const chiefHand = I.mark.kind === 'anchorage';
    const w = (chiefHand ? textW(t.toUpperCase(), fs, '', 0.06 * fs) * 0.92
                         : textW(t, fs, '', 0.2)) + 5, h = fs + 3.4;
    const s = I.mark.sz * Z;`;
if (!s.includes(from)) { console.error('MISS: chief width'); process.exit(1); }
s = s.split(from).join(to);
fs.writeFileSync(F, s);
console.log('ok: chief labels measured as small-caps');
