# Istruzioni per Claude (fossilpazzo)

## Come lavorare con l'utente

- Repo GitHub: `Vito-Pepe/fossilpazzo`. Lavora su un branch e apri una PR verso `main`; dai sempre il **link diretto** della PR e, prima di chiedere di unirla, verifica che sia ancora aperta.
- Su questo PC non c'è `gh`: il push va via Git Credential Manager, la PR si apre con un link `compare` precompilato.
- Claude non può creare repo su GitHub: se ne serve una nuova, la crea l'utente.

## Lingua

Rispondi sempre in italiano, anche nei commit, nelle PR e nei commenti al codice. In modo conciso, con tabelle quando aiutano.

## Prima di tutto

Leggi **`HANDOFF.md`**: chi fa cosa, stato delle conoscenze (✅ verificato, ❓ da provare, ⚠️ rischio), piano a fasi e domande aperte. Tienilo aggiornato: spunta le fasi, segna gli esiti e sposta le ipotesi a ✅ solo dopo una prova sull'orologio.

## Regole

- Nessun accesso all'orologio né al telefono: **mai `adb`**, mai `make` da solo né i target `push`/`install`. Il prodotto è il file `.wapp`, che l'amico di Vito installa con Gadgetbridge → App Manager.
- Ogni consegna all'amico è un giro lungo: più prove in un solo `.wapp` (parametri scelti dall'orologio) e sempre le istruzioni di test in italiano semplice (`HANDOFF.md`, sez. 7).
- Fuori da git: chiave dell'orologio e credenziali (in `segreti/`), export del database di Gadgetbridge (in `data/`, dati di salute dell'amico).
- Vito è sviluppatore Java: spiega le scelte di JavaScript/JerryScript quando non sono ovvie.

## Ambiente (WSL2)

- Ubuntu 24.04 in WSL, utente predefinito root. Preparazione: `bash strumenti/prepara-wsl.sh` (rilanciabile).
- Compilare un'app: `bash strumenti/compila.sh apps/<nome>` → `apps/<nome>/build/<identifier>.wapp`.
- Da Git Bash su Windows i percorsi Linux vanno protetti: `MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu --cd /mnt/f/fossilpazzo -e bash strumenti/compila.sh apps/<nome>`. Con `-e` il comando non passa da una shell intermedia che espanderebbe le `$`.
- `sdk/` è un clone di `MortenHannemose/Fossil-HR-SDK` a commit fisso, fuori da git: la documentazione delle API è in `sdk/DOCUMENTATION.md`, gli esempi in `sdk/examples/`.

## Codice per l'orologio (JerryScript 2.1.0)

- Solo **ES5.1**: niente `let`, `const`, arrow function, template string, classi. Usare `var` e `function`.
- `app.js` non è un modulo: è il corpo di una funzione che fa `return { ... }` dell'oggetto app (`node_name`, `manifest.timers`, `init`, `handler`, `persist`, `config`).
- L'id dell'app è in `build/app.json` (`identifier`): mai il nome di un'app ufficiale (`timerApp`, `stopwatchApp`, `weatherApp`…), altrimenti la sostituisce.
- Partire dalla struttura degli esempi dell'SDK (state machine, `wrap_response`, `wrap_event`).
