# Prova di lightTestApp v1 — esito

Prova dell'amico, ricevuta il 3 novembre 2026. Istruzioni in `docs/prova-luce-v1.md`, file `consegne/lightTestApp-v1.wapp`. Firmware DN1.0.3.0r.v13, Gadgetbridge 0.95.1.

## Risposte

| Voce | Esito |
|---|---|
| Installazione | ✅ Riuscita |
| Luce ON / OFF | ✅ Con il pulsante in alto la luce si accende e resta fissa finché non si preme di nuovo. A «LUCE OFF» la luce si spegne 2–3 s dopo: è la coda dell'ultimo tocco finto (~5 s), non si può accorciare |
| Sfarfallio | ✅ Nessuno: luce fissa |
| Intervalli | ✅ Funzionano. Con **2 s** la luce non si spegne mai; l'amico vuole solo il ON/OFF con 2 s |
| Prova 0 (tocco singolo) e modo B | Non riportati. Non servono più: se un tocco a luce accesa la spegnesse, con un tocco ogni 2 s la luce sfarfallerebbe |
| Fuori dall'app | ⚠️ La luce resta accesa (anche nel menu dell'orologio), **ma non si riesce più a tornare al quadrante**: «il pulsante centrale è stato rimpiazzato», ci si muove solo nel menu radiale |
| Batteria | 71 → 71 subito dopo l'accensione: la prova di un'ora non è stata fatta |
| Riavvii o chiusure | ✅ Nessuno |
| Richiesta | Luce più forte o schermo più luminoso |

## Dalla foto dello schermo (fuori da git)

| Riga | Valore | Cosa dice |
|---|---|---|
| `ogni 2s  invii 92` / `tap 92` | 92 tocchi inviati, 92 ricevuti | Il `double_tap` finto torna anche all'app che lo manda: gli eventi `class: 'user'` vanno in giro a tutti |
| `stati hvhvhvhv` | Solo `h` e `v`, mai `b` | Dopo `go_home(false)` l'app non passa in `background` ma in `hidden`, lo stato che la documentazione dell'SDK descrive come «coperta da una notifica o simile» |
| `hr`, `rip`, `sonno 0`, `polso si` | Valori letti | `get_common()` funziona sul firmware 3.0: battito, battito a riposo, `total_sleep`, polso |
| `DN1.0.3.0r.v13` | `firmware_version` | Confermato |

## Perché il pulsante centrale non tornava al quadrante (ipotesi)

1. **L'app rispondeva ai tasti anche fuori dallo schermo.** Nella v1 «centro tenuto» era gestito in ogni stato. Con l'app `hidden` (non `background`) il firmware potrebbe ancora passarle i tasti: il centro tenuto nel menu arrivava all'app, che rispondeva `go_home(false)` invece di lasciar fare al sistema.
2. **`go_home(false)` non è il modo usato dalle app che restano attive.** L'app Timer di dakhnod (`dakhnod/Fossil-HR-Timer`, nell'elenco di Gadgetbridge), che resta in background col timer in corso, esce con `go_back(false)`, cioè torna al menu.
3. **Il menu non si chiude da solo.** Il quadrante di Gadgetbridge riavvia il timeout del suo menu a ogni evento `class: 'user'`; se il menu di sistema fa lo stesso, un tocco finto ogni 2 s lo tiene aperto per sempre. Non blocca da solo, ma spiega perché non si torna al quadrante aspettando.

La v2 toglie la causa 1, prova la 2 e chiede all'amico di osservare la 3.

## Luce più forte

Nessuna API conosciuta regola l'intensità della luce: niente nella documentazione dell'SDK né nelle app di Gadgetbridge, che usano solo il doppio tocco finto. Si può però rendere lo schermo più chiaro: uno sfondo bianco riflette più luce di quello nero. La v2 lo prova con l'inversione del layout (`"inversion"`, la stessa che usa il quadrante di Gadgetbridge per i widget neri su sfondo chiaro). Se funziona, vale anche per la scelta del quadrante.
