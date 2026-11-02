# Prova della luce sempre accesa — Luce test v1

Ciao! Questa app prova a tenere accesa la luce dell'orologio ripetendo un «doppio tocco finto» ogni pochi secondi. Ci vogliono circa 15 minuti, più un'ora per la batteria (puoi farla quando vuoi).

## Installare

1. Salva sul telefono il file `lightTestApp-v1.wapp`.
2. Installalo con Gadgetbridge: **App Manager → carica il file**, oppure apri il file dal gestore file del telefono e scegli Gadgetbridge.
3. Avvia l'app **dall'App Manager** (menu dell'app → avvia). Non la trovi nel menu dell'orologio: è normale.

Sullo schermo compare «Luce test v1» e le lancette si mettono orizzontali.

## I pulsanti (dentro l'app)

| Pulsante | Cosa fa |
|---|---|
| **In alto**, premi | Luce **ON / OFF** |
| **In basso**, premi | Cambia ogni quanto si ripete il tocco: 3 → 4 → 6 → 2 secondi |
| **In basso**, tieni premuto | Cambia modo: **A** (un tocco) o **B** (due tocchi di fila) |
| **Al centro**, premi | Un solo tocco finto, per la prova 0 |
| **Al centro**, tieni premuto | Esci. Se la luce è ON l'app resta attiva dietro al quadrante |

La luce si spegne comunque da sola dopo 2 ore.

## Le prove

Meglio farle **al buio o in penombra**, così si vede bene la luce.

0. **Un tocco solo.** Con la luce OFF premi una volta il centro: la luce si accende? Quanti secondi resta accesa? Poi premi il centro, aspetta 2 secondi e premilo di nuovo: la luce resta accesa, si spegne o si spegne e riaccende?
1. **Modo A, 3 s** (come parte l'app). Premi in alto (LUCE ON) e guarda **1 minuto**: resta accesa sempre? Sfarfalla? Ci sono momenti al buio?
2. **4 s**: premi in basso una volta e guarda 1 minuto.
3. **6 s**: premi in basso una volta e guarda 30 secondi. Qui è normale che ogni tanto si spenga per un attimo.
4. **2 s**: premi in basso una volta e guarda 1 minuto.
5. **Solo se nelle prove 1–4 sfarfallava**: tieni premuto in basso (modo B), rimetti 3 s e guarda 1 minuto.
6. **Fuori dall'app.** Scegli l'intervallo che è andato meglio, luce ON, **fai una foto dello schermo**, poi tieni premuto il centro: torni al quadrante. La luce resta accesa? Per quanto? Dopo 1–2 minuti riapri l'app dall'App Manager e **fai un'altra foto dello schermo**.
7. **Batteria** (quando hai tempo): luce ON con l'intervallo migliore per circa **1 ora**, poi foto dello schermo. La riga «batt 75>71» dice la batteria all'accensione e adesso, «da 60 min» da quanto è accesa.
8. **Diagnostica**: una mattina apri l'app e fai una foto dello schermo (righe sotto le lancette: battito, sonno, polso, firmware).

Per spegnere la luce lasciata accesa fuori dall'app: riapri l'app dall'App Manager e premi in alto.

## Cosa rimandarmi

```
Installazione riuscita? sì/no (errore: ...)
Prova 0: il tocco finto accende la luce? sì/no — dura circa ... s
         secondo tocco con la luce accesa: resta accesa / si spegne / si spegne e riaccende
Modo A, 3 s: resta accesa? sfarfalla? buchi?
Modo A, 4 s:
Modo A, 6 s:
Modo A, 2 s:
Modo B, 3 s (solo se serviva):
Fuori dall'app la luce resta accesa? sì/no — per quanto?
Batteria: ...% → ...% in ... minuti
L'orologio si è riavviato o l'app si è chiusa da sola? sì/no (quando?)
Note:
```

Più le **foto dello schermo** (prove 6, 7, 8) e, se sfarfalla, un **video di 20–30 secondi**. Grazie!
