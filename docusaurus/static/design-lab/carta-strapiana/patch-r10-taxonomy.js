/* R10 taxonomy law: provinces and per-isle sections come from taxonomy.json,
   never content.json's collapsed section field; "More pages" is banned. */
const fs = require('fs');
const F = 'deadreckoning.js';
let s = fs.readFileSync(F, 'utf8');
let n = 0;
function sub(from, to, label) {
  if (!s.includes(from)) { console.error('MISS:', label); process.exitCode = 1; return; }
  s = s.split(from).join(to); n++;
  console.log('ok:', label);
}

sub(
`  const [graph, communities, content, prov, register] = await Promise.all([
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('content.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    fetch('register.json').then(r => r.json())
  ]);
  world.prov = prov;
  world.register = register;`,
`  const [graph, communities, content, prov, register, taxonomy] = await Promise.all([
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('content.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    fetch('register.json').then(r => r.json()),
    fetch('taxonomy.json').then(r => r.json())
  ]);
  world.prov = prov;
  world.register = register;
  world.taxonomy = taxonomy;`,
  'fetch taxonomy.json');

sub(
`     smaller one across open water. A PROVINCE is an official section of
     the docs themselves - product + section straight out of content.json,
     and no other name is ever lettered on the ground. Provinces are packed`,
`     smaller one across open water. A PROVINCE is an official section of
     the docs themselves - product + section straight out of taxonomy.json,
     the section map built from the repo's own sidebars.js (path-inherited
     for the pages the sidebar does not carry), so no page falls into a
     nameless bucket and no other name is ever lettered on the ground.
     Provinces are packed`,
  'comment: taxonomy source');

sub(
`          'Plugins development', 'TypeScript', 'AI', 'Command Line Interface', 'Upgrades', 'More pages'],`,
`          'Plugins development', 'TypeScript', 'AI', 'Command Line Interface', 'Upgrades'],`,
  'SECTION_LAW: drop the banned bucket');

sub(
`    const pg = content.pages[slug];
    const sec = pg.section || 'More pages';
    const key = pg.product + '|' + sec;`,
`    const pg = content.pages[slug];
    const tx = taxonomy[slug];
    const sec = tx && tx.section;     /* the taxonomy is total over the 290 */
    if (!sec) continue;               /* a slug the taxonomy cannot name earns no ground */
    const key = pg.product + '|' + sec;`,
  'province source = taxonomy');

sub(
`    communities = world.communities, of = world.commOf, prov = world.prov;
  const slugs = Object.keys(content.pages);`,
`    communities = world.communities, of = world.commOf, prov = world.prov,
    taxonomy = world.taxonomy;
  const slugs = Object.keys(content.pages);`,
  'buildIslands: taxonomy in scope');

sub(
`      description: page.description || '', section: page.section, product: page.product,`,
`      description: page.description || '', section: (taxonomy[slug] || page).section, product: page.product,`,
  'isle.section = taxonomy section');

fs.writeFileSync(F, s);
console.log('patches applied:', n);
