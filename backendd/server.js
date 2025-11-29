require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------ Init Supabase --------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ------------ Init Firebase Admin --------------
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// -------------- Endpoint -------------------
// POST /sync  { admin_id: "admin123", mode: "single" | "all" }
app.post('/sync', async (req, res) => {
  try {
    const { admin_id, mode } = req.body;

    if (!admin_id) {
      return res.status(400).json({ error: "admin_id required" });
    }

    // Fetch only request_address from Supabase
    const { data, error } = await supabase
      .from('dispatch')
      .select('request_address')
      .eq('admin_id', admin_id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching from Supabase" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No rows for that admin_id" });
    }

    // ---- SINGLE MODE → only latest row ----
    if (mode === "single") {
      const latest = data[data.length - 1];  // latest row
      const payload = { request_address: latest.request_address };

      await db.ref(`dispatches/${admin_id}/latest`).set(payload);

      return res.json({ written: payload });
    }

    // ---- ALL MODE → write all request_address entries ----
    const updates = {};
    data.forEach((row, index) => {
      updates[`dispatches/${admin_id}/items/${index}`] = {
        request_address: row.request_address
      };
    });

    await db.ref().update(updates);

    res.json({ written_count: data.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// health check
app.get('/', (req, res) => res.send("Supabase → Firebase Sync Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
