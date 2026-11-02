# Fossil Collider HR — cosa preparare (Fase 1)

Ciao! Per far girare le app nuove sull'orologio passiamo dall'app Fossil a **Gadgetbridge**. Segui i passi **in quest'ordine**: alcuni vanno fatti finché l'app Fossil è ancora collegata.

## Prima di cominciare: due regole importanti

- **Non dissociare** l'orologio dall'app Fossil e **non fare il reset** di fabbrica dell'orologio: la chiave del punto 3 smetterebbe di funzionare e, ora che Fossil ha lasciato gli smartwatch, potrebbe non essere più possibile averne una nuova.
- Finché la stima del sonno nuova non funziona, **il sonno non verrà più calcolato**: Gadgetbridge registra passi e battito, ma il sonno lo calcolava solo l'app Fossil. Dimmi se per te va bene prima di passare al punto 4.

## I passi

1. **Aggiorna l'orologio** all'ultimo firmware con l'app Fossil. Poi segna la **versione del firmware** (nelle impostazioni/informazioni dell'orologio, nell'app Fossil).
2. **Screenshot del sonno** delle ultime 2 settimane nell'app Fossil (servono per confrontarli con la stima nuova).
3. **Estrai la chiave dell'orologio**, con l'app *WatchAuthenticator* (https://github.com/dakhnod/WatchAuthenticator) oppure con lo script indicato nella guida di Gadgetbridge (https://gadgetbridge.org/basics/pairing/fossil-server/). Servono email e password del tuo account Fossil: lo fai tu, io non ne ho bisogno. Salva la chiave in un posto sicuro (password manager o nota protetta) e **non mandarla a nessuno**, nemmeno a me.
4. **Spegni l'app Fossil senza dissociare**: disinstallala, oppure togli i suoi permessi (Bluetooth, posizione, notifiche).
5. **Installa Gadgetbridge** da F-Droid, aggiungi l'orologio e inserisci la chiave scritta con `0x` davanti (esempio: `0x1234abcd…`).
6. In Gadgetbridge apri l'**App Manager** dell'orologio e fai il **backup** delle app che ci sono già.
7. Attiva l'**esportazione automatica** del database (Impostazioni → Automazioni → Auto export database, una volta al giorno) in una cartella che condividi con me. Il database contiene i tuoi dati di salute (passi, battito): li uso solo per la stima del sonno, restano sul mio PC e li cancello quando non servono. Fallo solo se ti va bene.
8. **Notifiche**: ora le inoltra Gadgetbridge. Arrivano sull'orologio quelle di WhatsApp, SMS, ecc.? E quelle di **Blink**?

## Cosa rimandarmi

```
Versione firmware orologio:
Versione Gadgetbridge:
Chiave estratta? sì/no (se no, che errore dà?)
Ok a non avere il sonno dell'app Fossil per un po'? sì/no
Gadgetbridge collegato all'orologio? sì/no
Backup dell'App Manager fatto? sì/no
Auto-export attivo? sì/no — cartella condivisa:
Notifiche delle altre app arrivano? sì/no (quali?)
Notifiche di Blink arrivano? sì/no
Note:
```

Più gli screenshot del sonno del punto 2. Grazie!
