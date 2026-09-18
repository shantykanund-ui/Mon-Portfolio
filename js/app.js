/**
 * app.js — Portfolio Chantal Kamin Kanund
 *
 * JavaScript natif uniquement, aucune dépendance externe.
 * Fonctionnalités :
 *   1. Header sticky (fond apparaît après 24px de scroll)
 *   2. Menu burger mobile (ouverture / fermeture, accessibilité clavier)
 *   3. Scroll fluide vers les sections au clic sur les liens d'ancre
 *   4. Validation du formulaire de contact (sans alert())
 *      – champs requis + format e-mail
 *      – messages d'erreur affichés sous chaque champ
 *      – message de succès à la place du formulaire après envoi
 *
 * Ce fichier est chargé avec l'attribut `defer` dans le HTML,
 * il s'exécute donc après le parsing complet du DOM.
 */

/* ═══════════════════════════════════════════════════════════
   UTILITAIRES PARTAGÉS
═══════════════════════════════════════════════════════════ */

/**
 * Défile en douceur vers la section ciblée par l'ancre.
 * @param {string} ancre — ex. "#projets" ou "projets"
 */
function defileVers(ancre) {
  /* On retire le '#' si présent pour obtenir l'id */
  const id = ancre.replace('#', '');
  const cible = document.getElementById(id);
  if (cible) {
    cible.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Vérifie qu'une adresse e-mail a un format minimal acceptable.
 * @param {string} valeur
 * @returns {boolean}
 */
function emailValide(valeur) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim());
}

/* ═══════════════════════════════════════════════════════════
   1. HEADER STICKY — fond translucide après scroll
═══════════════════════════════════════════════════════════ */
(function initHeaderScroll() {
  const header = document.getElementById('entete');
  if (!header) return;

  /* Seuil en pixels à partir duquel le fond apparaît */
  const SEUIL = 24;

  function majHeader() {
    if (window.scrollY > SEUIL) {
      header.classList.add('scrolle');
    } else {
      header.classList.remove('scrolle');
    }
  }

  window.addEventListener('scroll', majHeader, { passive: true });
  /* Applique l'état au chargement (si la page est déjà scrollée) */
  majHeader();
})();

