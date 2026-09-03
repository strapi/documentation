# -*- coding: utf-8 -*-
import io, sys

P = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/bold8/f1/'

def apply(path, pairs):
    with io.open(path, 'r', encoding='utf-8') as f:
        s = f.read()
    s = s.replace(u'\xa0', ' ').replace(u'\u202f', ' ')
    missing = []
    for old, new, *rest in pairs:
        cnt = s.count(old)
        exp = rest[0] if rest else 1
        if cnt != exp and (cnt != 0 or new not in s):
            missing.append((old[:70], cnt, exp))
        s = s.replace(old, new)
    with io.open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    return missing

js_pairs = [
("""/* TÉLÉ·ACHAT DOC — la documentation Strapi vendue comme en 1994.
   Tout chiffre affiché est mesuré (content.json / graph.json / provenance.json).
   Le théâtre (chyron, minuit, 36 15 DOC) est du décor et la notice le dit. */""",
"""/* SHOP·DOCS 24/7 — the Strapi documentation sold like it's 1994.
   Every number displayed is measured (content.json / graph.json / provenance.json).
   The theatre (chyron, midnight, 1-800-DOC-SHOP) is set dressing and the manual says so. */"""),
("/* ---------------- utilitaires ----------------", "/* ---------------- utilities ----------------"),
("'<p class=\"product-name\">INCIDENT TECHNIQUE</p><p class=\"product-tagline\">'",
 "'<p class=\"product-name\">TECHNICAL DIFFICULTIES</p><p class=\"product-tagline\">'"),
("g.product === 'cms' ? 'CHAÎNE CMS' : 'CHAÎNE CLOUD'", "g.product === 'cms' ? 'CMS CHANNEL' : 'CLOUD CHANNEL'"),
("(p.product === 'cms' ? 'CHAÎNE CMS' : 'CHAÎNE CLOUD')", "(p.product === 'cms' ? 'CMS CHANNEL' : 'CLOUD CHANNEL')"),
("'<span class=\"prog-count\">' + g.slugs.length + ' produits</span>'", "'<span class=\"prog-count\">' + g.slugs.length + ' products</span>'"),
("' mots</span>'", "' words</span>'", 2),
("var f = '« ' + esc(stripTitle(p.title)) + ' » — seulement ' + fmtInt(w) + ' mots';",
 "var f = '“' + esc(stripTitle(p.title)) + '” — only ' + fmtInt(w) + ' words';"),
("if (inb > 0) f += ' — déjà adopté par ' + inb + ' ' + plur(inb, 'page');",
 "if (inb > 0) f += ' — already adopted by ' + inb + ' ' + plur(inb, 'page');"),
("else f += ' — jamais encore cité, faites-vous plaisir';",
 "else f += ' — never yet cited, treat yourself';"),
("bits.push('APPELEZ MAINTENANT — 36 15 DOC');", "bits.push('CALL NOW — 1-800-DOC-SHOP');"),
("bits.push('IL NE RESTE QUE ' + uncitedCount + ' PAGES JAMAIS CITÉES — PROFITEZ-EN');",
 "bits.push('ONLY ' + uncitedCount + ' NEVER-CITED PAGES LEFT — WHILE STOCKS LAST');"),
("/* ---------------- notice (la clé en mots simples) ----------------", "/* ---------------- the manual (the plain words) ----------------"),
("""      '<p>Vous regardez la <b>vraie documentation de Strapi</b> — les 290 pages, ' +
      'texte intégral et intact — habillée en chaîne de téléachat des années 1990. ' +
      'Voici ce que chaque paillette veut dire, en mots simples :</p>' +""",
"""      '<p>You are watching the <b>real Strapi documentation</b> — all 290 pages, ' +
      'full text, untouched — dressed up as a 1990s home-shopping channel. ' +
      'Here is what every sparkle means, in plain words:</p>' +"""),
("'<dt><span class=\"swatch\" style=\"background:#ffd400\"></span>Le prix en mots</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#ffd400\"></span>The price in words</dt>'"),
("'<dd>« Seulement 627 mots ! » est le <b>nombre de mots réel</b> de la page, compté dans son contenu. La documentation, elle, coûte vraiment 0 €.</dd>'",
 "'<dd>“Only 627 words!” is the page’s <b>real word count</b>, measured in its content. The documentation itself really does cost $0.</dd>'"),
("'<dt><span class=\"swatch\" style=\"background:#d5002b\"></span>Les témoignages</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#d5002b\"></span>The testimonials</dt>'"),
("'<dd>Chaque citation est une <b>phrase authentique, mot pour mot</b>, tirée d’une page qui fait réellement un lien vers celle-ci. Le nom sous la citation est le titre de la page qui la recommande.</dd>'",
 "'<dd>Every quote is an <b>authentic, word-for-word sentence</b> taken from a page that genuinely links to this one. The name under the quote is the title of the page recommending it.</dd>'"),
("'<dt><span class=\"swatch\" style=\"background:#ffea70\"></span>« Il n’en reste que ' + uncitedCount + ' ! »</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#ffea70\"></span>“Only ' + uncitedCount + ' left!”</dt>'"),
("'<dd>' + uncitedCount + ' pages sur 290 ne sont <b>citées par aucune autre page</b> de la documentation. Ce sont elles, le « stock limité ». Un lien de votre part les sauverait.</dd>'",
 "'<dd>' + uncitedCount + ' pages out of 290 are <b>cited by no other page</b> of the documentation. They are the “limited stock”. One link from you would save them.</dd>'"),
("'<dt><span class=\"swatch\" style=\"background:#19c8ff\"></span>« Déjà adopté par N pages »</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#19c8ff\"></span>“Already adopted by N pages”</dt>'"),
("'<dd>Le nombre de pages de la documentation qui font un lien vers ce produit. Compté dans le graphe réel des 1 231 citations croisées.</dd>'",
 "'<dd>The number of documentation pages that link to this product. Counted in the real graph of 1 231 cross-citations.</dd>'"),
("'<dt><span class=\"swatch\" style=\"background:#4b1d8f\"></span>Le démonstrateur</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#4b1d8f\"></span>The demonstrator</dt>'"),
("'<dd>Les noms sont les <b>vrais auteurs et autrices</b> de la page, relevés dans l’historique git du dépôt. Les révisions, jours de suivi et retouches nocturnes sont comptés de la même façon.</dd>'",
 "'<dd>The names are the page’s <b>real authors</b>, read from the repository’s git history. Revisions, days of care and late-night touch-ups are counted the same way.</dd>'"),
("'<dt><span class=\"swatch\" style=\"background:#241d40\"></span>Les arguments « ✔ »</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#241d40\"></span>The “✔” selling points</dt>'"),
("'<dd>Tous mesurés : exemples de code, chapitres, liens sortants, ancienneté. Rien n’est inventé — seul l’enthousiasme est exporté de 1994.</dd>'",
 "'<dd>All measured: code examples, chapters, outbound links, age. Nothing is invented — only the enthusiasm is imported from 1994.</dd>'"),
("'<dt><span class=\"swatch\" style=\"background:#e4002b\"></span>Le compte à rebours et le 36 15 DOC</dt>'",
 "'<dt><span class=\"swatch\" style=\"background:#e4002b\"></span>The countdown and 1-800-DOC-SHOP</dt>'"),
("'<dd>Pur théâtre. L’offre expire à minuit puis revient à minuit une, comme toutes les offres exceptionnelles. Aucun Minitel n’a été blessé.</dd>'",
 "'<dd>Pure theatre. The offer ends at midnight, then starts again at one past midnight, like all exceptional offers. No rotary phone was harmed.</dd>'"),
("'<p class=\"notice-foot\">La partie « LA DÉMONSTRATION » de chaque fiche est la page de documentation complète, non modifiée. Elle se lit très bien, même sans les projecteurs.</p>'",
 "'<p class=\"notice-foot\">The “THE DEMONSTRATION” part of each listing is the complete, unmodified documentation page. It reads very well even without the studio lights.</p>'"),
("// horloge du plateau", "// studio clock"),
("// standard téléphonique", "// switchboard"),
("'<div class=\"sr-empty\">Nos conseillères n’ont rien trouvé — reformulez, elles restent en ligne.</div>'",
 "'<div class=\"sr-empty\">Our operators found nothing — rephrase, they are standing by.</div>'"),
("document.title = stripTitle(p.title) + ' — TÉLÉ·ACHAT DOC';", "document.title = stripTitle(p.title) + ' — SHOP·DOCS 24/7';"),
("document.title = 'Segment introuvable — TÉLÉ·ACHAT DOC';", "document.title = 'Segment not found — SHOP·DOCS 24/7';"),
("d.innerHTML = '<p class=\"seg-banner\">INCIDENT D’ANTENNE</p>' +", "d.innerHTML = '<p class=\"seg-banner\">BROADCAST INCIDENT</p>' +"),
("'<p class=\"product-name\">CE SEGMENT N’EST PAS AU CATALOGUE</p>'", "'<p class=\"product-name\">THIS SEGMENT IS NOT IN THE CATALOGUE</p>'"),
("""'<p class="product-tagline">' + esc(slug) + ' ne correspond à aucun de nos 290 produits. ' +
      'Notre standard (en haut de l’écran) reste ouvert, ou retrouvez ' +
      '<a href="#/cms/intro" style="color:var(--gold)">le début de l’émission</a>.</p>';""",
"""'<p class="product-tagline">' + esc(slug) + ' matches none of our 290 products. ' +
      'Our switchboard (top of the screen) is still open, or tune back in to ' +
      '<a href="#/cms/intro" style="color:var(--gold)">the start of the show</a>.</p>';"""),
("/* ---------------- témoignages ----------------", "/* ---------------- testimonials ----------------"),
("// ordre déterministe par graine", "// deterministic seeded order"),
("""      var epithet = seededPick(slug, i, [
        'la recommande dans ses propres colonnes',
        'lui fait un lien, en toute connaissance de cause',
        'la cite, mot pour mot, c’est vérifiable',
        'a franchi le pas et renvoie ses lecteurs ici',
        'en parle spontanément à ses visiteurs'
      ]);""",
"""      var epithet = seededPick(slug, i, [
        'recommends it in its own columns',
        'links to it, in full knowledge of the facts',
        'quotes it word for word, you can check',
        'took the plunge and sends its readers here',
        'brings it up to its visitors unprompted'
      ]);"""),
("      // aucune phrase extractible : on liste honnêtement les pages clientes",
 "      // no extractable sentence: honestly list the client pages"),
("/* ---------------- rendu du segment produit ----------------", "/* ---------------- product segment rendering ----------------"),
("    // -- fil d'émission", "    // -- show breadcrumb"),
("      'Émission <b>' +", "      'Show <b>' +"),
("+ '</b> — rayon ' +\n      esc(p.section) + ' — segment ' +", "+ '</b> — aisle ' +\n      esc(p.section) + ' — segment ' +"),
("    // -- vitrine", "    // -- showcase"),
("""    var banner = seededPick(slug, 1, [
      'OFFRE EXCEPTIONNELLE', 'EXCLUSIVITÉ TÉLÉ·ACHAT DOC', 'DÉMONSTRATION EN DIRECT',
      'SÉLECTION DU CATALOGUE', 'PRÉSENTATION SPÉCIALE', 'GRAND DÉBALLAGE'
    ]);""",
"""    var banner = seededPick(slug, 1, [
      'EXCEPTIONAL OFFER', 'A SHOP·DOCS 24/7 EXCLUSIVE', 'LIVE DEMONSTRATION',
      'CATALOGUE SELECTION', 'SPECIAL PRESENTATION', 'THE BIG UNBOXING'
    ]);"""),
("""    sc.appendChild(el('div', 'stamp', seededPick(slug, 2, [
      'PRIX CHOC', 'INCROYABLE !', 'DU JAMAIS VU', 'SENSATIONNEL', 'QUALITÉ PRO'
    ])));""",
"""    sc.appendChild(el('div', 'stamp', seededPick(slug, 2, [
      'PRICE SHOCK', 'INCREDIBLE!', 'NEVER SEEN BEFORE', 'SENSATIONAL', 'PRO QUALITY'
    ])));"""),
("    // arguments massue, tous mesurés", "    // knockout selling points, all measured"),
("args.push('<b>' + fmtInt(words) + ' ' + plur(words, 'mot') + '</b> de contenu véritable, sans supplément');",
 "args.push('<b>' + fmtInt(words) + ' ' + plur(words, 'word') + '</b> of genuine content, at no extra charge');"),
("if (codeN > 0) args.push('<b>' + codeN + ' ' + plur(codeN, 'exemple') + ' de code</b> OFFERT' + (codeN > 1 ? 'S' : '') + ' avec la page');",
 "if (codeN > 0) args.push('<b>' + codeN + ' code ' + plur(codeN, 'example') + '</b> thrown in FREE with the page');"),
("else args.push('modèle <b>100 % prose</b> — zéro ligne de code à entretenir');",
 "else args.push('a <b>100% prose</b> model — zero lines of code to maintain');"),
("if (chapters > 0) args.push('<b>' + chapters + ' ' + plur(chapters, 'chapitre') + '</b> pour ne jamais vous perdre');",
 "if (chapters > 0) args.push('<b>' + chapters + ' ' + plur(chapters, 'chapter') + '</b> so you never get lost');"),
("if (inb > 0) args.push('déjà <b>adopté par ' + inb + ' ' + plur(inb, 'page') + '</b> de la documentation');",
 "if (inb > 0) args.push('already <b>adopted by ' + inb + ' ' + plur(inb, 'page') + '</b> of the documentation');"),
("if (outN > 0) args.push('vous ouvre les portes de <b>' + outN + ' ' + plur(outN, 'page partenaire', 'pages partenaires') + '</b>');",
 "if (outN > 0) args.push('opens the door to <b>' + outN + ' partner ' + plur(outN, 'page') + '</b>');"),
("if (prov.commits) args.push('<b>' + prov.commits + ' ' + plur(prov.commits, 'révision') + ' qualité</b> à l’atelier depuis ' + (prov.first || '').slice(0, 4));",
 "if (prov.commits) args.push('<b>' + prov.commits + ' quality ' + plur(prov.commits, 'revision') + '</b> at the workshop since ' + (prov.first || '').slice(0, 4));"),
("if (prov.night > 0) args.push('dont <b>' + prov.night + ' ' + plur(prov.night, 'retouche') + ' en pleine nuit</b> — l’atelier ne dort jamais');",
 "if (prov.night > 0) args.push('including <b>' + prov.night + ' late-night ' + plur(prov.night, 'touch-up') + '</b> — the workshop never sleeps');"),
("    // badges mérite (mesurés)", "    // merit badges (measured)"),
("merits.appendChild(el('span', 'merit red', 'Nouveauté ' + prov.first.slice(0, 4)));",
 "merits.appendChild(el('span', 'merit red', 'New for ' + prov.first.slice(0, 4)));"),
("merits.appendChild(el('span', 'merit white', 'Grand classique · ' + fmtInt(prov.careDays) + ' jours de suivi'));",
 "merits.appendChild(el('span', 'merit white', 'All-time classic · ' + fmtInt(prov.careDays) + ' days of care'));"),
("merits.appendChild(el('span', 'merit gold', 'Best-seller · ' + inb + ' pages conquises'));",
 "merits.appendChild(el('span', 'merit gold', 'Best-seller · ' + inb + ' pages won over'));"),
("    // présentateur — vrais auteurs", "    // presenter — real authors"),
("pt.appendChild(el('div', 'presenter-name', 'Votre démonstrateur : ' + esc(prov.topAuthor)));",
 "pt.appendChild(el('div', 'presenter-name', 'Your demonstrator: ' + esc(prov.topAuthor)));"),
("""      var line = seededPick(slug, 3, [
        'vous le présente avec la passion des grands soirs',
        'connaît ce produit sur le bout des doigts',
        'ne quittera pas le plateau avant que vous ayez compris',
        'a préparé cette démonstration rien que pour vous'
      ]);""",
"""      var line = seededPick(slug, 3, [
        'presents it to you with big-night passion',
        'knows this product inside out',
        'will not leave the studio floor until you get it',
        'prepared this demonstration just for you'
      ]);"""),
("(others > 0 ? ' — épaulé par <b>' + others + ' ' + plur(others, 'autre artisan', 'autres artisans') + '</b> de la maison' : '') +",
 "(others > 0 ? ' — backed by <b>' + others + ' other in-house ' + plur(others, 'artisan') + '</b>' : '') +"),
("(prov.first ? '. En rayon depuis le <b>' + esc(prov.first) + '</b>' : '') +",
 "(prov.first ? '. On the shelf since <b>' + esc(prov.first) + '</b>' : '') +"),
("(prov.last ? ', dernier réassort le <b>' + esc(prov.last) + '</b>.' : '.')));",
 "(prov.last ? ', last restocked on <b>' + esc(prov.last) + '</b>.' : '.')));"),
("    // colonne droite : prix, urgence, preuve sociale", "    // right column: price, urgency, social proof"),
("core.appendChild(el('div', 'price-only', 'seulement'));", "core.appendChild(el('div', 'price-only', 'only'));"),
("core.appendChild(el('div', 'price-unit', plur(words, 'MOT') + ' !'));", "core.appendChild(el('div', 'price-unit', plur(words, 'WORD') + '!'));"),
("core.appendChild(el('div', 'price-note', 'soit 0 € TTC, payable en une fois'));",
 "core.appendChild(el('div', 'price-note', 'that is $0.00 all-in, payable in one instalment'));"),
("urg.appendChild(el('div', 'urgency-label', 'OFFRE VALABLE ENCORE'));",
 "urg.appendChild(el('div', 'urgency-label', 'OFFER STILL VALID FOR'));"),
("urg.appendChild(el('p', 'urgency-sub', 'Jusqu’à minuit, comme toutes les offres exceptionnelles. Puis elle recommence.'));",
 "urg.appendChild(el('p', 'urgency-sub', 'Offer ends at midnight, like all exceptional offers. Then it starts again.'));"),
("sb.appendChild(el('div', 'scarcity-head', '⚠ STOCK LIMITÉ !'));",
 "sb.appendChild(el('div', 'scarcity-head', '⚠ LIMITED STOCK!'));"),
("""      sb.appendChild(el('p', null,
        'Aucune des ' + (order.length - 1) + ' autres pages ne cite encore celle-ci. ' +
        'Il ne reste que <span class="scarcity-stock">' + uncitedCount + '</span> pages jamais citées dans tout le catalogue — ' +
        'soyez la première page à l’appeler !'));""",
"""      sb.appendChild(el('p', null,
        'None of the other ' + (order.length - 1) + ' pages cites this one yet. ' +
        'Only <span class="scarcity-stock">' + uncitedCount + '</span> never-cited pages remain in the whole catalogue, while stocks last — ' +
        'be the first page to call!'));"""),
("""      sp.appendChild(el('p', null, 'de la documentation ' + (inb === 1 ? 'recommande déjà' : 'recommandent déjà') +
        ' ce produit à leurs lecteurs. Compté dans le graphe réel des 1 231 citations.'));""",
"""      sp.appendChild(el('p', null, 'of the documentation already ' + (inb === 1 ? 'recommends' : 'recommend') +
        ' this product to their readers. Counted in the real graph of 1 231 citations.'));"""),
("    // -- témoignages", "    // -- testimonials"),
("tw.appendChild(el('h2', 'testi-head', 'ILS EN PARLENT SUR LE PLATEAU'));",
 "tw.appendChild(el('h2', 'testi-head', 'THEY ARE TALKING ABOUT IT ON SET'));"),
("(T.total > T.names.length ? ' et ' + (T.total - T.names.length) + ' autres pages' : '') +",
 "(T.total > T.names.length ? ' and ' + (T.total - T.names.length) + ' other pages' : '') +"),
("' font un lien vers ce produit. Elles n’ont rien déclaré à la caméra, mais les liens sont là.'));",
 "' link to this product. They said nothing on camera, but the links are there.'));"),
("c.appendChild(el('p', 'testi-who', '— Le registre des citations'));",
 "c.appendChild(el('p', 'testi-who', '— The citation register'));"),
("c.appendChild(el('p', 'testi-note', 'vérifiable dans le graphe des liens'));",
 "c.appendChild(el('p', 'testi-note', 'verifiable in the link graph'));"),
("c.appendChild(el('p', 'testi-note', 'page cliente authentique · ' + t.epithet));",
 "c.appendChild(el('p', 'testi-note', 'genuine client page · ' + t.epithet));"),
("    // -- LA DÉMONSTRATION : la vraie page, intégrale", "    // -- THE DEMONSTRATION: the real page, in full"),
("bar.appendChild(el('div', 'demo-title', 'LA DÉMONSTRATION'));",
 "bar.appendChild(el('div', 'demo-title', 'THE DEMONSTRATION'));"),
("bar.appendChild(el('span', 'demo-sub', 'la page complète, texte non retouché'));",
 "bar.appendChild(el('span', 'demo-sub', 'the complete page, text untouched'));"),
("    // -- garanties (mesurées)", "    // -- warranties (measured)"),
("w1.appendChild(el('div', 'w-head', 'GARANTIE ATELIER'));",
 "w1.appendChild(el('div', 'w-head', 'WORKSHOP WARRANTY'));"),
("""      w1.appendChild(el('p', null, 'Satisfait ou re-documenté : déjà <b>' + prov.commits + ' ' + plur(prov.commits, 'révision') + '</b> par <b>' +
        (prov.authors || []).length + ' ' + plur((prov.authors || []).length, 'artisan') + '</b>' +
        (prov.careDays ? ' sur <b>' + fmtInt(prov.careDays) + ' jours</b>' : '') + '.'));""",
"""      w1.appendChild(el('p', null, 'Satisfaction or your docs rewritten: already <b>' + prov.commits + ' ' + plur(prov.commits, 'revision') + '</b> by <b>' +
        (prov.authors || []).length + ' ' + plur((prov.authors || []).length, 'artisan') + '</b>' +
        (prov.careDays ? ' over <b>' + fmtInt(prov.careDays) + ' days</b>' : '') + '.'));"""),
("w2.appendChild(el('div', 'w-head', 'SERVICE APRÈS-VENTE'));",
 "w2.appendChild(el('div', 'w-head', 'AFTER-SALES SERVICE'));"),
("""    w2.appendChild(el('p', null, outN > 0
      ? 'Ce produit renvoie lui-même vers <b>' + outN + ' ' + plur(outN, 'page') + '</b> du catalogue. Vous ne repartirez jamais les mains vides.'
      : 'Ce produit se suffit à lui-même : <b>aucun lien sortant</b> — tout est dans la boîte.'));""",
"""    w2.appendChild(el('p', null, outN > 0
      ? 'This product itself links out to <b>' + outN + ' ' + plur(outN, 'page') + '</b> of the catalogue. You will never leave empty-handed.'
      : 'This product stands on its own: <b>no outbound links</b> — everything is in the box.'));"""),
("w3.appendChild(el('div', 'w-head', 'LIVRAISON IMMÉDIATE'));",
 "w3.appendChild(el('div', 'w-head', 'IMMEDIATE DELIVERY'));"),
("w3.appendChild(el('p', null, 'La page est déjà chez vous, elle s’affiche au-dessus. <b>' + fmtInt(words) + ' mots</b> livrés en une seule fois, sans frais de port.'));",
 "w3.appendChild(el('p', null, 'The page is already at your place, showing right above. <b>' + fmtInt(words) + ' words</b> delivered in one go, free shipping.'));"),
("'<div class=\"zap-dir\">◀ SEGMENT PRÉCÉDENT</div>'", "'<div class=\"zap-dir\">◀ PREVIOUS SEGMENT</div>'"),
("'<div class=\"zap-dir\">SEGMENT SUIVANT ▶</div>'", "'<div class=\"zap-dir\">NEXT SEGMENT ▶</div>'"),
("'<div class=\"zap-price\">seulement ' + fmtInt(g.words[prev] || 0) + ' mots</div>';",
 "'<div class=\"zap-price\">only ' + fmtInt(g.words[prev] || 0) + ' words</div>';"),
("'<div class=\"zap-price\">seulement ' + fmtInt(g.words[next] || 0) + ' mots</div>';",
 "'<div class=\"zap-price\">only ' + fmtInt(g.words[next] || 0) + ' words</div>';"),
("""      'TÉLÉ·ACHAT DOC diffuse la documentation réelle de Strapi, intégrale et non retouchée. ' +
      'Chaque chiffre annoncé est mesuré. <button type="button" id="foot-notice">Lire la notice (les vrais mots)</button>');""",
"""      'SHOP·DOCS 24/7 broadcasts the real Strapi documentation, complete and untouched. ' +
      'Every number announced is measured. <button type="button" id="foot-notice">Read the manual (the plain words)</button>');"""),
("/* ---------------- rendu des blocs de documentation ----------------", "/* ---------------- documentation block rendering ----------------"),
("t.appendChild(el('span', 'tldr-label', 'L’argumentaire — en bref'));",
 "t.appendChild(el('span', 'tldr-label', 'The pitch — in brief'));"),
("""        var labels = {
          tip: 'Astuce', note: 'Note', info: 'Info', caution: 'Prudence', warning: 'Attention',
          danger: 'Danger', strapi: 'Strapi', prerequisites: 'Prérequis', callout: 'Le mot de la régie'
        };""",
"""        var labels = {
          tip: 'Tip', note: 'Note', info: 'Info', caution: 'Caution', warning: 'Warning',
          danger: 'Danger', strapi: 'Strapi', prerequisites: 'Prerequisites', callout: 'A word from the control room'
        };"""),
("esc(tb.label || tb.value || ('Onglet ' + (i + 1)))", "esc(tb.label || tb.value || ('Tab ' + (i + 1)))"),
("det.appendChild(el('summary', null, esc(b.summary || 'Voir plus')));",
 "det.appendChild(el('summary', null, esc(b.summary || 'See more')));"),
("        // filet de sécurité : ne jamais perdre de contenu", "        // safety net: never lose content"),
("head.appendChild(el('span', null, esc(title || (lang ? lang + ' — démonstration' : 'démonstration'))));",
 "head.appendChild(el('span', null, esc(title || (lang ? lang + ' — demonstration' : 'demonstration'))));"),
("head.appendChild(el('span', 'method-pill method-CALL', 'APPEL'));",
 "head.appendChild(el('span', 'method-pill method-CALL', 'CALL'));"),
("body.appendChild(el('p', 'param-title', esc(b.paramTitle || 'Paramètres')));",
 "body.appendChild(el('p', 'param-title', esc(b.paramTitle || 'Parameters')));"),
("thead.innerHTML = '<tr><th>Nom</th><th>Type</th><th></th><th>Description</th></tr>';",
 "thead.innerHTML = '<tr><th>Name</th><th>Type</th><th></th><th>Description</th></tr>';"),
("? '<span class=\"req-flag\">REQUIS</span>' : '<span class=\"opt-flag\">optionnel</span>'",
 "? '<span class=\"req-flag\">REQUIRED</span>' : '<span class=\"opt-flag\">optional</span>'"),
("'<span class=\"dot\"></span> Réponse ' + esc(r.status)", "'<span class=\"dot\"></span> Response ' + esc(r.status)"),
]

