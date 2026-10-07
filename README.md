# AppCV

Εφαρμογή διαχείρισης αγγελιών και βιογραφικών με:

- `React + MUI` στο frontend
- `Node.js + Express` στο backend
- `MySQL` για αποθήκευση
- `LLM API` για αξιολόγηση καταλληλότητας βιογραφικού ανά αγγελία

## Δομή

- `client/`: React client
- `server/`: Express API
- `db/schema.sql`: σχήμα βάσης

## Εκκίνηση

1. Δημιούργησε βάση `dbolga`.
2. Εκτέλεσε το SQL από το `db/schema.sql`.
3. Αντέγραψε το `server/.env.example` σε `server/.env` και συμπλήρωσε τις τιμές.
4. Εγκατέστησε dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
5. Τρέξε:
   - `cd server && npm run dev`
   - `cd ../client && npm run dev`

## LLM αξιολόγηση

Το backend υποστηρίζει:

- `LLM_PROVIDER=openai`
- `LLM_PROVIDER=gemini`
- `LLM_PROVIDER=mock`

Αν δεν υπάρχει κλειδί API, γίνεται fallback σε τοπικό heuristic scoring ώστε να μπορείς να δοκιμάσεις όλη τη ροή.

