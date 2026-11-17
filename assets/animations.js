// Animations du NAPO, dessinées sur <canvas data-anim="nom">. Chaque dessin ne dépend que du
// temps t (en secondes) et boucle toutes les 10 s : le même code sert au site et à l'export vidéo.
(() => {
  const T = 10, TAU = Math.PI * 2;
  const OR = '#cab990', OR_VIF = '#e6c98a', OR_SOMBRE = '#a27a39', BORDEAUX = '#650305', TERRE = '#a83c2d', NUIT = '#17203a', ENCRE = '#171714';
  // Hasard reproductible : la même graine donne toujours le même décor
  const hasard = (g) => () => { g = (g * 1664525 + 1013904223) % 4294967296; return g / 4294967296; };
  const boucle = (x) => ((x % 1) + 1) % 1;
  const pic = (x, largeur) => Math.max(0, 1 - Math.abs(x) / largeur);

  // 1. Événement, ambiance : lueurs de bougies qui montent dans la pénombre
  const lueurs = (() => { const r = hasard(7); return Array.from({ length: 90 }, () => ({ x: r(), y: r(), taille: 0.006 + r() * r() * 0.05, vitesse: 1 + Math.floor(r() * 3), phase: r(), rouge: r() < 0.22, derive: (r() - 0.5) * 0.06, clign: 1 + Math.floor(r() * 4) })); })();
  function bougies(c, w, h, t) {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, ENCRE); g.addColorStop(0.6, '#15161f'); g.addColorStop(1, NUIT);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const halo = c.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h * 1.05, h * 0.9);
    halo.addColorStop(0, 'rgba(168,60,45,' + (0.26 + 0.05 * Math.sin(TAU * t / T * 2)) + ')'); halo.addColorStop(1, 'rgba(168,60,45,0)');
    c.fillStyle = halo; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    for (const l of lueurs) {
      const p = t / T, y = boucle(l.y - p * l.vitesse) * 1.2 - 0.1;
      const x = l.x + l.derive * Math.sin(TAU * (p * l.vitesse + l.phase));
      const eclat = 0.5 + 0.5 * Math.sin(TAU * (p * l.clign + l.phase));
      const fondu = Math.min(1, y * 6, (1.1 - y) * 6);
      const R = l.taille * h * (0.85 + 0.3 * eclat), a = Math.max(0, fondu) * (0.1 + 0.3 * eclat) * (l.taille > 0.03 ? 0.55 : 1);
      const d = c.createRadialGradient(x * w, y * h, 0, x * w, y * h, R);
      d.addColorStop(0, (l.rouge ? 'rgba(214,84,60,' : 'rgba(230,201,138,') + a + ')'); d.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = d; c.beginPath(); c.arc(x * w, y * h, R, 0, TAU); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
  }

  // 2. Événement, illustration : la tablée, bougies qui dansent et verres qui trinquent
  function tablee(c, w, h, t, fond) {
    if (fond) { c.fillStyle = fond; c.fillRect(0, 0, w, h); } else c.clearRect(0, 0, w, h);
    const u = Math.min(w / 16, h / 7), cx = w / 2, sol = h * 0.78;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = OR_SOMBRE; c.lineWidth = u * 0.045;
    // la table et sa nappe
    c.beginPath(); c.moveTo(cx - u * 7, sol); c.lineTo(cx + u * 7, sol); c.stroke();
    c.lineWidth = u * 0.025; c.beginPath();
    for (let k = 0; k < 14; k++) { const x0 = cx - u * 7 + k * u; c.moveTo(x0, sol); c.quadraticCurveTo(x0 + u / 2, sol + u * 0.45, x0 + u, sol); }
    c.stroke();
    // cinq bougies
    [-5.6, -3.4, 0, 3.4, 5.6].forEach((dx, k) => {
      const x = cx + dx * u, haut = sol - u * (k === 2 ? 2.3 : 1.5 + (k % 2) * 0.35);
      c.lineWidth = u * 0.04; c.strokeStyle = OR_SOMBRE; c.strokeRect(x - u * 0.13, haut, u * 0.26, sol - haut);
      const p = t / T, vac = Math.sin(TAU * (p * 6 + k * 0.23)) * 0.5 + Math.sin(TAU * (p * 11 + k * 0.4)) * 0.5;
      const fh = u * (0.62 + 0.1 * vac), fx = x + u * 0.07 * Math.sin(TAU * (p * 4 + k * 0.31));
      const lueur = c.createRadialGradient(x, haut - fh * 0.5, 0, x, haut - fh * 0.5, u * 1.5);
      lueur.addColorStop(0, 'rgba(230,201,138,' + (0.3 + 0.07 * vac) + ')'); lueur.addColorStop(1, 'rgba(230,201,138,0)');
      c.fillStyle = lueur; c.beginPath(); c.arc(x, haut - fh * 0.5, u * 1.5, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x - u * 0.15, haut - u * 0.1); c.quadraticCurveTo(x - u * 0.2, haut - fh * 0.55, fx, haut - fh - u * 0.1); c.quadraticCurveTo(x + u * 0.2, haut - fh * 0.55, x + u * 0.15, haut - u * 0.1); c.quadraticCurveTo(x, haut + u * 0.03, x - u * 0.15, haut - u * 0.1);
      c.fillStyle = TERRE; c.fill(); c.strokeStyle = OR_SOMBRE; c.lineWidth = u * 0.03; c.stroke();
    });
    // deux verres qui trinquent, deux fois par boucle
    const q = boucle(t / (T / 2)), choc = pic(q - 0.5, 0.16), elan = choc * choc * (3 - 2 * choc);
    const verre = (sens) => {
      c.save(); c.translate(cx + sens * u * (1.75 - 0.95 * elan), sol - u * (0.1 + 1.25 * elan)); c.rotate(-sens * 0.42 * elan);
      c.strokeStyle = OR_SOMBRE; c.lineWidth = u * 0.045;
      c.beginPath(); c.moveTo(-u * 0.32, 0); c.lineTo(u * 0.32, 0); c.moveTo(0, 0); c.lineTo(0, -u * 0.85);
      c.moveTo(-u * 0.42, -u * 1.85); c.quadraticCurveTo(-u * 0.5, -u * 0.9, 0, -u * 0.85); c.quadraticCurveTo(u * 0.5, -u * 0.9, u * 0.42, -u * 1.85); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(-u * 0.43, -u * 1.4); c.quadraticCurveTo(-u * 0.46, -u * 0.93, 0, -u * 0.89); c.quadraticCurveTo(u * 0.46, -u * 0.93, u * 0.43, -u * 1.4); c.closePath();
      c.fillStyle = BORDEAUX; c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1; c.restore();
    };
    verre(-1); verre(1);
    // l'étincelle du toast
    const apres = q - 0.5;
    if (apres > 0 && apres < 0.3) {
      const e = apres / 0.3, ex = cx, ey = sol - u * 3.1;
      c.strokeStyle = OR_SOMBRE; c.globalAlpha = 1 - e; c.lineWidth = u * 0.04;
      for (let k = 0; k < 10; k++) { const a = TAU * k / 10 + 0.3, r0 = u * (0.25 + 0.9 * e), r1 = r0 + u * 0.3 * (1 - e); c.beginPath(); c.moveTo(ex + Math.cos(a) * r0, ey + Math.sin(a) * r0); c.lineTo(ex + Math.cos(a) * r1, ey + Math.sin(a) * r1); c.stroke(); }
      c.globalAlpha = 1;
    }
  }

  // 3. Karaoké, ambiance : ondes sonores et égaliseur
  function ondes(c, w, h, t) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, ENCRE); g.addColorStop(1, '#1b1226');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const p = t / T;
    const N = 72, lb = w / N;
    for (let k = 0; k < N; k++) {
      const s = 0.5 + 0.25 * Math.sin(TAU * (p * 3 + k * 0.071)) + 0.25 * Math.sin(TAU * (p * 7 + k * 0.193));
      const env = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * k / (N - 1)), 0.6), hb = h * 0.3 * s * env;
      const d = c.createLinearGradient(0, h - hb, 0, h); d.addColorStop(0, 'rgba(168,60,45,.55)'); d.addColorStop(1, 'rgba(101,3,5,.05)');
      c.fillStyle = d; c.fillRect(k * lb + lb * 0.18, h - hb, lb * 0.64, hb);
    }
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[OR_VIF, 0.42, 0.085, 2, 1, 0.9], [TERRE, 0.5, 0.11, 3, -1, 0.75], [OR, 0.58, 0.07, 4, 2, 0.5], ['#7d1a1c', 0.47, 0.14, 2, -2, 0.6]].forEach(([coul, y0, amp, ondesN, tours, alpha], idx) => {
      for (const [ep, al] of [[0.02, 0.1], [0.008, 0.25], [0.0025, 1]]) {
        c.beginPath();
        for (let x = 0; x <= w; x += w / 240) {
          const xn = x / w, mod = 0.55 + 0.45 * Math.sin(TAU * (xn * 1.5 - p * tours + idx * 0.21));
          const y = y0 * h + Math.sin(TAU * (xn * ondesN + p * tours * 2 + idx * 0.37)) * amp * h * mod;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.strokeStyle = coul; c.globalAlpha = alpha * al; c.lineWidth = h * ep; c.stroke();
      }
    });
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }

  // 4. Karaoké, illustration : les trois salles s'allument l'une après l'autre
  const notes = (() => { const r = hasard(23); return Array.from({ length: 20 }, (_, k) => ({ salle: k % 3, dx: (r() - 0.5) * 0.8, phase: r(), croche: r() < 0.5 })); })();
  function salles(c, w, h, t, fond) {
    if (fond) { c.fillStyle = fond; c.fillRect(0, 0, w, h); } else c.clearRect(0, 0, w, h);
    const u = Math.min(w / 16, h / 7), cx = w / 2, sol = h * 0.86, p = t / T;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = OR; c.lineWidth = u * 0.04; c.beginPath(); c.moveTo(cx - u * 7.4, sol); c.lineTo(cx + u * 7.4, sol); c.stroke();
    const allume = (k) => Math.min(1, pic(boucle(p - k / 3 + 0.5) - 0.5, 0.3) * 1.7);
    for (let k = 0; k < 3; k++) {
      const x = cx + (k - 1) * u * 4.2, lp = u * 1.9, hp = u * 3.9, a = allume(k);
      const porte = () => { c.beginPath(); c.moveTo(x - lp / 2, sol); c.lineTo(x - lp / 2, sol - hp + lp / 2); c.arc(x, sol - hp + lp / 2, lp / 2, Math.PI, 0); c.lineTo(x + lp / 2, sol); c.closePath(); };
      if (a > 0.01) {
        const halo = c.createRadialGradient(x, sol - hp * 0.5, 0, x, sol - hp * 0.5, u * 3.2);
        halo.addColorStop(0, 'rgba(168,60,45,' + 0.5 * a + ')'); halo.addColorStop(1, 'rgba(168,60,45,0)');
        c.fillStyle = halo; c.fillRect(x - u * 3.2, sol - hp - u * 2, u * 6.4, hp + u * 2.6);
        porte(); const d = c.createLinearGradient(0, sol - hp, 0, sol); d.addColorStop(0, 'rgba(230,201,138,' + 0.95 * a + ')'); d.addColorStop(1, 'rgba(168,60,45,' + 0.85 * a + ')'); c.fillStyle = d; c.fill();
      }
      porte(); c.strokeStyle = OR; c.lineWidth = u * 0.05; c.stroke();
      // le micro
      c.strokeStyle = a > 0.5 ? NUIT : OR; c.globalAlpha = 0.55 + 0.45 * a; c.lineWidth = u * 0.055;
      const my = sol - hp * 0.48; c.beginPath();
      c.moveTo(x - u * 0.2, my); c.lineTo(x - u * 0.2, my - u * 0.5); c.arc(x, my - u * 0.5, u * 0.2, Math.PI, 0); c.lineTo(x + u * 0.2, my); c.arc(x, my, u * 0.2, 0, Math.PI);
      c.moveTo(x - u * 0.38, my - u * 0.05); c.arc(x, my - u * 0.05, u * 0.38, Math.PI, 0, true); c.moveTo(x, my + u * 0.33); c.lineTo(x, my + u * 0.62); c.moveTo(x - u * 0.25, my + u * 0.62); c.lineTo(x + u * 0.25, my + u * 0.62); c.stroke(); c.globalAlpha = 1;
      c.fillStyle = OR; c.font = `600 ${u * 0.34}px "Cormorant Garamond", Georgia, serif`; c.textAlign = 'center'; c.fillText(String(k + 1), x, sol + u * 0.5);
    }
    // les notes qui s'échappent des salles allumées
    for (const n of notes) {
      const a = allume(n.salle), vie = boucle(p * 4 + n.phase); if (a < 0.05) continue;
      const x = cx + (n.salle - 1) * u * 4.2 + n.dx * u + Math.sin(TAU * (vie + n.phase)) * u * 0.25, y = sol - u * 4.1 - vie * u * 1.9, r = u * 0.13;
      c.globalAlpha = a * Math.sin(Math.PI * vie); c.fillStyle = OR_VIF; c.strokeStyle = OR_VIF; c.lineWidth = u * 0.04;
      c.beginPath(); c.ellipse(x, y, r, r * 0.75, -0.4, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x + r * 0.9, y - r * 0.2); c.lineTo(x + r * 0.9, y - u * 0.5); if (n.croche) c.quadraticCurveTo(x + u * 0.32, y - u * 0.42, x + u * 0.3, y - u * 0.22); c.stroke();
    }
    c.globalAlpha = 1;
  }

  const ANIMS = { bougies, tablee, ondes, salles };
  window.NAPO_ANIM = { T, dessiner: (nom, c, w, h, t, fond) => ANIMS[nom](c, w, h, ((t % T) + T) % T, fond) };

  // Sur le site : chaque canvas s'anime seulement quand il est visible
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('canvas[data-anim]').forEach((cv) => {
    const c = cv.getContext('2d'); let visible = false, enCours = false;
    const taille = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d)); };
    const image = (ms) => { ANIMS[cv.dataset.anim](c, cv.width, cv.height, (ms / 1000) % T); if (visible && !calme) requestAnimationFrame(image); else enCours = false; };
    const lancer = () => { if (!enCours) { enCours = true; requestAnimationFrame(image); } };
    new ResizeObserver(() => { taille(); if (calme || !visible) image(2600); }).observe(cv);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) lancer(); }).observe(cv);
    taille(); image(2600);
  });
})();
