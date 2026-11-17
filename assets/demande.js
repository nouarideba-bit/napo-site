// Parcours de demande pas à pas (événement, karaoké). Chaque page fournit window.DEMANDE.
(() => {
  const D = window.DEMANDE;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const $ = (id) => document.getElementById(id);
  const etat = {};
  D.etapes.forEach((e) => { if (e.type === 'nombre') etat[e.id] = e.defaut; if (e.type === 'multi') etat[e.id] = []; if (e.type === 'salles') etat[e.id] = []; });
  let i = 0;
  const aujourdhui = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const dateLisible = (d) => new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const champ = 'w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 text-lg text-white placeholder-white/35 transition-colors focus:border-sable focus:outline-none focus:ring-0';
  const carte = (actif) => 'choix group flex min-h-[4.5rem] w-full items-center gap-4 border px-5 py-4 text-left transition duration-200 hover:-translate-y-0.5 ' + (actif ? 'border-sable bg-sable/15 text-white shadow-[0_0_0_1px_#cab990]' : 'border-white/15 bg-white/[.03] text-white/85 hover:border-sable/70');

  const rendus = {
    cartes: (e) => `<div class="grid gap-3 sm:grid-cols-2">${e.choix.map((c) => `<button type="button" data-val="${esc(c.nom)}" aria-pressed="${etat[e.id] === c.nom}" class="${carte(etat[e.id] === c.nom)}"><span class="font-serif text-3xl text-sable" aria-hidden="true">${c.signe}</span><span><span class="block font-serif text-xl font-semibold">${esc(c.nom)}</span>${c.detail ? `<span class="block text-sm text-white/60">${esc(c.detail)}</span>` : ''}</span></button>`).join('')}</div>`,
    multi: (e) => `<div class="grid gap-3 sm:grid-cols-2">${e.choix.map((c) => { const a = etat[e.id].includes(c.nom); return `<button type="button" data-val="${esc(c.nom)}" aria-pressed="${a}" class="${carte(a)}"><span class="grid h-6 w-6 shrink-0 place-items-center border ${a ? 'border-sable bg-sable text-nuit' : 'border-white/40'}" aria-hidden="true">${a ? '✓' : ''}</span><span><span class="block font-serif text-xl font-semibold">${esc(c.nom)}</span>${c.detail ? `<span class="block text-sm text-white/60">${esc(c.detail)}</span>` : ''}</span></button>`; }).join('')}</div><p class="mt-4 text-sm text-white/50">Facultatif : passez si rien ne vous tente.</p>`,
    nombre: (e) => `<div class="flex items-center justify-center gap-6 sm:justify-start">
        <button type="button" data-pas="-1" aria-label="Moins" class="grid h-14 w-14 place-items-center border border-white/25 text-2xl transition hover:border-sable hover:text-sable">−</button>
        <input id="nb" type="number" inputmode="numeric" min="${e.min}" max="${e.max}" value="${etat[e.id]}" aria-label="${esc(e.unite)}" class="w-32 border-0 bg-transparent p-0 text-center font-serif text-7xl font-semibold text-white focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none">
        <button type="button" data-pas="1" aria-label="Plus" class="grid h-14 w-14 place-items-center border border-white/25 text-2xl transition hover:border-sable hover:text-sable">+</button>
      </div><p class="mt-3 text-center text-sm uppercase tracking-[.25em] text-sable sm:text-left">${esc(e.unite)}</p>
      <div class="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">${e.raccourcis.map((n) => `<button type="button" data-fixe="${n}" class="border border-white/15 px-4 py-2 text-sm transition hover:border-sable hover:text-sable">${n}</button>`).join('')}</div>`,
    salles: (e) => { const n = personnes(), cap = capacite(e), conseil = suggestion(e, n);
      return `<div class="grid gap-3 sm:grid-cols-${e.salles.length}" role="group" aria-label="Salles">${e.salles.map((sa) => { const a = etat[e.id].includes(sa.nom); return `<button type="button" data-salle="${esc(sa.nom)}" aria-pressed="${a}" class="relative flex min-h-[11rem] flex-col items-center justify-center gap-2 border px-3 py-6 text-center transition duration-300 hover:-translate-y-1 ${a ? 'border-sable bg-gradient-to-b from-bordeaux to-bordeaux/40 text-white shadow-[0_0_40px_-8px_#a83c2d]' : 'border-white/15 bg-white/[.03] text-white/55 hover:border-sable/60'}">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4M8.5 21.5h7"/></svg>
          <span class="font-serif text-2xl font-semibold leading-tight">${esc(sa.nom)}</span>
          <span class="text-sm">${sa.min} à ${sa.max} personnes</span>
          <span class="text-[.65rem] font-bold uppercase tracking-[.2em] text-sable">${a ? 'Pour vous' : conseil.includes(sa.nom) ? 'Conseillée' : '&nbsp;'}</span></button>`; }).join('')}</div>
      <p class="mt-5 font-serif text-xl text-sable">${etat[e.id].length ? `${etat[e.id].length} salle${etat[e.id].length > 1 ? 's' : ''} · jusqu’à ${cap} personnes` : 'Aucune salle choisie'} <span class="text-white/55">pour votre groupe de ${n}</span></p>`; },
    date: (e) => `<label class="block text-xs font-bold uppercase tracking-[.2em] text-sable" for="date">Date souhaitée</label>
      <input id="date" type="date" min="${aujourdhui}" value="${etat.date || ''}" class="${champ} [color-scheme:dark]">
      <p class="mt-8 text-xs font-bold uppercase tracking-[.2em] text-sable">${esc(e.libelleMoment)}</p>
      <div class="mt-3 flex flex-wrap gap-2">${e.moments.map((m) => `<button type="button" data-moment="${esc(m)}" aria-pressed="${etat.moment === m}" class="border px-5 py-3 text-sm font-semibold transition ${etat.moment === m ? 'border-sable bg-sable text-nuit' : 'border-white/20 hover:border-sable hover:text-sable'}">${esc(m)}</button>`).join('')}</div>
      <label class="mt-8 flex cursor-pointer items-center gap-3 text-white/75"><input id="flexible" type="checkbox" ${etat.flexible ? 'checked' : ''} class="h-5 w-5 border-white/40 bg-transparent text-bordeaux focus:ring-sable"> Je suis flexible sur la date</label>${D.tarif ? `<p class="mt-6 text-sm text-white/60">Par personne : ${D.tarif.semaine} € du lundi au vendredi · ${D.tarif.weekend} € le samedi et le dimanche${D.tarif.pointe ? ` · ${D.tarif.pointe} € le vendredi et le samedi à partir de 19 h` : ''}.</p>` : ''}`,
    contact: () => `<div class="grid gap-6 sm:grid-cols-2">
        <div><label class="text-xs font-bold uppercase tracking-[.2em] text-sable" for="nom">Nom</label><input id="nom" autocomplete="name" value="${esc(etat.nom || '')}" class="${champ}" placeholder="Votre nom"></div>
        <div><label class="text-xs font-bold uppercase tracking-[.2em] text-sable" for="tel">Téléphone</label><input id="tel" type="tel" autocomplete="tel" value="${esc(etat.tel || '')}" class="${champ}" placeholder="06 12 34 56 78"></div>
        <div class="sm:col-span-2"><label class="text-xs font-bold uppercase tracking-[.2em] text-sable" for="mail">E-mail <span class="font-normal normal-case tracking-normal text-white/45">(facultatif)</span></label><input id="mail" type="email" autocomplete="email" value="${esc(etat.mail || '')}" class="${champ}" placeholder="vous@exemple.fr"></div>
        <div class="sm:col-span-2"><label class="text-xs font-bold uppercase tracking-[.2em] text-sable" for="mot">Un mot pour nous <span class="font-normal normal-case tracking-normal text-white/45">(facultatif)</span></label><textarea id="mot" rows="3" class="${champ} resize-none" placeholder="${esc(D.motExemple)}">${esc(etat.mot || '')}</textarea></div>
      </div>`,
  };

  // Salles : capacité choisie, et la plus petite combinaison qui accueille le groupe
  const personnes = () => { const e = D.etapes.find((x) => x.type === 'nombre'); return e ? etat[e.id] : 0; };
  const capacite = (e) => e.salles.filter((sa) => etat[e.id].includes(sa.nom)).reduce((t, sa) => t + sa.max, 0);
  const suggestion = (e, n) => {
    let mieux = null;
    for (let m = 1; m < 1 << e.salles.length; m++) {
      const lot = e.salles.filter((_, k) => m & (1 << k)), min = lot.reduce((t, sa) => t + sa.min, 0), max = lot.reduce((t, sa) => t + sa.max, 0);
      if (n < min || n > max) continue;
      if (!mieux || lot.length < mieux.lot.length || (lot.length === mieux.lot.length && max < mieux.max)) mieux = { lot, max };
    }
    return (mieux ? mieux.lot : e.salles).map((sa) => sa.nom);
  };
  // Estimation : tarif par personne, selon que la date tombe en semaine ou le week-end
  const estimation = () => {
    if (!D.tarif || !etat.date || !personnes()) return '';
    // Pointe : arrivée à 19 h ou plus tard le vendredi ou le samedi
    const j = new Date(etat.date + 'T12:00').getDay(), we = j === 0 || j === 6, h = parseInt(etat.moment, 10), soir = etat.moment && !(h < 19);
    const pointe = D.tarif.pointe && soir && (j === 5 || j === 6), prix = pointe ? D.tarif.pointe : we ? D.tarif.weekend : D.tarif.semaine;
    const n = personnes(), lignes = [`${n} × ${prix} €, tarif ${pointe ? 'vendredi et samedi soir' : we ? 'week-end' : 'semaine'}`];
    let total = n * prix;
    // Ce que la table ajoute, aux prix de la carte
    const table = D.etapes.flatMap((e) => e.choix || []).find((c) => c.ajout && Object.values(etat).includes(c.nom));
    if (table) { const q = table.ajout.pour ? Math.ceil(n / table.ajout.pour) : n; total += q * table.ajout.prix; lignes.push(`${q} × ${table.ajout.prix} € ${table.ajout.quoi}`); }
    return `${total} € (${lignes.join(' + ')})`;
  };

  // Ce que chaque étape apporte au récapitulatif
  const valeur = (e) => {
    if (e.type === 'cartes') return etat[e.id] || '';
    if (e.type === 'multi') return etat[e.id].join(', ');
    if (e.type === 'nombre') return `${etat[e.id]} ${e.unite}`;
    if (e.type === 'salles') return etat[e.id].join(', ');
    if (e.type === 'date') return [etat.date ? dateLisible(etat.date) : '', etat.moment, etat.flexible ? 'date flexible' : ''].filter(Boolean).join(' · ');
    if (e.type === 'contact') return [etat.nom, etat.tel, etat.mail].filter(Boolean).join(' · ');
    return '';
  };
  const erreur = (e) => {
    if (e.type === 'cartes' && !etat[e.id]) return 'Choisissez une option pour continuer.';
    if (e.type === 'nombre' && !(etat[e.id] >= e.min && etat[e.id] <= e.max)) return `Indiquez un nombre entre ${e.min} et ${e.max}.`;
    if (e.type === 'salles') {
      const n = personnes(), min = e.salles.filter((sa) => etat[e.id].includes(sa.nom)).reduce((t, sa) => t + sa.min, 0);
      if (!etat[e.id].length) return 'Choisissez au moins une salle.';
      if (n > capacite(e)) return `Ces salles accueillent ${capacite(e)} personnes au maximum : ajoutez une salle.`;
      if (n < min) return `Il faut au moins ${min} personnes pour ces salles : retirez-en une.`;
    }
    if (e.type === 'date') {
      if (!etat.date) return 'Choisissez une date.';
      if (etat.date < aujourdhui) return 'Cette date est déjà passée.';
      if (!etat.moment) return 'Précisez le moment.';
    }
    if (e.type === 'contact') {
      if (!etat.nom || etat.nom.trim().length < 2) return 'Indiquez votre nom.';
      if ((etat.tel || '').replace(/\D/g, '').length < 9) return 'Indiquez un numéro de téléphone valide.';
      if (etat.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(etat.mail)) return 'Cet e-mail ne semble pas valide.';
    }
    return '';
  };
  const lire = () => {
    ['nom', 'tel', 'mail', 'mot', 'date'].forEach((k) => { if ($(k)) etat[k] = $(k).value; });
    if ($('flexible')) etat.flexible = $('flexible').checked;
    const e = D.etapes[i];
    if ($('nb') && e) etat[e.id] = parseInt($('nb').value, 10) || 0;
  };
  const texte = () => [D.intro, '', ...D.etapes.map((e) => `${e.resume} : ${valeur(e) || '-'}`), estimation() ? `Estimation : ${estimation()}` : '', etat.mot ? `\nMessage : ${etat.mot}` : ''].join('\n').trim();

  const billet = () => {
    $('billet').innerHTML = D.etapes.map((e, k) => { const v = valeur(e); const fait = k < i || (k === i && v && e.type !== 'contact');
      return `<div class="flex items-baseline gap-3 border-b border-or/25 py-2.5 ${fait ? '' : 'opacity-40'}"><dt class="w-24 shrink-0 text-[.62rem] font-bold uppercase tracking-[.18em] text-or">${esc(e.resume)}</dt><dd class="font-serif text-lg font-semibold leading-tight text-nuit">${fait && v ? esc(v) : '…'}</dd></div>`; }).join('') + (estimation() ? `<div class="mt-3 bg-bordeaux px-4 py-3 text-center text-white"><dt class="text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Estimation</dt><dd class="font-serif text-2xl font-semibold">${esc(estimation().split(' (')[0])}</dd><dd class="text-xs text-white/75">${esc(estimation().split(' (')[1].replace(')', ''))}</dd></div>` : '');
  };

  const afficher = (sens = 1) => {
    const fin = i >= D.etapes.length;
    $('barre').style.width = `${(Math.min(i, D.etapes.length) / D.etapes.length) * 100}%`;
    $('compteur').textContent = fin ? 'Prêt à envoyer' : `Étape ${i + 1} sur ${D.etapes.length}`;
    $('retour').classList.toggle('invisible', i === 0);
    $('suite').classList.toggle('hidden', fin);
    const z = $('etape');
    if (fin) {
      const sujet = encodeURIComponent(D.sujet), corps = encodeURIComponent(texte());
      z.innerHTML = `<p class="font-serif text-6xl text-sable" aria-hidden="true">✦</p>
        <h2 class="mt-4 font-serif text-4xl font-semibold leading-none sm:text-6xl" tabindex="-1" id="titre">${esc(D.finTitre)}</h2>
        <p class="mt-5 max-w-xl leading-relaxed text-white/75">${esc(D.finTexte)}</p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="mailto:${D.email}?subject=${sujet}&body=${corps}" class="btn inline-flex items-center justify-center bg-bordeaux text-white hover:bg-terre">Envoyer ma demande</a>
          <button type="button" id="copier" class="btn inline-flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-nuit">Copier le récapitulatif</button>
        </div>
        <p class="mt-6 text-sm text-white/55">Le bouton ouvre votre messagerie avec la demande déjà rédigée, à l’adresse ${D.email}. Vous préférez la voix ? <a class="lien text-sable" href="tel:+33180871315">01 80 87 13 15</a></p>`;
      $('copier').addEventListener('click', async () => { try { await navigator.clipboard.writeText(texte()); $('copier').textContent = 'Copié ✓'; } catch { $('copier').textContent = 'Copie impossible'; } });
    } else {
      const e = D.etapes[i];
      if (e.type === 'salles' && !etat.sallesChoisies) etat[e.id] = suggestion(e, personnes());
      z.innerHTML = `<p class="font-serif text-xl italic text-sable">${esc(e.surtitre)}</p>
        <h2 class="mt-2 font-serif text-4xl font-semibold leading-none sm:text-6xl" tabindex="-1" id="titre">${esc(e.question)}</h2>
        <div class="mt-9">${rendus[e.type](e)}</div><p id="erreur" role="alert" class="mt-5 min-h-[1.5rem] text-sm font-semibold text-[#ffb4a8]"></p>`;
    }
    z.animate([{ opacity: 0, transform: `translateX(${24 * sens}px)` }, { opacity: 1, transform: 'none' }], { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320, easing: 'ease-out' });
    billet();
  };

  const avancer = () => { lire(); const e = D.etapes[i]; const err = erreur(e); if (err) { $('erreur').textContent = err; return; } i += 1; afficher(1); $('titre').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  $('etape').addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return; const e = D.etapes[i]; if (!e) return;
    lire();
    if (b.dataset.val !== undefined && e.type === 'cartes') { etat[e.id] = b.dataset.val; afficher(0); setTimeout(avancer, 260); return; }
    if (b.dataset.val !== undefined && e.type === 'multi') { const l = etat[e.id], v = b.dataset.val; etat[e.id] = l.includes(v) ? l.filter((x) => x !== v) : [...l, v]; }
    if (b.dataset.pas) etat[e.id] = Math.max(e.min, Math.min(e.max, (etat[e.id] || 0) + Number(b.dataset.pas)));
    if (b.dataset.fixe) etat[e.id] = Number(b.dataset.fixe);
    if (b.dataset.salle) { const l = etat[e.id], v = b.dataset.salle; etat[e.id] = l.includes(v) ? l.filter((x) => x !== v) : [...l, v]; etat.sallesChoisies = true; }
    if (b.dataset.moment) etat.moment = b.dataset.moment;
    if (b.id !== 'copier') afficher(0);
  });
  $('etape').addEventListener('input', () => { lire(); billet(); });
  $('etape').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') { ev.preventDefault(); avancer(); } });
  $('suite').addEventListener('click', avancer);
  $('retour').addEventListener('click', () => { lire(); i = Math.max(0, i - 1); afficher(-1); });
  afficher(0);
})();
