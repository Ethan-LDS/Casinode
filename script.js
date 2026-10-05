/**
 * GESTIONNAIRE DE JEU DE DÉS AVEC SYSTÈME DE PARIS (VERSION ÉPURÉE)
 */

const DOM = {
    bouton: document.getElementById('boutonLancer'),
    cube1: document.getElementById('cubeDe1'),
    cube2: document.getElementById('cubeDe2'),
    feedback: document.getElementById('messageFeedback'),
    cagnotte: document.getElementById('valeurCagnotte'),
    rows: document.querySelectorAll('.paris-row'),
    inputTotal: document.getElementById('valeurTotal'),
    inputMise: document.getElementById('valeurMise'),
    boutonsMise: document.querySelectorAll('.mise-rapide button'),
    listeHistorique: document.getElementById('listeHistorique'),
    statParties: document.getElementById('statParties'),
    statVictoires: document.getElementById('statVictoires'),
    statGainMax: document.getElementById('statGainMax'),
    statSoldeMax: document.getElementById('statSoldeMax'),
    gainGagnant: document.getElementById('gainGagnant'),
    gainExact: document.getElementById('gainExact'),
    gainTotal: document.getElementById('gainTotal')
};

const JEU = {
    solde: 5,
    historique: [],
    stats: { parties: 0, victoires: 0, gainMax: 0, soldeMax: 5 },
    dureeAnimation: 1500,
    rotationsBase: {
        1: { x: 0,   y: 0 },
        2: { x: -90, y: 0 },
        3: { x: 0,   y: -90 },
        4: { x: 0,   y: 90 },
        5: { x: 90,  y: 0 },
        6: { x: 180, y: 0 }
    }
};

const genererDe = () => Math.floor(Math.random() * 6) + 1;

// Cotes de chaque type de pari
const MULTI = { gagnant: 2, exact: 5, total: 10 };
const NOMS_PARIS = { gagnant: 'Dé le plus fort', exact: 'Chiffre exact', total: 'Somme exacte' };

// ---------- TABLEAU DES GAINS ----------
function majGains() {
    const mise = parseInt(DOM.inputMise.value);
    const ok = !isNaN(mise) && mise >= 1;
    DOM.gainGagnant.textContent = ok ? `${mise * MULTI.gagnant} pts` : '–';
    DOM.gainExact.textContent   = ok ? `${mise * MULTI.exact} pts`   : '–';
    DOM.gainTotal.textContent   = ok ? `${mise * MULTI.total} pts`   : '–';
}

DOM.inputMise.addEventListener('input', majGains);

// ---------- BOUTONS DE MISE RAPIDE ----------
function activerBoutonsMise(actif) {
    DOM.boutonsMise.forEach(b => { b.disabled = !actif; });
}

DOM.boutonsMise.forEach(btn => {
    btn.addEventListener('click', () => {
        let mise = parseInt(DOM.inputMise.value);
        if (isNaN(mise) || mise < 1) mise = 0;

        if (btn.dataset.mise === 'tout') {
            mise = JEU.solde;
        } else {
            mise += parseInt(btn.dataset.mise);
        }

        DOM.inputMise.value = Math.max(1, Math.min(mise, JEU.solde));
        majGains();
    });
});

// ---------- HISTORIQUE ET STATISTIQUES ----------
function afficherHistorique() {
    DOM.listeHistorique.innerHTML = '';

    if (JEU.historique.length === 0) {
        const vide = document.createElement('li');
        vide.className = 'vide';
        vide.textContent = 'Aucun lancer pour le moment';
        DOM.listeHistorique.appendChild(vide);
        return;
    }

    JEU.historique.forEach(h => {
        const li = document.createElement('li');
        li.className = h.win ? 'gagne' : 'perdu';

        const typePari = document.createElement('span');
        typePari.textContent = NOMS_PARIS[h.type];

        const resultat = document.createElement('strong');
        resultat.textContent = h.win
            ? `${h.mise} pts × ${h.multi} = ${h.mise * h.multi} pts`
            : `-${h.mise} pts`;

        li.appendChild(typePari);
        li.appendChild(resultat);
        DOM.listeHistorique.appendChild(li);
    });
}

function majStats() {
    DOM.statParties.textContent = JEU.stats.parties;
    DOM.statVictoires.textContent = JEU.stats.victoires;
    DOM.statGainMax.textContent = JEU.stats.gainMax;
    DOM.statSoldeMax.textContent = JEU.stats.soldeMax;
}

