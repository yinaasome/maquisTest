// ============================================================
// MAQUIS PRO — Google Apps Script
// Gère la LECTURE et l'ÉCRITURE — zéro clé API côté client
//
// DÉPLOIEMENT :
//   1. Allez sur https://script.google.com
//   2. Nouveau projet → collez ce code
//   3. Remplacez SPREADSHEET_ID ci-dessous
//   4. Déployer → Nouveau déploiement → Application Web
//      - Exécuter en tant que : Moi
//      - Accès : Tout le monde (anonymous)
//   5. Copiez l'URL et collez-la dans index.html (GAS_URL)
// ============================================================

const SPREADSHEET_ID = '1jZ2pcRAY4tOB8OVztjDQCNobScaekNJHl2yt1RZXtL8';

// ── LECTURE (GET) ────────────────────────────────────────────
function doGet(e) {
  const headers = corsHeaders();
  try {
    const action = e.parameter.action;
    const sheet  = e.parameter.sheet;

    if (action === 'read' && sheet) {
      const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
      const tab  = ss.getSheetByName(sheet);
      if (!tab) {
        return respond({ error: 'Feuille introuvable: ' + sheet }, headers);
      }
      const values = tab.getDataRange().getValues();
      if (values.length === 0) return respond({ rows: [] }, headers);

      const hdrs = values[0];
      const rows = values.slice(1).map(row => {
        const obj = {};
        hdrs.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
        return obj;
      });
      return respond({ rows }, headers);
    }

    return respond({ ok: true, msg: 'Maquis Pro API — utilisez action=read&sheet=NomFeuille' }, headers);

  } catch(err) {
    return respond({ error: err.message }, headers);
  }
}

// ── ÉCRITURE (POST) ──────────────────────────────────────────
function doPost(e) {
  const headers = corsHeaders();
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss     = SpreadsheetApp.openById(SPREADSHEET_ID);

    // ── append : ajouter UNE ligne ──────────────────────────
    if (action === 'append') {
      const tab = getOrCreateSheet(ss, body.sheet, body.headers);
      tab.appendRow(body.row);
      return respond({ ok: true }, headers);
    }

    // ── appendMultiple : ajouter PLUSIEURS lignes ───────────
    if (action === 'appendMultiple') {
      const tab = getOrCreateSheet(ss, body.sheet, body.headers);
      body.rows.forEach(row => tab.appendRow(row));
      return respond({ ok: true }, headers);
    }

    // ── write : réécrire toute la feuille ───────────────────
    if (action === 'write') {
      const tab = ss.getSheetByName(body.sheet);
      if (!tab) return respond({ error: 'Feuille introuvable: ' + body.sheet }, headers);
      tab.clearContents();
      if (body.headers && body.headers.length > 0) {
        tab.appendRow(body.headers);
      }
      (body.rows || []).forEach(row => tab.appendRow(row));
      return respond({ ok: true }, headers);
    }

    return respond({ error: 'Action inconnue: ' + action }, headers);

  } catch(err) {
    return respond({ error: err.message }, headers);
  }
}

// ── UTILITAIRES ──────────────────────────────────────────────
function getOrCreateSheet(ss, sheetName, headers) {
  let tab = ss.getSheetByName(sheetName);
  if (!tab) {
    tab = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) tab.appendRow(headers);
  } else if (tab.getLastRow() === 0 && headers && headers.length > 0) {
    tab.appendRow(headers);
  }
  return tab;
}

function respond(data, extraHeaders) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