/* ═══════════════════════════════════════════════════════════
   2. MENU BURGER MOBILE
═══════════════════════════════════════════════════════════ */
(function initMenuBurger() {
  const btnBurger  = document.getElementById('btn-burger');
  const menuMobile = document.getElementById('menu-mobile');
  if (!btnBurger || !menuMobile) return;

  let menuOuvert = false;

  /**
   * Ouvre ou ferme le menu mobile.
   * Met à jour aria-expanded et la classe CSS `.ouvert`.
   * Bloque / restaure le scroll de la page.
   * Active / désactive la tabulation des liens.
   */
  function basculerMenu() {
    menuOuvert = !menuOuvert;

    /* Attribut ARIA pour les technologies d'assistance */
    btnBurger.setAttribute('aria-expanded', String(menuOuvert));
    btnBurger.setAttribute(
      'aria-label',
      menuOuvert ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'
    );

    /* Classe CSS qui déclenche l'animation de glissement */
    menuMobile.classList.toggle('ouvert', menuOuvert);

    /* Empêche le scroll de la page sous l'overlay */
    document.body.style.overflow = menuOuvert ? 'hidden' : '';

    /* Accessibilité : les liens du menu ne doivent être tabulables
       que lorsque le menu est visible */
    const liensMenu = menuMobile.querySelectorAll('a');
    liensMenu.forEach(function(lien) {
      lien.setAttribute('tabindex', menuOuvert ? '0' : '-1');
    });

    /* Si le menu vient d'ouvrir, place le focus sur le premier lien */
    if (menuOuvert) {
      const premierLien = menuMobile.querySelector('a');
      if (premierLien) {
        /* Petit délai pour laisser l'animation démarrer */
        setTimeout(function() { premierLien.focus(); }, 50);
      }
    }
  }

  /** Ferme le menu et renvoie le focus sur le burger */
  function fermerMenu() {
    if (!menuOuvert) return;
    basculerMenu();
    btnBurger.focus();
  }

  /* Clic sur le burger */
  btnBurger.addEventListener('click', basculerMenu);

  /* Touche Échap pour fermer le menu */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuOuvert) {
      fermerMenu();
    }
  });

  /* Ferme le menu si la fenêtre est redimensionnée en mode desktop */
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 900 && menuOuvert) {
      fermerMenu();
    }
  });

  /* Clic sur un lien du menu mobile : ferme + défile */
  const liensMenu = menuMobile.querySelectorAll('a');
  liensMenu.forEach(function(lien) {
    lien.addEventListener('click', function(e) {
      const href = lien.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        fermerMenu();
        /* On attend la fin de l'animation de fermeture du menu
           (300 ms, cf. CSS) avant de défiler */
        setTimeout(function() { defileVers(href); }, 320);
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   3. SCROLL FLUIDE — liens d'ancre dans le header et le footer
═══════════════════════════════════════════════════════════ */
(function initScrollFluide() {
  /* Tous les liens dont href commence par "#" (hors menu mobile,
     déjà géré ci-dessus) */
  const liensAncres = document.querySelectorAll(
    'header a[href^="#"], footer a[href^="#"], .hero-cta-groupe a[href^="#"], .projets-entete a[href^="#"]'
  );

  liensAncres.forEach(function(lien) {
    lien.addEventListener('click', function(e) {
      const href = lien.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        defileVers(href);
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   4. FORMULAIRE DE CONTACT — validation et retour visuel
═══════════════════════════════════════════════════════════ */
(function initFormContact() {
  const form        = document.getElementById('form-contact');
  const msgSucces   = document.getElementById('msg-succes');
  const btnEnvoyer  = document.getElementById('btn-envoyer');

  if (!form || !msgSucces || !btnEnvoyer) return;

  /* Champs */
  const champNom     = document.getElementById('champ-nom');
  const champEmail   = document.getElementById('champ-email');
  const champMessage = document.getElementById('champ-message');

  /* Zones d'erreur */
  const errNom     = document.getElementById('err-nom');
  const errEmail   = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');

  /**
   * Affiche (ou efface) un message d'erreur sous un champ.
   * @param {HTMLElement} champ     — l'input ou textarea
   * @param {HTMLElement} zoneErr   — le <span> qui reçoit le message
   * @param {string}      message   — texte à afficher ('' pour effacer)
   */
  function setErreur(champ, zoneErr, message) {
    zoneErr.textContent = message;
    champ.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (message) {
      champ.setAttribute('aria-describedby', zoneErr.id);
    } else {
      champ.removeAttribute('aria-describedby');
    }
  }

  /**
   * Valide tous les champs et renvoie `true` si le formulaire est valide.
   * Affiche les erreurs sous chaque champ concerné.
   * @returns {boolean}
   */
  function validerFormulaire() {
    let estValide = true;
    let premierChampInvalide = null;

    /* ── Nom ── */
    if (!champNom.value.trim()) {
      setErreur(champNom, errNom, 'Votre nom est requis.');
      estValide = false;
      premierChampInvalide = premierChampInvalide || champNom;
    } else {
      setErreur(champNom, errNom, '');
    }

    /* ── E-mail ── */
    if (!champEmail.value.trim()) {
      setErreur(champEmail, errEmail, 'Votre adresse e-mail est requise.');
      estValide = false;
      premierChampInvalide = premierChampInvalide || champEmail;
    } else if (!emailValide(champEmail.value)) {
      setErreur(champEmail, errEmail, "L'adresse e-mail ne semble pas valide (ex : prenom@domaine.fr).");
      estValide = false;
      premierChampInvalide = premierChampInvalide || champEmail;
    } else {
      setErreur(champEmail, errEmail, '');
    }

    /* ── Message ── */
    if (!champMessage.value.trim()) {
      setErreur(champMessage, errMessage, 'Votre message est requis.');
      estValide = false;
      premierChampInvalide = premierChampInvalide || champMessage;
    } else if (champMessage.value.trim().length < 10) {
      setErreur(champMessage, errMessage, "Le message est trop court — dites-m'en un peu plus !");
      estValide = false;
      premierChampInvalide = premierChampInvalide || champMessage;
    } else {
      setErreur(champMessage, errMessage, '');
    }

    /* Déplace le focus sur le premier champ en erreur */
    if (premierChampInvalide) {
      premierChampInvalide.focus();
    }

    return estValide;
  }

  /* ── Effacement progressif des erreurs à la saisie ──
     On vérifie au blur (perte de focus) pour ne pas gêner
     l'utilisateur pendant qu'il tape. */
  champNom.addEventListener('blur', function() {
    if (champNom.value.trim()) {
      setErreur(champNom, errNom, '');
    }
  });

  champEmail.addEventListener('blur', function() {
    if (emailValide(champEmail.value)) {
      setErreur(champEmail, errEmail, '');
    }
  });

  champMessage.addEventListener('blur', function() {
    if (champMessage.value.trim().length >= 10) {
      setErreur(champMessage, errMessage, '');
    }
  });

  /* ── Soumission du formulaire ── */
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    /* On ne fait rien si la validation échoue */
    if (!validerFormulaire()) return;

    /* État "envoi en cours" */
    btnEnvoyer.disabled = true;
    btnEnvoyer.textContent = 'Envoi en cours…';

    /* Simulation d'un envoi asynchrone (pas de back-end ici) */
    setTimeout(function() {
      /* Cache le formulaire, affiche le message de succès */
      form.hidden = true;
      msgSucces.hidden = false;
      /* Place le focus sur le message de succès pour les lecteurs d'écran */
      msgSucces.focus();
    }, 900);
  });
})();
