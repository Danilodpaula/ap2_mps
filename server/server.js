const express = require("express");
const multer = require("multer");
const path = require("path");
const jsonServer = require("json-server");
const cors = require("cors");

// NOVAS IMPORTAÇÕES PARA O SWAGGER
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Rota de Upload (permanece igual) ---
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
app.post("/upload", upload.single("media"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nenhum arquivo enviado.");
  }
  res.status(200).json({
    mediaUrl: `/${req.file.path.replace(/\\/g, "/").replace("server/public/", "")}`,
  });
});

// --- Rota da Documentação da API ---
// Carrega o arquivo YAML
const swaggerDocument = YAML.load('./server/openapi.yaml');
// Cria a rota /docs que servirá a interface do Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Configuração do JSON Server (rotas da API) ---
const router = jsonServer.router("server/db.json");
app.use(jsonServer.defaults()); 
app.use('/api', router); // Importante: Deixe as rotas da API por último

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor customizado rodando em http://localhost:${port}`);
  console.log(`📚 Documentação da API disponível em http://localhost:${port}/docs`);
});