require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------ Init Supabase (server side) --------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // SECRET
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ------------ Init Firebase Admin --------------
/*
  We will receive the service account JSON as an environment variable
  FIREBASE_SERVICE_ACCOUNT (stringified JSON). We parse and initialize.
*/
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL; // https://<PROJECT_ID>.firebaseio.com

if (!serviceAccountJson || !FIREBASE_DB_URL) {
  console.error("Missing Firebase env vars");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DB_URL
});

const db = admin.database();

// -------------- Endpoint --------------
// POST /sync { admin_id: "admin_123", mode: "single"|"all" }
app.post('/sync', async (req, res) => {
  try {
    const { admin_id, mode } = req.body;
    if (!admin_id) return res.status(400).json({ error: 'admin_id required' });

    // Query Supabase for matching rows
    // If you expect only the latest or only one - adapt query accordingly
    const { data, error } = await supabase
      .from('dispatch')
      .select('request_address')
      .eq('admin_id', admin_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error', error);
      return res.status(500).json({ error: 'Error querying Supabase' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No dispatch rows for that admin_id' });
    }

    // Mode handling:
    // mode === 'single' -> take only the latest row
    // mode === 'all' -> write all rows
    if (mode === 'single') {
      const latest = data[data.length - 1];
      const payload = { request_address: latest.request_address, id: latest.id, created_at: latest.created_at };
      // write to Firebase at /dispatches/{admin_id}/latest
      await db.ref(`dispatches/${admin_id}/latest`).set(payload);
      return res.json({ written: payload });
    } else {
      // default: write all rows under /dispatches/{admin_id}/items/{rowId}
      const updates = {};
      data.forEach(row => {
        updates[`dispatches/${admin_id}/items/${row.id}`] = {
          request_address: row.request_address,
          created_at: row.created_at
        };
      });
      await db.ref().update(updates);
      return res.json({ written_count: data.length });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Simple health check
app.get('/', (req, res) => res.send('Supabase → Firebase sync running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

