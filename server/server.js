const express = require("express");
const multer = require("multer");
const path = require("path");
const jsonServer = require("json-server");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const port = process.env.PORT || 3001; // Usar a porta do Render ou 3001 localmente

// Middlewares
app.use(cors());
app.use(express.json());

// --- ROTAS DA API ---
// Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "server/public/uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, path.basename(file.originalname, path.extname(file.originalname)) + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("media"), (req, res) => {
  if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");
  res.status(200).json({ mediaUrl: `/uploads/${path.basename(req.file.path)}` });
});

// Documentação
const swaggerDocument = YAML.load('./server/openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas do JSON Server
const router = jsonServer.router("server/db.json");
app.use('/api', router); // Todas as rotas (posts, users, etc.) ficam em /api

// --- SERVIR O FRONTEND EM PRODUÇÃO ---
// Servir a pasta de uploads e a pasta de build do cliente
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Rota "Catch-All": Para qualquer outra requisição, serve o index.html do frontend
// Isso é CRUCIAL para o React Router funcionar corretamente.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});