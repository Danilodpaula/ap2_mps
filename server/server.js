const express = require("express");
const multer = require("multer");
const path = require("path");
const jsonServer = require("json-server");
const cors = require("cors");

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- Configuração do Multer para Upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "server/public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// --- Rota customizada para Upload ---
app.post("/upload", upload.single("media"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }

  res.status(200).json({
    mediaUrl: `/${req.file.path.replace(/\\/g, "/").replace("server/public/", "")}`,
  });
});

// --- Configuração do JSON Server ---
const router = jsonServer.router("server/db.json");
app.use(jsonServer.defaults()); 
app.use(router);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor customizado rodando em http://localhost:${port}`);
});