html_pairs = [
('<html lang="fr">', '<html lang="en">'),
('<title>TÉLÉ·ACHAT DOC</title>', '<title>SHOP·DOCS 24/7</title>'),
('aria-label="Accueil TÉLÉ·ACHAT DOC"', 'aria-label="SHOP·DOCS 24/7 home"'),
('<span class="logo-tv">TÉLÉ·ACHAT</span><span class="logo-doc">DOC</span>',
 '<span class="logo-tv">SHOP·DOCS</span><span class="logo-doc">24/7</span>'),
('<span class="live-dot" aria-hidden="true"></span>EN DIRECT</span>',
 '<span class="live-dot" aria-hidden="true"></span>LIVE ON AIR</span>'),
('<span id="clock" class="clock" aria-label="heure"></span>', '<span id="clock" class="clock" aria-label="time"></span>'),
('<label class="standard-label" for="search">☎ STANDARD</label>', '<label class="standard-label" for="search">☎ SWITCHBOARD</label>'),
('placeholder="Nos 290 conseillères vous écoutent…" aria-label="Rechercher un produit dans le catalogue">',
 'placeholder="Our 290 operators are standing by…" aria-label="Search for a product in the catalogue">'),
('<button id="notice-btn" class="notice-btn" type="button">LA NOTICE</button>',
 '<button id="notice-btn" class="notice-btn" type="button">THE MANUAL</button>'),
('<nav id="programme" aria-label="Programme des émissions">', '<nav id="programme" aria-label="Programme guide">'),
('<div class="prog-head">LE PROGRAMME</div>', '<div class="prog-head">THE PROGRAMME</div>'),
("<p class=\"mire-text\">UN INSTANT, NOUS RÉGLONS L'ANTENNE…</p>",
 '<p class="mire-text">ONE MOMENT, ADJUSTING THE ANTENNA…</p>'),
('<span class="blink">APPELEZ&nbsp;MAINTENANT</span><span class="chyron-num">36&nbsp;15&nbsp;DOC</span>',
 '<span class="blink">CALL&nbsp;NOW</span><span class="chyron-num">1-800-DOC-SHOP</span>'),
('aria-label="Fermer la notice"', 'aria-label="Close the manual"'),
('<h2 id="notice-title">La notice <small>(les vrais mots, sans le paillettes)</small></h2>',
 '<h2 id="notice-title">The manual <small>(the plain words, glitter removed)</small></h2>'),
]

css_pairs = [
('TÉLÉ·ACHAT DOC — la documentation Strapi en chaîne de téléachat 1990',
 'SHOP·DOCS 24/7 — the Strapi documentation as a 1990s home-shopping channel'),
]

bad = []
bad += [('f1.js',) + m for m in apply(P + 'f1.js', js_pairs)]
bad += [('index.html',) + m for m in apply(P + 'index.html', html_pairs)]
bad += [('f1.css',) + m for m in apply(P + 'f1.css', css_pairs)]
if bad:
    print('MISMATCHES:')
    for b in bad: print(b)
    sys.exit(1)
print('all replacements applied')
