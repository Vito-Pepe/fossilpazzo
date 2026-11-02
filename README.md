# fossilpazzo

App e strumenti per la Fossil Hybrid Collider HR con Gadgetbridge: luce sempre accesa, stima del sonno dai dati di Gadgetbridge, pulsante di emergenza, notifiche di Blink. Piano e stato in [HANDOFF.md](HANDOFF.md).

## Preparare il PC (Windows + WSL2)

Dentro Ubuntu (WSL), dalla cartella del repo:

```bash
bash strumenti/prepara-wsl.sh
```

Installa i pacchetti, crea il venv Python `~/venv-fossil` con `crc32c`, compila JerryScript 2.1.0 (`jerry` e `jerry-snapshot` in `/usr/local/bin`) e clona l'SDK in `sdk/` a un commit fisso.

## Compilare un'app

```bash
bash strumenti/compila.sh apps/<nome>
```

Il file da mandare all'amico è `apps/<nome>/build/<identifier>.wapp`. Lo script lancia solo `make compile pack`: niente `adb`, niente installazione. Le versioni consegnate si copiano in `consegne/` con la versione nel nome.

## Provare un'app senza orologio

```bash
bash strumenti/prova.sh apps/<nome>
```

Esegue lo scenario `apps/<nome>/prova.js` con `jerry` (lo stesso JerryScript 2.1.0 dell'orologio) e un firmware simulato (`strumenti/simulatore.js`): trova errori di sintassi, di logica e segnaposto del layout senza valore. Il comportamento vero del firmware si vede solo sull'orologio.

## Cartelle

| Cartella | Contenuto |
|---|---|
| `apps/` | App per l'orologio (una cartella per app, struttura come gli esempi dell'SDK) |
| `sleep/` | Stima del sonno in Python (opzione C) |
| `tasker/` | Profili Tasker esportati (SOS, relay Blink, widget sonno) |
| `reports/` | Report delle prove dell'amico |
| `docs/` | Note tecniche e istruzioni per l'amico |
| `strumenti/` | Script di preparazione, compilazione e prova (con il simulatore) |
| `consegne/` | I `.wapp` mandati all'amico, uno per versione |
| `sdk/` | Clone di Fossil-HR-SDK (fuori da git) |
| `data/`, `segreti/` | Export del database e chiave dell'orologio (fuori da git) |
