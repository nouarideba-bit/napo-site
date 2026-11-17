// Génère les 3 cartes en PDF à partir de menus/carte.json : node menus/build.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const src = path.join(__dirname, 'src');
const out = path.join(__dirname, '..', 'assets', 'cartes');
const carte = JSON.parse(fs.readFileSync(path.join(__dirname, 'carte.json'), 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const FAIT_MAISON = '* Plat fait maison';

const plat = (p) => `<div class="plat">
  <div class="ligne"><span class="nom">${esc(p.nom)}</span><span class="pts"></span><span class="prix">${esc(p.prix)}${p.maison ? '*' : ''}</span></div>
  ${p.note && !p.desc ? `<div class="note">${esc(p.note)}</div>` : ''}
  ${p.note && p.desc && /Spécialité/.test(p.note) ? `<div class="note">${esc(p.note)}</div>` : ''}
  ${p.desc ? `<div class="desc">${esc(p.desc)}</div>` : ''}
  ${p.note && p.desc && !/Spécialité/.test(p.note) ? `<div class="note">${esc(p.note)}</div>` : ''}
</div>`;
const section = (s) => `<h2>${esc(s.titre)}</h2>${s.plats.map(plat).join('')}`;
const entete = (c, devise) => `<h1>${esc(c.titre)}</h1><div class="sous-titre">${esc(c.sous_titre)}</div>${devise ? `<div class="devise">${esc(carte.devise)}</div>` : ''}`;
const page = (html) => `<section class="page"><div class="contenu">${html}</div></section>`;
const doc = (titre, pages) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(titre)}</title><link rel="stylesheet" href="menus.css"></head><body>${pages.join('')}</body></html>`;

const s = carte.spuntinu, c = carte.carte, d = carte.degustation;
const docs = {
  'napo-u-spuntinu': doc('NAPO – U Spuntinu', [
    page(`${entete(s, true)}<div class="colonnes"><div class="col">${section(s.sections[0])}</div><div class="col">${section(s.sections[1])}${section(s.sections[2])}</div></div><div class="pied">${FAIT_MAISON}</div>`),
  ]),
  'napo-carte': doc('NAPO – La carte à table', [
    page(`${entete(c, true)}<div class="colonnes"><div class="col">${section(c.sections[0])}</div><div class="col">${section(c.sections[1])}</div></div><div class="pied">${FAIT_MAISON}</div>`),
    page(`${entete({ titre: c.sections[2].titre, sous_titre: c.titre })}<div class="liste">${c.sections[2].plats.map(plat).join('')}</div><div class="pied">${FAIT_MAISON}</div>`),
  ]),
  'napo-menus-degustation': doc('NAPO – Plan de campagne gourmande', [
    page(`${entete(d, true)}<div class="menus">${d.menus.map((m) => `<div class="menu"><h2>${esc(m.nom)}</h2><div class="temps">${esc(m.temps)}</div><div class="tarif">${esc(m.prix)}</div><ol>${m.plats.map((p, i) => `<li><b>${i + 1}.</b><span>${esc(p)}</span></li>`).join('')}</ol></div>`).join('')}</div><div class="signature">${esc(carte.signature)}</div>`),
  ]),
  'napo-chevalet-qr': doc('NAPO – Chevalet QR code', [
    page(`<h1>La carte</h1><div class="devise">${esc(carte.devise)}</div><div class="qr"><img src="qr-menu.svg" alt="QR code vers lenapo.fr/menu"></div><ul class="langues">${carte.chevalet.map((l) => `<li><b>${l.code}</b><span lang="${l.code.toLowerCase()}">${esc(l.texte)}</span></li>`).join('')}</ul><div class="url">lenapo.fr/menu</div>`),
  ]),
  'napo-chevalet-qr-seul': doc('NAPO – Chevalet QR code seul', [
    page(`<div class="qr qr-seul"><img src="qr-menu.svg" alt="QR code vers lenapo.fr/menu"></div>`),
  ]),
};

(async () => {
  fs.mkdirSync(out, { recursive: true });
  // même source pour le site : assets/carte.js
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'carte.js'), `window.CARTE = ${JSON.stringify(carte)};\n`);
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  for (const [nom, html] of Object.entries(docs)) {
    const fichier = path.join(src, `${nom}.html`);
    fs.writeFileSync(fichier, html);
    await tab.goto(`file://${fichier}`);
    await tab.evaluate(() => document.fonts.ready);
    await tab.pdf({ path: path.join(out, `${nom}.pdf`), preferCSSPageSize: true, printBackground: true });
    console.log(`${nom}.pdf`);
  }
  await browser.close();
})();
