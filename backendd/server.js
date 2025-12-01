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
const serviceAccount = {
  type: "service_account",
  project_id: "project-8812136035477954307",
  private_key_id: "9a02ded0ccfa2a92071c247b80928912d331b05f",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCnXx892vFFAlfS
13GEx8nSs2CUxwhiOkT9TriXNUX0lEipF2XZsMEk473NsqfZNEy83xB7i6Dyis8y
2wykAmvV51uPnlSA8WHURAZOCUtvZErTXYzhGp2IDXXO37IDgyPOvx27dMYGCNFI
SVN0rxJXLXELKqV1v+GuW6e0aVDlM2kYzTzo7WxNz4UjkvC9SjgOH2QnjIJlJZ9m
Q5ZN3psFysr+AGNndmGt2mfZhhTEP8x9qhty8yGBajIj99uOz+uBYwLQW8o1au11
9npdWfUwWGC5KmcXByNQjV0MLjJDLVy7Q/DaHG8RNWCFfD8PVm+FhstpGdSOdUOH
U04NtVldAgMBAAECggEACPWeYAPuAbR6VTI/Fui+ID88pYWfcZ/OeFZGYcbpNNOR
0irUZ5EIBvNvb/td84lAP8oJXMTXoEZy9pCakLHfDp4Or1WHWBP4Ypr/B7DOHJkK
KTmrJEsaXvzfwX4FTmauzmFehnACdyBfkMRm8lgn+UDYsMyM1sOU/O3D0s+93Q8C
YPc/uqD8pQtApgtQupdQ/9zK0tapAx190QRhq+BFS4uTdhTpWaB2RvB0iDqZ4H8Q
2m6X5wc3O3sEbCHbzUt8+CM6OY1MlO/pJXTGyOu5112/QxsWD0hwDUjHiFEgW8Ft
3XYq73WRgW3eyBXDI3tYh5sUSXm/FEnGQKLrWRH11wKBgQDQltwTTi7rjSlq5her
X9US/FucNn/kO7uQubjpR6fPole+AzFW0gIbGzTQiZejJlvGGExBv53IkB/kjg4a
+A9OQyIi8OllUVr8LuNm1CSYcah2BorussFSEPFlTnooubgw2ooDlOIAsr20HtLB
RyQRiQ390gC/O+Hw/JpP02OaGwKBgQDNae98T6FUsOpSdXFlB/ko0dCtnt5qtlvR
NIkv4p+vEsM9pT5En4m51V4cvN+eHfscUaG13ii6JbETM97yZtH2UmfAmYnO6BTb
VVSY/z6S9hTxGppW+vGRbdVbjc6CCDbln+TSIEs+Q+jfnV3htDrPZeXAljxLFZ+k
KB1zNmSR5wKBgQCAbmLTADCjmCcISuQIANmQ9xDw/h2AycaTNcdE23nXvn2H4S9f
5a6mQfoi7JURP20Ca7OISBM+in8Ymt7UfCfwaCV8nhkW6SC8ZaJejgB6XID9Ksog
bq/Zd9UqK0fMC439hpGz4tfE1kk3vkLF/qeWpGyY+9S56oUTfHUG8YFCQQKBgQCj
xKPUvj/nn60R1OR1Iig5rR3sbk7xUTZe0r3VWZ7qG9FhIo9EctWBPWVtEABQtaJw
b3y33Mknr8k/gAltxR/8fLKPUVoXhdyrCZsK5+ThkiQcHZOTaTqTMbf66FIORbJO
3G24QVr753SQY4xn2CNTGvBT3PNxAWpnnDvukR0ZXQKBgQCPvK7FG0hZAJeydclQ
3aPrqJYZaEvhyg16FsHSO7+Uhyj6hP9q3Ci2e4vvv56cESjdToAgoi9X1KtJ4jS7
V76qx84AlAocvKtCFU84d+li09pE+O4iHfTrnkutTUY5Ff8BmnH7UdWSFUu3YBKY
VOs7NcAORudLTK5Gl6f/sJ8D7w==
-----END PRIVATE KEY-----`,
  client_email: "firebase-adminsdk-fbsvc@project-8812136035477954307.iam.gserviceaccount.com",
  client_id: "102286591606476992488",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40project-8812136035477954307.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase once
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-8812136035477954307-default-rtdb.firebaseio.com"
});

// MAKE db GLOBAL (important!)
const db = admin.database();
// ------------------ LOGIN ENDPOINT ------------------
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const FIREBASE_WEB_API_KEY = "AIzaSyBhgsT6lEgV_5ap1L7--HNSrnb3qlyjTyg";

    const loginRes = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + FIREBASE_WEB_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const json = await loginRes.json();

    if (json.error) {
      return res.status(400).json({ error: json.error.message });
    }

    const uid = json.localId;

    // Get admin_id from Firebase DB
    const snap = await db.ref(`users/${uid}`).once("value");

    return res.json({
      uid,
      email,
      admin_id: snap.val().admin_id
    });

  } catch (err) {
    console.error("[LOGIN] ❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});



// ------------------ SIGNUP ENDPOINT ------------------
app.post('/signup', async (req, res) => {
  try {
    const { email, password, admin_id } = req.body;

    if (!email || !password || !admin_id) {
      return res.status(400).json({ error: "email, password, admin_id required" });
    }

    console.log("[SIGNUP] 🔵 Firebase Signup Request:", email, admin_id);

    // Create user in Firebase Auth (Admin SDK, no API key needed)
    const userRecord = await admin.auth().createUser({ email, password });

    console.log("[SIGNUP] 🟢 Firebase user created:", userRecord.uid);

    // Save admin_id in Firebase DB
    await db.ref(`users/${userRecord.uid}`).set({
      email,
      admin_id
    });

    console.log("[SIGNUP] ✅ admin_id saved in DB");

    res.json({
      message: "Signup successful",
      uid: userRecord.uid,
      email,
      admin_id
    });

  } catch (err) {
    console.error("[SIGNUP] ❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------- SYNC ENDPOINT (Supabase → Firebase) --------------
// -------------- SYNC ENDPOINT (Supabase → Firebase) --------------
// -------------- SYNC ENDPOINT (Supabase → Firebase) --------------
app.post('/sync', async (req, res) => {
  try {
    const { admin_id, mode } = req.body;

    if (!admin_id) {
      return res.status(400).json({ error: "admin_id required" });
    }

    console.log("[SYNC] 🔵 admin_id:", admin_id, "mode:", mode);

    // Fetch rows from Supabase
    const { data, error } = await supabase
      .from('dispatch')
      .select(`
        order_id,
        user_id,
        category,
        order_request,
        request_address,
        phone_number,
        ticket_id,
        customer_name,
        read_alert,
        dispatched_at,
        schedule_time
      `)
      .eq('admin_id', admin_id);

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No rows for admin_id" });
    }

    console.log(`[SYNC] 🟢 Rows fetched: ${data.length}`);

    // ------------------- TIME FILTER LOGIC -------------------
    const now = new Date();

    function parseTimeToToday(timeStr) {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);

      // Convert LOCAL IST → UTC
      return new Date(localDate.getTime() - 5.5 * 60 * 60 * 1000);
    }

    const filtered = data.filter(row => {
      if (!row.schedule_time) return false;

      const scheduled = parseTimeToToday(row.schedule_time);
      const diff = Math.abs(scheduled - now);
      const oneHour = 60 * 60 * 1000;

      return diff <= oneHour;
    });

    console.log(`[SYNC] 🟡 Rows after time filter: ${filtered.length}`);

    if (filtered.length === 0) {
      return res.json({ message: "No dispatches in the 1-hour window" });
    }

    // ===================================================
    // 🔥 SINGLE MODE
    // ===================================================
    if (mode === "single") {
      const latest = filtered[filtered.length - 1];

      console.log("[FIREBASE] Writing SINGLE row to task_details/latest");

      await db.ref(`dispatches/${admin_id}/task_details/latest`).set(latest);

      // Mark new task
      await db.ref(`dispatches/${admin_id}/new_task`).set(true);

      return res.json({
        written: latest,
        count: 1
      });
    }

    // ===================================================
    // 🔥 ALL MODE
    // ===================================================
    console.log("[FIREBASE] Writing ALL rows to task_details...");

    const updates = {};
    filtered.forEach((row, index) => {
      updates[`dispatches/${admin_id}/task_details/${index}`] = row;
    });

    // mark new task
    updates[`dispatches/${admin_id}/new_task`] = true;

    await db.ref().update(updates);

    console.log("[FIREBASE] 🟢 Time-filtered rows synced");

    res.json({
      written_count: filtered.length
    });

  } catch (err) {
    console.error("[SYNC] ❌ Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------- HEALTH CHECK -------------------
app.get('/', (req, res) => res.send("Supabase → Firebase Sync Running"));

// -------------- START SERVER -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






