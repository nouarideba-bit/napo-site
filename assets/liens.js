// Filet de secours pour les liens qui ne peuvent pas s'ouvrir partout (aperçus intégrés,
// navigateurs des applications) : cartes PDF lues dans la page, nouvel onglet bloqué,
// messagerie absente.
(() => {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  // Les pages de chaque PDF, en images, pour la visionneuse
  const PAGES = {
    'napo-u-spuntinu.pdf': ['u-spuntinu-1'],
    'napo-carte.pdf': ['carte-1', 'carte-2'],
    'napo-menus-degustation.pdf': ['menus-degustation-1'],
    'napo-vins-boissons.pdf': ['vins-corses', 'vins-blancs', 'vins-rouges', 'vins-roses-champagnes', 'boissons'],
  };

  let dernierFocus = null;
  const fermer = () => { const f = document.getElementById('napo-fenetre'); if (f) f.remove(); document.documentElement.style.overflow = ''; if (dernierFocus) dernierFocus.focus(); };
  const fenetre = (contenu, large) => {
    fermer(); dernierFocus = document.activeElement;
    const f = document.createElement('div');
    f.id = 'napo-fenetre';
    f.setAttribute('role', 'dialog'); f.setAttribute('aria-modal', 'true');
    f.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(23,23,20,.82);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px';
    f.innerHTML = `<div style="position:relative;width:100%;max-width:${large ? '760px' : '440px'};margin:auto;background:#fffaf0;color:#17203a;padding:${large ? '56px 16px 20px' : '32px 24px 24px'};font-family:Manrope,system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.5)">
      <button type="button" data-fermer aria-label="Fermer" style="position:absolute;top:10px;right:10px;width:40px;height:40px;font-size:26px;line-height:1;color:#650305;background:none;border:0;cursor:pointer">×</button>${contenu}</div>`;
    f.addEventListener('click', (e) => { if (e.target === f || e.target.closest('[data-fermer]')) fermer(); });
    document.body.appendChild(f); document.documentElement.style.overflow = 'hidden';
    f.querySelector('[data-fermer]').focus();
    return f;
  };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });

  const bouton = (txt, plein) => `style="display:inline-flex;align-items:center;justify-content:center;padding:.8rem 1.2rem;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;cursor:pointer;${plein ? 'background:#650305;color:#fff;border:1px solid #650305' : 'background:#fff;color:#17203a;border:1px solid rgba(23,32,58,.3)'}"`;
  // Copie : presse-papiers si permis, sinon le texte reste sélectionné dans le champ
  const copier = async (champ, btn) => {
    champ.select(); let ok = false;
    try { await navigator.clipboard.writeText(champ.value); ok = true; } catch { try { ok = document.execCommand('copy'); } catch { ok = false; } }
    btn.textContent = ok ? 'Copié ✓' : 'Sélectionné : faites Cmd/Ctrl + C';
  };
  const blocCopie = (valeur, libelle) => `<div style="margin-top:14px;display:flex;gap:8px"><input readonly value="${esc(valeur)}" aria-label="${esc(libelle)}" style="flex:1;min-width:0;border:1px solid rgba(23,32,58,.25);padding:.6rem .7rem;font-size:.9rem;background:#fff"><button type="button" data-copier ${bouton('Copier')}>Copier</button></div>`;
  const brancherCopie = (f) => f.querySelectorAll('[data-copier]').forEach((b) => b.addEventListener('click', () => copier(b.previousElementSibling, b)));

  // 1. Cartes PDF : visionneuse dans la page
  const visionneuse = (a) => {
    const nom = a.getAttribute('href').split('/').pop(), pages = PAGES[nom];
    if (!pages) return false;
    const titre = a.textContent.replace(/\(PDF\)/i, '').trim();
    fenetre(`<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:2rem;font-weight:600;color:#650305;text-align:center;margin:0 0 16px">${esc(titre)}</p>
      ${pages.map((p, k) => `<img src="assets/img/cartes/${p}.jpg" alt="${esc(titre)}, page ${k + 1}" style="display:block;width:100%;height:auto;margin:0 0 14px;border:1px solid #cab990">`).join('')}
      <div style="display:flex;justify-content:center;margin-top:8px"><a href="${esc(a.getAttribute('href'))}" download ${bouton('', true)}>Télécharger le PDF</a></div>`, true);
    return true;
  };

  // 2. Nouvel onglet bloqué : solutions de rechange
  const secoursLien = (url, libelle) => {
    const zenchef = /zenchef/.test(url), plan = /google\.[a-z]+\/maps/.test(url);
    const f = fenetre(`<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.8rem;font-weight:600;color:#650305;margin:0">${zenchef ? 'Réserver une table' : 'Ce lien ne s’ouvre pas ici'}</p>
      <p style="margin:.5rem 0 0;font-size:.95rem;line-height:1.5;color:rgba(23,32,58,.8)">${zenchef ? 'La réservation en ligne ne peut pas s’ouvrir depuis cette fenêtre. Appelez-nous, ou ouvrez le lien autrement.' : plan ? 'Le plan ne peut pas s’ouvrir depuis cette fenêtre. Voici l’adresse : 4-6 rue Pierre Demours, 75017 Paris, métro Ternes ou Argentine.' : 'Cette fenêtre bloque l’ouverture d’un nouvel onglet.'}</p>
      <div style="display:grid;gap:8px;margin-top:16px">
        ${zenchef ? `<a href="tel:+33180871315" ${bouton('', true)}>Appeler le 01 80 87 13 15</a>` : ''}
        <a href="${esc(url)}" target="_top" ${bouton('', !zenchef)}>Ouvrir dans cette page</a>
      </div>
      <p style="margin:16px 0 0;font-size:.8rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a27a39">${plan ? 'Ou copiez l’adresse' : 'Ou copiez le lien'}</p>
      ${blocCopie(plan ? '4-6 rue Pierre Demours, 75017 Paris' : url, libelle || 'Lien')}`);
    brancherCopie(f);
  };

  // 3. E-mail : l'adresse, copiable
  const secoursMail = (href) => {
    const adresse = decodeURIComponent(href.replace(/^mailto:/, '').split('?')[0]);
    const corps = new URLSearchParams(href.split('?')[1] || '').get('body');
    const f = fenetre(`<p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.8rem;font-weight:600;color:#650305;margin:0">Écrivez-nous</p>
      <p style="margin:.5rem 0 0;font-size:.95rem;line-height:1.5;color:rgba(23,32,58,.8)">Votre messagerie ne s’est pas ouverte ? Copiez l’adresse${corps ? ' et le message, puis collez-les' : ', puis collez-la'} dans votre e-mail.</p>
      ${blocCopie(adresse, 'Adresse e-mail')}
      ${corps ? `<textarea readonly rows="6" aria-label="Message" style="margin-top:10px;width:100%;border:1px solid rgba(23,32,58,.25);padding:.6rem .7rem;font-size:.85rem;background:#fff;resize:vertical">${esc(corps)}</textarea><button type="button" data-copier-texte ${bouton('Copier le message')}>Copier le message</button>` : ''}
      <div style="display:grid;gap:8px;margin-top:16px"><a href="tel:+33180871315" ${bouton('', true)}>Ou appeler le 01 80 87 13 15</a></div>`);
    brancherCopie(f);
    const bt = f.querySelector('[data-copier-texte]'); if (bt) { bt.style.marginTop = '8px'; bt.addEventListener('click', () => copier(f.querySelector('textarea'), bt)); }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (a.closest('#napo-fenetre')) return;
    const href = a.getAttribute('href');
    if (/\.pdf($|[?#])/i.test(href)) { if (visionneuse(a)) e.preventDefault(); return; }
    if (href.startsWith('mailto:')) {
      // Le formulaire pas à pas a déjà son propre écran de secours
      if (a.id === 'envoyer') return;
      // Si la messagerie s'ouvre, la page perd le focus ou passe en arrière-plan : sinon, on affiche l'adresse
      let parti = false; const marque = () => { parti = true; };
      window.addEventListener('blur', marque, { once: true }); document.addEventListener('visibilitychange', marque, { once: true });
      setTimeout(() => { window.removeEventListener('blur', marque); document.removeEventListener('visibilitychange', marque); if (!parti) secoursMail(href); }, 1200);
      return;
    }
    if (a.target === '_blank' && /^https?:/.test(href)) {
      e.preventDefault();
      let w = null; try { w = window.open(href, '_blank'); } catch { w = null; }
      if (w) { try { w.opener = null; } catch { /* rien */ } } else secoursLien(href, a.textContent.trim());
    }
  });
})();
