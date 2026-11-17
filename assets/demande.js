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
      return `<div class="grid gap-3 sm:grid-cols-${e.salles.length}" role="group" aria-label="Salles">${e.salles.map((sa) => { const a = etat[e.id].includes(sa.nom); return `<button type="button" data-salle="${esc(sa.nom)}" aria-pressed="${a}" class="group relative flex min-h-[13rem] flex-col justify-end overflow-hidden border text-left transition duration-300 hover:-translate-y-1 ${a ? 'border-sable shadow-[0_0_40px_-8px_#a83c2d]' : 'border-white/15 hover:border-sable/60'}">
          ${sa.photo ? `<img src="${sa.photo}" alt="" class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${a ? '' : 'opacity-45 grayscale-[.4]'}">` : ''}
          <span class="absolute inset-0 bg-gradient-to-t from-encre via-encre/60 to-transparent"></span>
          <span class="absolute right-3 top-3 grid h-7 w-7 place-items-center border text-sm ${a ? 'border-sable bg-sable text-nuit' : 'border-white/50 bg-encre/50 text-transparent'}" aria-hidden="true">✓</span>
          <span class="relative block p-4">
            <span class="block font-serif text-2xl font-semibold leading-tight text-white">${esc(sa.nom)}</span>
            <span class="block text-sm text-white/80">${sa.min} à ${sa.max} personnes</span>
            <span class="mt-1 block min-h-[1rem] text-[.65rem] font-bold uppercase tracking-[.2em] text-sable">${a ? 'Pour vous' : conseil.includes(sa.nom) ? 'Conseillée' : ''}</span>
          </span></button>`; }).join('')}</div>
      <p class="mt-5 font-serif text-xl text-sable">${etat[e.id].length ? `${etat[e.id].length} salle${etat[e.id].length > 1 ? 's' : ''} · jusqu’à ${cap} personnes` : 'Aucune salle choisie'} <span class="text-white/55">pour votre groupe de ${n}</span></p>`; },
    date: (e) => `<label class="block text-xs font-bold uppercase tracking-[.2em] text-sable" for="date">Date souhaitée</label>
      <input id="date" type="date" min="${aujourdhui}" value="${etat.date || ''}" class="${champ} [color-scheme:dark]">
      <p class="mt-8 text-xs font-bold uppercase tracking-[.2em] text-sable">${esc(e.libelleMoment)}</p>
      <div class="mt-3 flex flex-wrap gap-2">${e.moments.map((m) => `<button type="button" data-moment="${esc(m)}" aria-pressed="${etat.moment === m}" class="border px-5 py-3 text-sm font-semibold transition ${etat.moment === m ? 'border-sable bg-sable text-nuit' : 'border-white/20 hover:border-sable hover:text-sable'}">${esc(m)}</button>`).join('')}</div>
      <label class="mt-8 flex cursor-pointer items-center gap-3 text-white/75"><input id="flexible" type="checkbox" ${etat.flexible ? 'checked' : ''} class="h-5 w-5 border-white/40 bg-transparent text-bordeaux focus:ring-sable"> Je suis flexible sur la date</label>${D.tarif ? `<p class="mt-6 text-sm leading-relaxed text-white/60">${esc(D.tarif.note)}</p>` : ''}`,
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
    if (!D.tarif || !personnes() || (!etat.date && !etat.flexible)) return '';
    // Pointe : arrivée à 19 h ou plus tard le vendredi ou le samedi
    const j = etat.date ? new Date(etat.date + 'T12:00').getDay() : 1, we = j === 0 || j === 6, h = parseInt(etat.moment, 10), soir = etat.moment && !(h < 19);
    const pointe = D.tarif.pointe && soir && (j === 5 || j === 6), prix = pointe ? D.tarif.pointe : we ? D.tarif.weekend : D.tarif.semaine;
    const n = personnes(), duree = D.etapes.flatMap((e) => e.choix || []).find((c) => c.heures && Object.values(etat).includes(c.nom)), h1 = duree ? duree.heures : 1;
    const lignes = [`${n} × ${prix} €${h1 > 1 ? ` × ${h1} h` : ''}, tarif ${pointe ? 'vendredi et samedi soir' : we ? 'samedi' : 'semaine'}${etat.date ? '' : ', date à préciser'}`];
    let total = n * prix * h1;
    // Ce que la table ajoute, aux prix de la carte
    const table = D.etapes.flatMap((e) => e.choix || []).find((c) => c.ajout && Object.values(etat).includes(c.nom));
    if (table) { const q = table.ajout.pour ? Math.ceil(n / table.ajout.pour) : n; total += q * table.ajout.prix; lignes.push(`${q} × ${table.ajout.prix} € ${table.ajout.quoi}`); }
    dernierTotal = total;
    return `${total} € (${lignes.join(' + ')})`;
  };
  let dernierTotal = 0;
  // Annulation gratuite : jusqu'à N heures avant l'heure d'arrivée
  const limiteAnnulation = () => {
    if (!D.conditions || !etat.date) return D.conditions ? '72 h avant la date convenue' : '';
    const h = parseInt(etat.moment, 10), d = new Date(`${etat.date}T${String(isNaN(h) ? 14 : h).padStart(2, '0')}:00`);
    d.setHours(d.getHours() - D.conditions.annulationHeures);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' à ' + d.getHours() + ' h';
  };
  // Addition partagée : la part de chacun, et le message à envoyer au groupe
  const part = () => { estimation(); const n = personnes(); return n ? Math.ceil((dernierTotal / n) * 100) / 100 : 0; };
  const euros = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace('.', ',')) + ' €';
  const lienPaiement = () => {
    const ok = (u) => (/^https:\/\/buy\.stripe\.com\//.test(u || '') ? u : ''), l = (D.conditions && D.conditions.paiement) || {}, j = etat.date ? new Date(etat.date + 'T12:00').getDay() : 1, h = parseInt(etat.moment, 10);
    return ok((j === 5 || j === 6) && !(h < 19) ? l.pointe : j === 6 ? l.weekend : l.semaine);
  };
  const messageGroupe = () => [`${etat.nom || 'On'} nous réserve une salle Amuzetoi au NAPO (4-6 rue Pierre Demours, Paris 17).`, `${etat.date ? dateLisible(etat.date) : 'Date à fixer ensemble'}, ${etat.moment}.`, `Ta part : ${euros(part())} (${personnes()} personnes, total ${euros(dernierTotal)}).`, lienPaiement() ? `Pour payer ta part : ${lienPaiement()}` : 'Le lien de paiement arrive avec la confirmation du NAPO.', `Annulation gratuite ${etat.date ? 'jusqu’au ' : ''}${limiteAnnulation()}.`].join('\n');

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
      if (!etat.date && !etat.flexible) return 'Choisissez une date, ou cochez « Je suis flexible sur la date ».';
      if (etat.date && etat.date < aujourdhui) return 'Cette date est déjà passée.';
      if (etat.date && (e.joursFermes || []).includes(new Date(etat.date + 'T12:00').getDay())) return e.messageFerme;
      if (!etat.moment) return 'Choisissez une heure.';
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
  const texte = () => [D.intro, '', ...D.etapes.map((e) => `${e.resume} : ${valeur(e) || '-'}`), estimation() ? `Estimation : ${estimation()}` : '', D.conditions && estimation() ? `Paiement partagé : ${euros(part())} par personne\nAnnulation gratuite ${etat.date ? 'jusqu’au ' : ''}${limiteAnnulation()}` : '', etat.mot ? `\nMessage : ${etat.mot}` : ''].join('\n').trim();

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
          <a href="mailto:${D.email}?subject=${sujet}&body=${corps}" id="envoyer" class="btn inline-flex items-center justify-center bg-bordeaux text-white hover:bg-terre">Envoyer ma demande</a>
          <button type="button" id="copier" class="btn inline-flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-nuit">Copier le récapitulatif</button>
        </div>
        ${D.conditions ? `<div class="mt-8 grid gap-3 sm:grid-cols-3">
          <div class="border border-white/15 bg-white/[.04] p-4"><p class="text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Paiement partagé</p><p class="mt-1 font-serif text-3xl font-semibold">${euros(part())}</p><p class="text-sm text-white/65">par personne, pour ${personnes()}</p></div>
          <div class="border border-white/15 bg-white/[.04] p-4"><p class="text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Annulation gratuite</p><p class="mt-1 font-serif text-xl font-semibold leading-tight">${etat.date ? 'jusqu’au ' : ''}${limiteAnnulation()}</p><p class="text-sm text-white/65">${etat.date ? `${D.conditions.annulationHeures} h avant votre arrivée` : 'date à fixer avec le NAPO'}</p></div>
          <div class="border border-white/15 bg-white/[.04] p-4"><p class="text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Prolongation</p><p class="mt-1 font-serif text-xl font-semibold leading-tight">possible sur place</p><p class="text-sm text-white/65">selon les disponibilités</p></div>
        </div>
        <div class="mt-4 border border-sable/50 bg-sable/10 p-5">
          <p class="font-serif text-2xl font-semibold">Partagez l’addition avec votre groupe</p>
          <p class="mt-1 text-sm text-white/70">Envoyez à chacun sa part de ${euros(part())}${lienPaiement() ? ' et le lien pour la payer' : ''}. ${lienPaiement() ? '' : 'Le lien de paiement vous est envoyé avec la confirmation.'}</p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="button" id="partager" class="btn inline-flex items-center justify-center bg-sable text-nuit hover:bg-white">Envoyer à mes amis</button>
            ${lienPaiement() ? `<a href="${lienPaiement()}" target="_blank" rel="noopener" class="btn inline-flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-nuit">Payer ma part</a>` : `<span class="btn inline-flex cursor-not-allowed items-center justify-center border border-white/20 text-white/45" aria-disabled="true">Payer ma part · bientôt en ligne</span>`}
          </div>
        </div>` : ''}
        <div id="apres" class="mt-8 hidden border border-sable bg-encre/80 p-6" role="status" tabindex="-1">
          <p class="font-serif text-3xl font-semibold">Votre messagerie s’est ouverte ?</p>
          <p class="mt-2 text-white/75">Appuyez sur « Envoyer » dans le message déjà rédigé. C’est tout.</p>
          <ol class="mt-5 grid gap-3 sm:grid-cols-3">
            <li class="border-l-2 border-sable pl-3"><span class="block text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Sous 24 h</span><span class="text-sm text-white/80">Le NAPO confirme la disponibilité par téléphone ou par e-mail.</span></li>
            <li class="border-l-2 border-sable pl-3"><span class="block text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Ensuite</span><span class="text-sm text-white/80">${D.conditions ? 'Vous recevez le lien de paiement, à partager avec votre groupe.' : 'On construit ensemble le déroulé de votre événement.'}</span></li>
            <li class="border-l-2 border-sable pl-3"><span class="block text-[.62rem] font-bold uppercase tracking-[.18em] text-sable">Le jour J</span><span class="text-sm text-white/80">Rendez-vous au 4-6 rue Pierre Demours, métro Ternes ou Argentine.</span></li>
          </ol>
          <p class="mt-6 font-serif text-xl font-semibold">Rien ne s’est ouvert ?</p>
          <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${D.email}&su=${sujet}&body=${corps}" target="_blank" rel="noopener" class="btn inline-flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-nuit">Envoyer avec Gmail</a>
            <a href="https://outlook.live.com/mail/0/deeplink/compose?to=${D.email}&subject=${sujet}&body=${corps}" target="_blank" rel="noopener" class="btn inline-flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-nuit">Envoyer avec Outlook</a>
            <a href="tel:+33180871315" class="btn inline-flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-nuit">Appeler le 01 80 87 13 15</a>
          </div>
          <p class="mt-3 text-sm text-white/60">Ou copiez le récapitulatif et envoyez-le à <a class="lien text-sable" href="mailto:${D.email}">${D.email}</a>.</p>
          ${etat.date ? `<button type="button" id="agenda" class="lien mt-5 text-[.72rem] font-bold uppercase tracking-[.16em] text-sable">+ Ajouter à mon agenda</button>` : ''}
        </div>
        <p class="mt-6 text-sm text-white/55">Le bouton ouvre votre messagerie avec la demande déjà rédigée, à l’adresse ${D.email}. Vous préférez la voix ? <a class="lien text-sable" href="tel:+33180871315">01 80 87 13 15</a></p>`;
      if ($('partager')) $('partager').addEventListener('click', async () => {
        const text = messageGroupe();
        try { if (navigator.share) await navigator.share({ title: 'Amuzetoi au NAPO', text }); else { await navigator.clipboard.writeText(text); $('partager').textContent = 'Message copié ✓'; } } catch { /* partage annulé */ }
      });
      $('envoyer').addEventListener('click', () => { setTimeout(() => { $('apres').classList.remove('hidden'); $('apres').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('apres').focus({ preventScroll: true }); }, 400); });
      if ($('agenda')) $('agenda').addEventListener('click', () => {
        // Fichier .ics : le créneau demandé, à confirmer par le NAPO
        const h = parseInt(etat.moment, 10), debut = `${etat.date.replace(/-/g, '')}T${String(isNaN(h) ? 19 : h).padStart(2, '0')}0000`;
        const duree = D.etapes.flatMap((x) => x.choix || []).find((c) => c.heures && Object.values(etat).includes(c.nom)), fin = `${etat.date.replace(/-/g, '')}T${String(Math.min(23, (isNaN(h) ? 19 : h) + (duree ? duree.heures : 2))).padStart(2, '0')}0000`;
        const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NAPO//Reservation//FR', 'BEGIN:VEVENT', `UID:${Date.now()}@lenapo.fr`, `DTSTART;TZID=Europe/Paris:${debut}`, `DTEND;TZID=Europe/Paris:${fin}`, `SUMMARY:${D.sujet} (à confirmer)`, 'LOCATION:NAPO\\, 4-6 rue Pierre Demours\\, 75017 Paris', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'napo.ics' }); a.click();
      });
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
    if (b.id !== 'copier' && b.id !== 'partager') afficher(0);
  });
  $('etape').addEventListener('input', () => { lire(); billet(); });
  $('etape').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') { ev.preventDefault(); avancer(); } });
  $('suite').addEventListener('click', avancer);
  $('retour').addEventListener('click', () => { lire(); i = Math.max(0, i - 1); afficher(-1); });
  afficher(0);
})();
