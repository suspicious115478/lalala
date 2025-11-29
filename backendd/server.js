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
// ------------ Init Firebase Admin --------------

const serviceAccount = {
  "type": "service_account",
  "project_id": "project-8812136035477954307",
  "private_key_id": "ad0f556321f06dca84badfffd75f0b1806877118",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfQtr/MyH55CU1\nsIDj2iSxbnDvhzIMmLKnr47JJoPUgaRBlgQlHLGIVUIJCePNZyCByeG/8MXFjRUk\n9TzhvrEAL/ZDa3CVi5hFAZV1bmZYPS3bje3dHUMOY1Jj9Uv6JY6Z0lJ/fTJvZY3M\nqFtqSSTnDB4MS8fq67V3sd0p86V9jTeVnDqox0DRBS4BpjFMuJPKtPlpOwdO7ECR\n09FgIDfEdZ3cVHlEgdLGhN0rpPd717XTg2c3CLbRK6PMJcuO0wW8VZ9Bps+pKZG4\n5UPeEhPYRVOw6/z4Lk51DWzacQhflemSa+zqjI+95MPhMNFq0775PmcUI0GGNpBg\nsaTNvoe1AgMBAAECggEAIirJqO5jX6UehoIzZK6sKJS1De5HQoSP74GudGEa70BQ\n6PEyOnQJcmI4JJBGmw6A3tdc4zzYcSVvX9ptEVFDz/J6NsSaBrtIE6XfVq40rsGR\nUQUF/uYEONX+GwvJHQVprn58zHUjmNqErV+BHTBMBnWHDMRFQ5UF/YPfGtz2qBSJ\nL9ZatMBZ46YbyF1XCqC9HTbfCXKrQ8OE5DsrEvXOFEnSuxMyWQUygsQ6XabFCnSF\nzy3c4hMhwMiHiajZNExJSYeKisypWEDONMDy2yvx+usWZV3LxZcylxfDoS9E8z0D\n6nVJzIDQ4jU7LLpAipB/FR0orgpUhBHt7y9ylS46gQKBgQDL2PSYFuWWPXhjdDd/\nwdYKYLbIIBJLAsWLWfBne9XrQHhAwRgFz5626VZCU4x3YbBLjdX+q/dzbxcwdUED\nETlgzxwJPLkuLmZ7EBT5fJW8PFvdWYp050NOwdiVrtzgo8z+ixDWT2VFz3ON5MXa\neH6kZ7LpFwA3NQXH4srC3a4F7QKBgQDIAbTqsETi8oVyF0fQDyZGJ9zngKAE8DAp\n+HOhkYncdrx9R/3vs6zuaxRK134M3JVifBaAgXQY/0elCv89zNAXv2Y63YqUD+FX\nYKdd5bH/W9/THpHMLIohc6e3w04gQlcZW9FJs1vGRW+6pd5zeOeb9ZwjQZ2kBORr\nihy+v8NP6QKBgFZKCo/u8VS9xJ5k7bFY/h/6fKUOXm/+Rl0Mv2Uu2IjzC3RtyJt9\nHbRT5b3B3C4U3im9ap6ZcPAeUHSkzdZcjitawIVwfPr9jUf+sMJDaKb77e8vHhsK\nYkWObP4/vSQicn41o/T0OuxoOoQQGWi3pPQ3KVbd86tq+H16lVYTvLypAoGAQzwH\npGlTDvO2Fm9rDa86D5Vw9kXQBTj1B/bkcCjrrjggDwF3hO/ir1dBwBMG5a31beEG\n83YRICIY5It42D6UqZcG97zny/Q2rVfpi3Ae0RgCewcovfkvCiXF+Mln5wJGI1kx\nVtQ7gsBu2dDOogS/3zbGoTd6ldurKdeI6DqwnpkCgYABjWmCHTTHJctrMk+QZKr3\nUGsOJRdD6UuLZ3yN1sCcMcbWiKD/IGU7SlP749qH8aNDYg3K0Dswc1QefEg1gPex\neTrc2+oDvpFKXp3yxDKEtPrseqeGVcBPJAKxjcvSOijLkQ137j+hbcq6nwjdFgWa\n50TbUn967d5qkaWghA9M5A==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@project-8812136035477954307.iam.gserviceaccount.com",
  "client_id": "102286591606476992488",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40project-8812136035477954307.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://myproject-12345-default-rtdb.firebaseio.com"
});

const db = admin.database();

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

