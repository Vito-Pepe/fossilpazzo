# Fossil Hybrid Collider HR — handoff per Claude Code

> Aggiornato al 2 novembre 2026. Riprende e amplia `fossil-hybrid-hr-project.md`.
> ✅ = verificato sulla documentazione · ❓ = ipotesi da provare sull'orologio · ⚠️ = rischio noto

---

## 0. Istruzioni per Claude Code (leggere per prime)

### Chi fa cosa

| Ruolo | Chi | Cosa ha |
|---|---|---|
| Sviluppo | **Vito**: sviluppatore Java, poca pratica con JavaScript ed ecosistemi web | PC Windows (WSL2) o MacBook. Usa iPhone: Gadgetbridge è solo Android, quindi non può provare nulla sul telefono |
| Test sul dispositivo | **Un amico di Vito**, proprietario dell'orologio | Fossil Hybrid Collider HR + telefono Android |

### Regole

1. Non hai accesso né all'orologio né al telefono. **Non usare `adb`** e non lanciare i passaggi del Makefile che copiano o installano sul telefono: il prodotto finale è il file `.wapp`.
2. Ogni consegna all'amico costa un giro lungo. Metti più prove in un solo `.wapp` (parametri selezionabili dall'orologio) e allega sempre le istruzioni di test in italiano semplice (sez. 7).
3. Le ipotesi (❓) vanno provate sul dispositivo prima di costruirci sopra.
4. Prima di scrivere JerryScript leggi `DOCUMENTATION.md` e gli esempi dell'SDK. Nomi di eventi e API in questo file vengono da un riassunto (sez. 10).
5. **Fuori da git:** chiave di autenticazione dell'orologio, credenziali Fossil, export del database di Gadgetbridge (contiene dati di salute dell'amico).
6. Vito viene da Java: spiega le scelte specifiche di JavaScript/JerryScript quando non sono ovvie.
7. Rispondi a Vito in italiano, in modo conciso, con tabelle quando aiutano.

**Si parte dalla Fase 0 (sez. 5).** La Fase 1 la fa l'amico in parallelo.

---

## 1. Richieste iniziali

Obiettivo generale: l'app ufficiale Fossil è datata. Si vogliono migliorare o sostituire parti dell'esperienza, anche con app custom sull'orologio.

| # | Problema | Cosa si vuole |
|---|---|---|
| 1 | Le notifiche di **Blink** (movimento rilevato) arrivano al telefono ma non all'orologio, anche con Blink abilitato nelle notifiche dell'app Fossil | Riceverle sull'orologio |
| 2 | Funzioni di **sonno e salute** limitate. L'app ufficiale traccia sonno e battito, con un suo algoritmo per il sonno | Funzioni migliori; con Gadgetbridge, non perdere il sonno (opzione C) |
| 3 | **Nessuna chiamata di emergenza** o di assistenza | Chiedere aiuto dall'orologio |
| 4 | **Retroilluminazione** accesa solo ~5 s dopo un doppio tocco sul vetro | Accenderla e spegnerla a comando, senza limite di tempo. Il consumo di batteria non è un problema |

---

## 2. Hardware, vincoli e decisioni

