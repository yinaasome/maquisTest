# 🍻 Maquis Pro — Déploiement Netlify GRATUIT (sans variables d'environnement)

## Principe : tout passe par Google Apps Script

```
Votre site Netlify  →  Google Apps Script  →  Google Sheets
   (URL publique)       (gère lecture ET écriture, zéro clé API)
```

Pas de clé API dans le code. L'URL du Apps Script n'est pas un secret
(c'est une URL publique, pas un mot de passe).

---

## Étape 1 — Préparer Google Sheet

Créez ces 4 onglets avec leurs en-têtes en ligne 1 :

| Onglet | En-têtes (séparées par des |) |
|--------|-------------------------------|
| **Produits** | id \| nom \| categorie \| prix \| stock \| caisseQty \| alerte \| image |
| **Ventes** | venteId \| date \| heure \| prodId \| nom \| prix \| quantite \| sousTotal \| total |
| **Depenses** | id \| categorie \| note \| montant \| date |
| **StockHistory** | date \| prodId \| stockInitial \| entrees \| ventes |

---

## Étape 2 — Déployer le Google Apps Script

1. Allez sur **https://script.google.com**
2. Cliquez **Nouveau projet**
3. Supprimez le code existant et collez tout le contenu de `apps-script-v2.gs`
4. Vérifiez que `SPREADSHEET_ID` correspond à votre Google Sheet
5. Cliquez **Déployer** → **Nouveau déploiement**
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Accès : **Tout le monde**
6. Cliquez **Autoriser** → **Déployer**
7. **Copiez l'URL** (ressemble à `https://script.google.com/macros/s/XXXXX/exec`)

---

## Étape 3 — Coller l'URL dans index.html

Ouvrez `index.html` et cherchez cette ligne (vers le début du script) :

```js
const GAS_URL = 'COLLER_URL_APPS_SCRIPT_ICI';
```

Remplacez par votre URL :

```js
const GAS_URL = 'https://script.google.com/macros/s/VOTRE_ID/exec';
```

---

## Étape 4 — Déployer sur Netlify

1. Allez sur **https://app.netlify.com/drop**
2. Glissez votre dossier contenant :
   ```
   ├── index.html       ← avec GAS_URL rempli
   └── images/
       ├── image1.jpeg
       └── ...
   ```
3. C'est tout ! ✅ Gratuit, aucune variable d'environnement nécessaire.

---

## ⚠️ Si vous voyez une erreur CORS après déploiement

Dans Google Apps Script, allez dans **Déploiements** → cliquez sur votre déploiement
→ **Gérer les déploiements** → vérifiez que l'accès est bien **Tout le monde (y compris anonyme)**.