function enregistrerLancer(type, mise, multi, win, net) {
    JEU.historique.unshift({ type, mise, multi, win });
    JEU.historique = JEU.historique.slice(0, 6);

    JEU.stats.parties++;
    if (win) {
        JEU.stats.victoires++;
        JEU.stats.gainMax = Math.max(JEU.stats.gainMax, net);
    }
    JEU.stats.soldeMax = Math.max(JEU.stats.soldeMax, JEU.solde);

    afficherHistorique();
    majStats();
}

// Événement pour sélectionner le type de pari en cliquant sur les lignes
DOM.rows.forEach(row => {
    row.addEventListener('click', () => {
        const radioId = row.getAttribute('data-target');
        document.getElementById(radioId).checked = true;
        
        DOM.rows.forEach(r => r.classList.remove('active'));
        row.classList.add('active');
    });
});

// Sécurité pour borner le total visé entre 2 et 12
DOM.inputTotal.addEventListener('change', function() {
    let val = parseInt(this.value);
    if (isNaN(val) || val < 2) this.value = 2;
    if (val > 12) this.value = 12;
});

DOM.bouton.addEventListener('click', () => {
    let mise = parseInt(DOM.inputMise.value);
    
    if (isNaN(mise) || mise < 1) {
        DOM.feedback.textContent = "❌ La mise doit être d'au moins 1 point !";
        DOM.feedback.style.color = "var(--error-color)";
        return;
    }
    if (mise > JEU.solde) {
        DOM.feedback.textContent = "❌ Tu ne peut pas miser plus que ton solde actuel !";
        DOM.feedback.style.color = "var(--error-color)";
        return;
    }

    JEU.solde -= mise;
    DOM.cagnotte.textContent = JEU.solde;
    
    DOM.bouton.disabled = true;
    activerBoutonsMise(false);
    DOM.feedback.textContent = "🎲 Les deux dés tournent...";
    DOM.feedback.style.color = "var(--text-dark)";

    const typePariChoisi = document.querySelector('input[name="typeParis"]:checked').value;
    const choixDeGagnant = parseInt(document.getElementById('choixDeGagnant').value);
    const choixDeExact = parseInt(document.getElementById('choixDeExact').value);
    const valeurExacteAttendue = parseInt(document.getElementById('valeurExact').value);
    const valeurTotalAttendue = parseInt(DOM.inputTotal.value);

    const de1 = genererDe();
    const de2 = genererDe();
    const sommeTotale = de1 + de2;

    const nbrTours = 1440;
    DOM.cube1.style.transform = `rotateX(${JEU.rotationsBase[de1].x + nbrTours}deg) rotateY(${JEU.rotationsBase[de1].y + nbrTours}deg)`;
    DOM.cube2.style.transform = `rotateX(${JEU.rotationsBase[de2].x + nbrTours}deg) rotateY(${JEU.rotationsBase[de2].y + nbrTours}deg)`;

    setTimeout(() => {
        let win = false;
        let multi = 0;
        let net = -mise;

        switch (typePariChoisi) {
            case "gagnant":
                const plusHauteValeur = Math.max(de1, de2);
                if (de1 === de2) {
                    win = false;
                } else {
                    if (choixDeGagnant === 1 && de1 === plusHauteValeur) win = true;
                    if (choixDeGagnant === 2 && de2 === plusHauteValeur) win = true;
                }
                multi = MULTI.gagnant;
                break;
                
            case "exact":
                if (choixDeExact === 1 && de1 === valeurExacteAttendue) win = true;
                if (choixDeExact === 2 && de2 === valeurExacteAttendue) win = true;
                multi = MULTI.exact;
                break;

            case "total":
                if (sommeTotale === valeurTotalAttendue) win = true;
                multi = MULTI.total;
                break;
        }

        // AFFICHAGE ÉPURÉ UNIQUE
        if (win) {
            const gains = mise * multi;
            JEU.solde += gains;
            net = gains - mise;
            DOM.feedback.textContent = `🎉 Gagné ! (+${gains} points)`;
            DOM.feedback.style.color = "var(--success-color)";
        } else {
            DOM.feedback.textContent = "😢 Perdu...";
            DOM.feedback.style.color = "var(--error-color)";
        }

        DOM.cagnotte.textContent = JEU.solde;
        enregistrerLancer(typePariChoisi, mise, multi, win, net);

        if (JEU.solde > 0) {
            DOM.bouton.disabled = false;
            activerBoutonsMise(true);
        } else {
            DOM.feedback.textContent = "💥 T'est ruiné ! Recharge la page (F5) pour relancer.";
            DOM.feedback.style.color = "var(--error-color)";
        }

    }, JEU.dureeAnimation);
});

// Affichage initial
majGains();
majStats();
afficherHistorique();
