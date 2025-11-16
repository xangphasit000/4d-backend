import express from "express";
import fs from "fs-extra";
import cors from "cors";
import multer from "multer";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/uploads", express.static("uploads"));

const DB = "db.json";

async function readDB() { return fs.readJson(DB); }
async function writeDB(data) { return fs.writeJson(DB, data, { spaces: 2 }); }

app.get("/users", async (req, res) => res.json((await readDB()).users));
app.post("/users", async (req, res) => {
  const db = await readDB(); db.users.push(req.body);
  await writeDB(db); res.json({ ok: true });
});
app.put("/users/:username", async (req, res) => {
  const db = await readDB();
  const i = db.users.findIndex(u => u.username === req.params.username);
  if (i<0) return res.json({error:"not found"});
  db.users[i] = {...db.users[i], ...req.body};
  await writeDB(db);
  res.json({ok:true});
});
app.delete("/users/:username", async (req, res) => {
  const db = await readDB();
  db.users = db.users.filter(u=>u.username!==req.params.username);
  await writeDB(db);
  res.json({ok:true});
});

app.get("/prizes", async (req, res) => res.json((await readDB()).prizes));
app.post("/prizes", async (req, res) => {
  const db = await readDB(); db.prizes.push(req.body);
  await writeDB(db); res.json({ok:true});
});
app.delete("/prizes/:code", async (req, res) => {
  const db = await readDB();
  db.prizes = db.prizes.filter(p=>p.code!==req.params.code);
  await writeDB(db); res.json({ok:true});
});

app.get("/winners", async (req, res) => res.json((await readDB()).winners));
app.post("/winners", async (req, res) => {
  const db = await readDB(); db.winners.push(req.body);
  await writeDB(db); res.json({ok:true});
});

app.get("/history/:username", async (req, res) => {
  const db = await readDB();
  res.json(db.history[req.params.username]||[]);
});
app.post("/history/:username", async (req, res) => {
  const db = await readDB();
  if(!db.history[req.params.username]) db.history[req.params.username]=[];
  db.history[req.params.username].push(req.body.entry);
  await writeDB(db);
  res.json({ok:true});
});

app.get("/notify", async (req, res) => res.json((await readDB()).notify));
app.post("/notify", async (req, res) => {
  const db = await readDB(); db.notify=req.body;
  await writeDB(db); res.json({ok:true});
});

const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("image"), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