| Voce | Valore |
|---|---|
| Orologio | Fossil Hybrid **Collider HR**: e-ink con lancette reali, firmware Fossil (non Wear OS). Revisione hardware del 42 mm: `DN1.0` |
| Firmware | ✅ **DN1.0.3.0r.v13** (firmware "3.0"), modello DW8F1. In Gadgetbridge il dispositivo è `Hybrid HR Collider`, modello `DN.1.0` |
| Telefono dell'amico | Android |
| App sul telefono | **Gadgetbridge 0.95.1** (deciso: serve per installare i `.wapp`) |
| Macchina di sviluppo | WSL2 su Windows (strada indicata dall'SDK). macOS non provato |

### Vincoli verificati (documentazione Gadgetbridge)

- ✅ Gadgetbridge **non calcola il sonno** della Hybrid HR: l'orologio non lo traccia, lo calcola l'algoritmo dell'app ufficiale. Da qui l'opzione C.
- ✅ Gadgetbridge supporta **passi e battito** della Hybrid HR.
- ✅ Per collegare la Hybrid HR serve una **chiave di autenticazione** negoziata con i **server Fossil**: non si può generare in locale.
- ⚠️ Fossil ha annunciato l'uscita dal mercato smartwatch (2024). La chiave va estratta presto e conservata.
- ✅ **Non dissociare** l'orologio dall'app Fossil: la chiave diventa invalida. Meglio disinstallare l'app o toglierle i permessi. Anche il reset di fabbrica invalida la chiave.
- ✅ Si può passare dall'app ufficiale a Gadgetbridge e viceversa.
- ✅ L'integrazione Gadgetbridge → Sleep as Android **non** include i Fossil tra i dispositivi supportati.

---

## 3. Stato delle conoscenze

| Tema | Stato | Dettaglio |
|---|---|---|
| Installare un `.wapp` | ✅ | File sul telefono → Gadgetbridge → **App Manager** → upload. L'App Manager può anche cancellare app e fare il backup di quelle presenti sull'orologio |
| Avvio di app nuove | ✅ | Un'app non ufficiale che non sostituisce un'app ufficiale si avvia **solo** dal menu custom o dall'App Manager, non dal menu dell'orologio |
| SDK | ✅ | JerryScript **2.1.0** (`jerry` e `jerry-snapshot` nel PATH), `make`. Su Windows probabilmente non gira in modo nativo; con il sottosistema Linux (WSL) sì. Di default `make` compila e installa tramite `adb` + Gadgetbridge |
| Export dati | ✅ | Database SQLite chiamato `Gadgetbridge` (senza estensione), tabelle separate per tipo di dispositivo. Auto-export: Impostazioni → Automazioni → Auto export database (cartella e frequenza), con pulsante "Run AutoExport now". Le etichette in italiano possono variare |
| Menu custom → telefono | ✅ | Gadgetbridge ≥ 0.67.0 + app **Fossil HR Menu Companion**. Il menu fa parte del quadrante di Gadgetbridge. Una voce invia l'intent `nodomain.freeyourgadget.gadgetbridge.Q_COMMUTE_MENU` (extra `extra_action`); il telefono risponde con `nodomain.freeyourgadget.gadgetbridge.Q_SET_MENU_MESSAGE` (`EXTRA_MESSAGE`, `EXTRA_FINISHED`) |
| Widget custom | ✅ | Intent `nodomain.freeyourgadget.gadgetbridge.Q_PUSH_CONFIG` con `EXTRA_CONFIG_JSON`. Firmware ≥ 2.20r, Gadgetbridge ≥ 0.63.0: il 3.0 con 0.95.1 rientra (la documentazione non nomina il 3.x, è una deduzione) |
| Commute/menu sul firmware dell'amico | ⚠️❓ | Firmware 3.0. La commute app è "Firmware version 2.x only". Il **menu custom** non ha limiti di firmware scritti, ma i suoi eventi verso il telefono sono documentati nella sezione della commute app: sul 3.0 va provato prima di costruirci la Fase 4 |
| Quadranti su firmware 3.0 | ✅ | Massimo **2 quadranti** sull'orologio (documentazione Gadgetbridge). Conta per la variante B |
| Luce oltre 5 s | ❓ | Nessuna API documentata. Idea: rimandare un `double_tap` sintetico con un timer |
| Campo `total_sleep` | ❓ | Contenuto non documentato |
| Dati notturni nel DB | ❓ | Schema noto (`docs/c1-dati.md`): tabella `HYBRID_HRACTIVITY_SAMPLE` con passi, battito, `VARIABILITY` (movimento?) e `WEAR_TYPE` (indossato?). Il primo export non ha ancora campioni: risoluzione e significato delle colonne da verificare dopo una notte sincronizzata |
| Installare senza chiave | ❓ | Il README dell'SDK dice "no authentication needed", ma Gadgetbridge richiede la chiave per il pairing. Strada sicura: estrarre la chiave |
| Stabilità | ⚠️ | Alcune app crashano su certi firmware, forse per poca memoria |

---

## 4. Flusso di consegna

```
Vito + Claude Code (PC)                  Amico (Android + orologio)
───────────────────────                  ──────────────────────────
compila → file .wapp  ────────────────▶  salva il file sul telefono
                                         Gadgetbridge → App Manager → upload
                                         avvia l'app dall'App Manager e prova
legge il report, corregge  ◀──────────── report (sez. 7) + video

script Python → report sonno ◀─────────  export DB "Gadgetbridge" (auto-export)
(opz.) widget "Sonno 7h12"   ──────────▶ Tasker sul telefono → orologio
```

---

## 5. Piano di lavoro

### Fase 0 — Ambiente (Vito + Claude Code)

- [x] WSL2 con Ubuntu sul PC Windows (Ubuntu 24.04, utente predefinito root).
- [x] Pacchetti: `build-essential cmake python3 python3-pip python3-venv jq make git sqlite3`. Poi `crc32c` con pip (su Ubuntu recente dentro un venv).
- [x] JerryScript **v2.1.0** (altre versioni non funzionano; l'SDK la indica come obbligatoria da `DN1.0.2.19r.v7`): build con `python3 tools/build.py --jerry-cmdline-snapshot ON`, `jerry` e `jerry-snapshot` nel PATH, controllo della versione.
- [x] Clonare `MortenHannemose/Fossil-HR-SDK` (fork di `dakhnod/Fossil-HR-SDK`), leggere `DOCUMENTATION.md` e il `Makefile` di un esempio.
- [x] Compilare un esempio **senza** push e installazione (per esempio solo i target `compile` e `pack`, se si chiamano così: verificare nel Makefile) e controllare che esca un `.wapp`.
- [x] Creare il repo (sez. 9).

**Esito (2 novembre 2026)** — tutto in `strumenti/prepara-wsl.sh` (rilanciabile) e `strumenti/compila.sh`:

| Voce | Risultato |
|---|---|
| Build di JerryScript | ✅ Con il gcc 13 di Ubuntu 24.04 serve `--compile-flag=-Wno-address`, altrimenti `-Werror` blocca `jerry-ext`. `jerry --version` → `2.1.0 (e8bc7a2)` |
| Python | ✅ venv `~/venv-fossil` con `crc32c` 2.9 (`pack.py` usa `crc32c.crc32c`, presente) |
| SDK | ✅ commit fisso `6ef0d7f` (27/08/2022, l'ultimo). `sdk/` è fuori da git: lo clona lo script |
| Target del Makefile | ✅ `compile` e `pack` (= `make build`) non usano `adb`; `make` da solo fa anche `push` e `install` → **mai** lanciarlo. `WATCH_SDK_PATH` permette di tenere le app fuori dall'SDK |
| `.wapp` di prova | ✅ `simple-menu` → `testMenuApp.wapp` (4454 byte); spacchettato con `tools/unpack.py` è identico ai sorgenti |
| Linguaggio | ✅ Solo **ES5.1**: `jerry-snapshot` rifiuta `let`, `const`, arrow function e template string. Vanno bene `var`, `function`, `Object.keys`, `Array.map`, `JSON`. Snapshot versione 24 |

### Fase 1 — Preparazione dell'amico (checklist da inviargli, nessun codice)

1. Aggiornare l'orologio all'ultimo firmware con l'app Fossil e segnare la **versione firmware**.
2. Fare screenshot del sonno delle ultime 2 settimane nell'app Fossil (riferimento per l'opzione C).
3. Estrarre la **chiave** con l'app WatchAuthenticator oppure con lo script Python della documentazione Gadgetbridge. Lo fa lui con il suo account Fossil (servono email e password). Conservare la chiave in un posto sicuro.
4. **Non** dissociare l'orologio dall'app Fossil: disinstallarla o toglierle i permessi.
5. Installare Gadgetbridge (F-Droid), aggiungere l'orologio e inserire la chiave nel formato `0x…`.
6. App Manager → backup delle app ufficiali presenti sull'orologio.
7. Attivare l'**auto-export** giornaliero del database in una cartella da condividere con Vito.
8. Controllo notifiche: arrivano quelle di altre app? E quelle di Blink? Ora le inoltra Gadgetbridge, non più l'app Fossil.

**Esito (2 novembre 2026)** — checklist per l'amico in `docs/fase1-amico.md`:

| Punto | Esito |
|---|---|
| 1. Firmware | ✅ DN1.0.3.0r.v13, modello DW8F1 |
| 2. Screenshot sonno | ✅ 16 schermate (elenco e dettaglio per notte, 5–25 ottobre circa) in `data/screenshot-sonno-fossil/`, fuori da git. Ogni dettaglio dà inizio–fine, sonno totale, sveglio/leggero/profondo e range del battito. Andamento: addormentamento 02:00–03:30, risveglio 08:40–10:20, 6 h 20 – 7 h 30. Da trascrivere in un CSV quando parte C3 |
| 3. Chiave | ✅ Estratta con lo script Python della documentazione Gadgetbridge; lo script, che conteneva le credenziali Fossil, è stato cancellato. Info dell'orologio in `segreti/info-orologio.md` |
| 4–5. Gadgetbridge | ✅ 0.95.1, collegato all'orologio |
| 6. Backup app | ✅ App Manager → «Download to cache»; le app restano nella scheda Cache di Gadgetbridge |
| 7. Auto-export | ✅ Attivo. Primo export in `data/2026-11-02/Gadgetbridge.db` |
| 8. Notifiche | ✅ Arrivano. ❓ Blink da confermare |
| Sonno dell'app Fossil | ✅ L'amico accetta di perderlo finché l'opzione C non funziona |

### Fase 2 — Pacchetto test #1 (priorità)

Un solo `.wapp` con nome nuovo (es. `lightTestApp`) che **non** sostituisce app ufficiali: evitare nomi come `timerApp`, `stopwatchApp`, `weatherApp`. L'id si imposta in `build/app.json`.

| Funzione | Dettaglio |
|---|---|
| Luce sempre accesa | Un pulsante (es. hold) accende/spegne il keep-alive. Se acceso, un timer ripetuto (`start_timer`, dichiarato in `manifest.timers`) rimanda `double_tap`: `send_user_class_event('double_tap')` oppure `response.i = [{ type: 'double_tap', class: 'user' }]` |
| Intervallo selezionabile | Un pulsante cicla 2 / 3 / 4 s, valore a schermo: l'amico prova tutto senza reinstallare |
| Contatori | Numero di re-invii e ultimo stato ricevuto da `system_state_update` (visible / hidden / background) |
| Diagnostica | A schermo: `total_sleep`, `hr_bpm`, `hr_bpm_resting`, `device_offwrist`, `battery_soc`, `firmware_version` da `common` |
| Uscita | Seguire la convenzione degli esempi SDK; verificare quali pulsanti e gesti sono riservati al sistema |

Domande a cui risponde il test: la luce resta accesa senza buchi? Sfarfalla? Il timer continua quando l'app non è in primo piano? Quanto consuma in un'ora?

Se funziona solo in primo piano → **variante B (❓)**: aggiungere il keep-alive al quadrante open source di Gadgetbridge (`fossil-hr-gbapps`), che resta sempre in primo piano e contiene anche il menu custom. Più complesso: il menu non va rotto.

### Fase 3 — Sonno, opzione C

Dettaglio in sez. 6. La raccolta dati parte appena l'amico usa Gadgetbridge (Fase 1).

### Fase 4 — Pulsante di emergenza

Flusso: voce "SOS" nel menu custom → Gadgetbridge invia `Q_COMMUTE_MENU` con `extra_action = "SOS"` → profilo Tasker *Intent Received* → posizione GPS → SMS ai contatti scelti (e/o chiamata) → conferma sull'orologio con `Q_SET_MENU_MESSAGE` (`EXTRA_MESSAGE = "SOS inviato"`, `EXTRA_FINISHED = true`).

- Deliverable: profilo e task Tasker esportati + istruzioni per importarli.
- Anti-errore: conferma con una seconda pressione entro pochi secondi.
- Menu persistente: dopo averlo inviato dal Menu Companion, reinstallare il quadrante da Gadgetbridge, che incorpora il menu. Senza questo passaggio il menu si perde se l'orologio crasha o si riavvia.
- I pulsanti fisici configurati in Gadgetbridge hanno la precedenza sul menu: impostarli su "Nothing" se usati nel menu.
- Limiti: serve il telefono vicino e connesso; non sostituisce il 112. Provare prima con il numero di Vito.

### Fase 5 — Notifiche Blink

Con Gadgetbridge il problema va ritestato da zero.

- Ipotesi (❓): canale di notifica di Blink a bassa importanza o silenzioso; notifiche raggruppate o "in corso" ignorate; restrizioni di batteria; Non disturbare.
- Dalla documentazione: se l'opzione DND globale di Gadgetbridge è attiva, le notifiche soppresse dal DND del telefono vengono ignorate del tutto.
- Opzioni: regole per app in Gadgetbridge; relay Tasker che intercetta la notifica di Blink e ne pubblica una nuova.

---

## 6. Opzione C — Sonno calcolato dai dati di Gadgetbridge

**Idea:** Gadgetbridge salva i dati dell'orologio nel suo database. Uno script Python sul PC di Vito stima il sonno da passi e battito (ed eventuale movimento). L'orologio non calcola niente.

**Limiti attesi:** niente fasi (leggero/profondo/REM); precisione da misurare; tutto dipende da cosa salva Gadgetbridge per la Hybrid HR. Nessun valore medico.

### C1 — Verifica dei dati (bloccante)

- Input: primo export del DB dopo 1–2 notti con Gadgetbridge.
- Ispezione: `sqlite3 Gadgetbridge` → `.tables`, `.schema <tabella>`. Trovare l'ID dell'orologio nella tabella dei dispositivi e la tabella dei campioni della Hybrid HR (nome da scoprire, non indovinare).
- Domande: un campione al minuto? Quali colonne (passi, battito, intensità o movimento, stato indossato)? Ci sono buchi di notte? Formato dei timestamp (probabile Unix epoch in UTC, da verificare)?
- Output: `docs/c1-dati.md` con schema, poche righe di esempio e il grafico di una notte.
- **Decisione:** solo passi + battito → stima grezza (orari e durata). C'è anche un indice di movimento → algoritmo attigrafico (C2, punto 4).
- **Stato (2 novembre 2026):** schema letto dal primo export (`docs/c1-dati.md`). La tabella c'è e ha una colonna candidata al movimento (`VARIABILITY`), ma è ancora vuota: serve un export dopo una notte **sincronizzata** (in Gadgetbridge, sincronizzare la mattina prima dell'export).

### C2 — Algoritmo v1 (Python 3: `sqlite3`, `pandas`, `matplotlib`)

1. **Finestra notte:** dalle 18:00 di D alle 14:00 di D+1, ora `Europe/Rome` (attenzione al cambio dell'ora).
2. **Pulizia:** togliere i minuti con orologio non indossato (colonna dedicata se c'è, altrimenti battito assente per lunghi tratti) e i battiti fuori range.
3. **Minuto "a riposo":** passi = 0, movimento sotto soglia (se disponibile), battito ≤ baseline personale + margine. Baseline: percentile basso del battito degli ultimi 7 giorni.
4. **Lisciatura:** finestra mobile di 15–20 min, oppure punteggio pesato in stile Cole-Kripke / Sadeh se c'è un indice di movimento. Regole per togliere risvegli e sonni di pochi minuti.
5. **Periodo principale:** il blocco di sonno più lungo, unendo interruzioni ≤ 20–30 min, durata minima ~3 h. Pisolini: opzionali.
6. **Metriche per notte:** addormentamento, risveglio, sonno totale, risvegli (numero e minuti), battito medio e minimo nel sonno.

Requisiti:

- Soglie in `config.yaml`, non nel codice.
- Test `pytest` con notti sintetiche: tranquilla, agitata, orologio tolto, cambio dell'ora.
- CLI: `python -m sleep --db data/Gadgetbridge --from 2026-11-03 --to 2026-11-10 --out reports/`
- Output: `nights.csv`, un grafico per notte (sonno/veglia con battito sovrapposto), riepilogo settimanale in HTML o PNG.

### C3 — Validazione e taratura

- L'amico tiene un **diario del sonno** per 7–10 notti: ora a letto, ora in cui pensa di essersi addormentato, risvegli, ora di sveglia.
- Riferimento in più: gli screenshot dell'app Fossil (Fase 1, punto 2). ❓ Sulla stessa notte probabilmente non si possono confrontare app Fossil e Gadgetbridge, perché l'orologio si collega a una sola app per volta.
- Misure: errore in minuti su addormentamento, risveglio e durata. Obiettivo indicativo: entro ±30 min nella maggior parte delle notti (da rivedere dopo C1).
- Tarare `config.yaml` e annotare i risultati in `docs/c3-validazione.md`.

### C4 — Automazione

- Telefono dell'amico: auto-export giornaliero del DB in una cartella sincronizzata (es. Syncthing o cloud condiviso con Vito).
- PC di Vito: un solo comando che prende l'ultimo export e genera il report.
- ❓ In futuro: script sul telefono con Termux + Tasker.

### C5 — (Opzionale) Il sonno sull'orologio

Tasker sul telefono dell'amico invia a Gadgetbridge:

- Action: `nodomain.freeyourgadget.gadgetbridge.Q_PUSH_CONFIG`
- Extra `EXTRA_CONFIG_JSON`:
  `{"push":{"set":{"widgetCustom0._.config.upper_text":"Sonno","widgetCustom0._.config.lower_text":"7h12"}}}`

Requisiti dalla documentazione: widget custom configurato in Gadgetbridge ≥ 0.63.0, firmware ≥ 2.20r.

**Privacy:** il DB contiene dati di salute dell'amico. Va in `data/` (in `.gitignore`), non si carica online e si cancella quando non serve. Solo con il suo consenso.

---

## 7. Per l'amico: installazione e report

**Installare un `.wapp`**

1. Salva il file sul telefono.
2. Gadgetbridge → App Manager → carica il file.
3. Avvia l'app dall'App Manager: le app nuove non compaiono nel menu dell'orologio.

**Report da rimandare dopo ogni prova**

```
App e versione:
Firmware orologio:              Versione Gadgetbridge:
Installazione riuscita? sì/no (errore: ...)
Luce, intervallo 2 s: resta accesa? sfarfalla? buchi?
Luce, intervallo 3 s:
Luce, intervallo 4 s:
Tornando al quadrante la luce resta accesa?
Batteria: ...% → ...% in ... minuti con la luce accesa
Diagnostica al mattino: total_sleep ...  hr_bpm ...  device_offwrist ...
Crash o riavvii?
Note (per lo sfarfallio meglio un video di 20-30 s):
```

---

## 8. Domande aperte

| Domanda | Chi risponde | Blocca |
|---|---|---|
| ~~Versione firmware dell'orologio~~ | ✅ DN1.0.3.0r.v13 | — |
| ~~La chiave si ottiene ancora dai server Fossil?~~ | ✅ Sì (2 novembre 2026) | — |
| ~~Accetta di perdere il sonno dell'app Fossil finché l'opzione C non funziona?~~ | ✅ Sì | — |
| ~~Le notifiche di altre app arrivano all'orologio?~~ | ✅ Sì | — |
| Le notifiche di Blink arrivano con Gadgetbridge? | Amico | Fase 5 |
| Cosa salva Gadgetbridge per la Hybrid HR di notte? | Claude Code (C1): schema noto, mancano i campioni | Fase 3 |
| Il menu custom funziona sul firmware 3.0? (la commute app è solo 2.x) | Amico, con una prova | Fase 4 |

---

## 9. Struttura del repo

```
fossilpazzo/            (GitHub: Vito-Pepe/fossilpazzo, cartella locale: F:\fossilpazzo)
├─ HANDOFF.md          ← questo file
├─ CLAUDE.md           ← istruzioni per Claude Code
├─ README.md
├─ strumenti/          ← prepara-wsl.sh, compila.sh
├─ sdk/                ← clone di Fossil-HR-SDK (NON in git, lo clona prepara-wsl.sh)
├─ apps/lightTestApp/  ← Fase 2
├─ sleep/              ← opzione C (pacchetto Python, tests/, config.yaml)
├─ tasker/             ← profili esportati (SOS, relay Blink, widget sonno)
├─ reports/            ← report dei test dell'amico
├─ docs/               ← c1-dati.md, c3-validazione.md, fase1-amico.md
├─ data/               ← export del DB (NON in git)
├─ segreti/            ← chiave dell'orologio (NON in git)
└─ .gitignore          ← sdk/, data/, segreti/, .wapp
```

---

## 10. Riferimento rapido SDK (riassunto di `DOCUMENTATION.md`, da ricontrollare)

- **Build:** `jerry-snapshot generate -f '' code.js -o code`. Lo snapshot restituisce un oggetto app con `node_name`, `manifest.timers`, `init`, `deinit`, `handler`, `persist`, `config`.
- **`.wapp`:** snapshot compilato, immagini compresse RLE, layout JSON, file con il nome dell'app.
- **Eventi a `handler(event, response)`:** `time_telling_update`, `common_update`, `timer_expired`, `flick_away`, `double_tap`, `[top|middle|bottom]_press`, `_short_press_release`, `_hold`, `_long_press_release`, `screen_update_finished`, `pending_config_verify`, `node_config_update`, `screen_sleep_command_completed` (non documentato), `system_state_update` (background / hidden / visible).
- **API:** `req_data`, `start_timer(node_name, id, ms)`, `stop_timer`, `is_this_timer_expired`, `save_node_persist`, `localization_snprintf`, `enable_time_telling`, `disable_time_telling`, `now()`, `get_unix_time()`, `wrap_response(response)` → `move_hands`, `draw_screen`, `send_user_class_event`, `send_generic_event`. Notifiche: `response.i = [{type: 'urgent_notification', info: {...}}]`.
- **Campi `common`:** `hr_bpm`, `hr_bpm_resting`, `hr_bpm_peak`, `step_count`, `calories`, `distance`, `active_minutes`, `total_sleep`, `battery_soc`, `battery_voltage`, `charge_status`, `bluetooth_status`, `device_offwrist`, `ringMyPhone`, `weatherInfo`, `music_playback_state`, data e ora, `firmware_version`.
- **Layout:** alberi JSON con nodi `wapp_template`, `option_menu`, `container`, `text`, `text_page`, `image`, `solid`, `content_table`.

---

## 11. Fonti

- Gadgetbridge – Fossil (funzioni supportate, sonno mancante, app non ufficiali): https://gadgetbridge.org/gadgets/wearables/fossil/
- Gadgetbridge – pairing con server Fossil (chiave, avvertenze): https://gadgetbridge.org/basics/pairing/fossil-server/
- Gadgetbridge – Fossil Hybrid internals (App Manager, firmware, revisioni hardware): https://gadgetbridge.org/internals/specifics/fossil-hybrid/
- Gadgetbridge – intent specifici Fossil (menu custom, widget, commute): https://gadgetbridge.org/internals/automations/intents-gadget/
- Gadgetbridge – auto export: https://gadgetbridge.org/internals/automations/auto-export/
- Gadgetbridge – data management (database): https://www.gadgetbridge.org/internals/development/data-management/
- Gadgetbridge – Sleep as Android (dispositivi supportati): https://gadgetbridge.org/basics/integrations/sleep-as-android/
- Fossil HR SDK: https://github.com/MortenHannemose/Fossil-HR-SDK (e `DOCUMENTATION.md`)
- Fossil HR Menu Companion: https://github.com/dakhnod/Fossil-HR-Menu-Companion
- Quadrante open source di Gadgetbridge: https://codeberg.org/Freeyourgadget/fossil-hr-gbapps
- WatchAuthenticator (chiave): https://github.com/dakhnod/WatchAuthenticator
- Esempio app + Tasker (meteo olandese): https://github.com/gjkrediet/Fossil_Dutch_Weather
- Luce con doppio tocco (~5 s): https://www.galaxus.ch/en/page/fossil-collider-hybrid-hr-the-elegant-hybrid-smartwatch-16753

---

## 12. Avvertenze

- Luce, cause di Blink, pulsante di emergenza e stima del sonno restano ipotesi finché non vengono provati sull'orologio dell'amico.
- Se i server Fossil chiudono, ottenere una nuova chiave potrebbe diventare impossibile: non dissociare e non resettare l'orologio.
- Le stime del sonno non hanno valore medico.
