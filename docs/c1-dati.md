# C1 — Cosa salva Gadgetbridge per la Collider HR

Fonte: primo export del 2 novembre 2026 (`data/2026-11-02/Gadgetbridge.db`, fuori da git), Gadgetbridge 0.95.1, firmware DN1.0.3.0r.v13. Database SQLite, `PRAGMA user_version` = 151.

## Dispositivo

| Tabella | Valore |
|---|---|
| `DEVICE` | `_id` = **1**, `NAME` = `Hybrid HR Collider`, `MANUFACTURER` = `Fossil`, `MODEL` = `DN.1.0` |
| `DEVICE_ATTRIBUTES` | `FIRMWARE_VERSION1` = `DN1.0.3.0r.v13`, `FIRMWARE_VERSION2` = `3.0` |

## Tabelle della Hybrid HR

```sql
CREATE TABLE "HYBRID_HRACTIVITY_SAMPLE" (
  "TIMESTAMP" INTEGER NOT NULL, "DEVICE_ID" INTEGER NOT NULL, "USER_ID" INTEGER NOT NULL,
  "STEPS" INTEGER NOT NULL, "CALORIES" INTEGER NOT NULL,
  "VARIABILITY" INTEGER NOT NULL, "MAX_VARIABILITY" INTEGER NOT NULL,
  "HEARTRATE_QUALITY" INTEGER NOT NULL, "ACTIVE" INTEGER NOT NULL,
  "WEAR_TYPE" INTEGER NOT NULL, "HEART_RATE" INTEGER NOT NULL,
  PRIMARY KEY ("TIMESTAMP", "DEVICE_ID") ON CONFLICT REPLACE) WITHOUT ROWID;

CREATE TABLE "HYBRID_HRSPO2_SAMPLE" (
  "TIMESTAMP" INTEGER NOT NULL, "DEVICE_ID" INTEGER NOT NULL, "USER_ID" INTEGER NOT NULL,
  "SPO2" INTEGER NOT NULL,
  PRIMARY KEY ("TIMESTAMP", "DEVICE_ID") ON CONFLICT REPLACE) WITHOUT ROWID;
```

| Colonna | Ipotesi (❓ finché non ci sono dati) | Uso per il sonno |
|---|---|---|
| `TIMESTAMP` | Secondi Unix in UTC (in `BATTERY_LEVEL` lo sono) | Finestra notte in `Europe/Rome` |
| `STEPS` | Passi nell'intervallo | Minuto a riposo se 0 |
| `HEART_RATE`, `HEARTRATE_QUALITY` | Battito e sua affidabilità | Baseline notturna; scartare la qualità bassa |
| `VARIABILITY`, `MAX_VARIABILITY` | Indice di movimento (medio e massimo) | **Attigrafia** (Cole-Kripke / Sadeh) se confermato |
| `ACTIVE` | Minuto attivo sì/no | Esclude il sonno |
| `WEAR_TYPE` | Stato di indossamento | Togliere i minuti con orologio tolto |
| `CALORIES` | Calorie | Probabilmente inutile |

## Stato

- Nel primo export **tutte le tabelle dei campioni sono vuote**: hanno righe solo `DEVICE`, `DEVICE_ATTRIBUTES` e `BATTERY_LEVEL`. Gadgetbridge non aveva ancora scaricato l'attività dall'orologio.
- Prossimo export: dopo almeno una notte, **sincronizzando in Gadgetbridge la mattina** prima dell'export.
- Da verificare con i dati: un campione al minuto? Valori e distribuzione di `VARIABILITY` e `WEAR_TYPE`, buchi notturni, fuso dei timestamp.

## Comandi

```bash
sqlite3 data/<data>/Gadgetbridge.db "select count(*), datetime(min(TIMESTAMP),'unixepoch'), datetime(max(TIMESTAMP),'unixepoch') from HYBRID_HRACTIVITY_SAMPLE where DEVICE_ID = 1;"
```
