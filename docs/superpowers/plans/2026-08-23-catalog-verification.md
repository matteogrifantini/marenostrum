# Verifica catalogo spiagge Sicilia — 2026-08-23

## Obiettivo

Controllare le 29 nuove spiagge aggiunte al catalogo senza pubblicarle automaticamente. Ogni scheda resta `draft` finché non sono disponibili evidenze sufficienti per posizione, accesso, contenuti editoriali, immagine con diritti verificabili e identificativo Google Places quando richiesto dal workflow.

## Piano operativo

1. **Audit iniziale**
   - confrontare `beaches.json`, `review-candidates.json`, `beach-content.json` e `image-assets.json`;
   - verificare lo stato di pubblicazione e i gate già applicati;
   - classificare ogni scheda come correggibile con evidenze, da verificare manualmente o priva di asset.

2. **Coordinate e riferimenti**
   - controllare i link OpenStreetMap e il tipo semantico dell'oggetto;
   - correggere solo i riferimenti che puntano con sufficiente certezza a una spiaggia;
   - mantenere coordinate e URL coerenti in tutti i manifest del catalogo;
   - non sostituire un riferimento ambiguo con una nuova supposizione.

3. **Registro di verifica**
   - documentare fonte, data, esito, blocchi e prossima azione per ogni nuova scheda;
   - distinguere dati verificati da dati candidati e da contenuti non ancora pubblicabili;
   - indicare le verifiche ancora necessarie su accesso, immagine/diritti, Google Places e parcheggi.

4. **Validazione**
   - eseguire i test del catalogo e i controlli di coerenza dei manifest;
   - verificare che tutte le nuove schede restino `draft` e che nessun parcheggio non verificato venga mostrato;
   - riportare separatamente ciò che è stato corretto e ciò che resta bloccato.

## Criterio di completamento

La tranche è completata quando i riferimenti geografici non ambigui sono corretti, ogni scheda ha un esito documentato e i test passano. La promozione a `verified` e qualsiasi deploy richiedono una verifica successiva dei gate editoriali e degli asset mancanti.
