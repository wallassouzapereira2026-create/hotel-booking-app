import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Pasta de uploads persistente em disco (não some ao reiniciar)
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('[Upload] Pasta uploads/ criada em:', uploadsDir);
  }

  // Servir arquivos de uploads como arquivos estáticos
  app.use('/uploads', express.static(uploadsDir));

  // Configurar multer para upload de arquivos
  const upload = multer({ storage: multer.memoryStorage() });

  // Upload endpoint - salva foto em disco permanentemente
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      // Suporta tanto FormData (arquivo) quanto base64
      let buffer: Buffer;
      let ext: string;

      if (req.body.imageData) {
        // Modo base64
        const { imageData, mimeType } = req.body;
        if (!imageData || !mimeType) {
          return res.status(400).json({ error: 'Missing imageData or mimeType' });
        }
        const base64Data = imageData.replace(/^data:[^;]+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
        ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
      } else if ((req as any).file) {
        // Modo FormData (arquivo)
        buffer = (req as any).file.buffer;
        ext = (req as any).file.originalname.split('.').pop() || 'jpg';
      } else {
        return res.status(400).json({ error: 'No file or imageData provided' });
      }

      // Gera nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `hotel-photo-${timestamp}-${random}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      // Salva no disco (permanente — não some ao reiniciar)
      fs.writeFileSync(filepath, buffer);
      console.log('[Upload] Foto salva em disco:', filepath);

      const url = `/uploads/${filename}`;
      return res.json({ url, filename });

    } catch (error) {
      console.error('[Upload] Erro:', error);
      return res.status(500).json({ error: 'Upload failed: ' + String(error) });
    }
  });

  // Deletar foto do disco quando removida no ADM
  app.delete('/api/upload/:filename', (req, res) => {
    try {
      const { filename } = req.params;
      // Segurança: impede path traversal (ex: ../../etc/passwd)
      const safeName = path.basename(filename);
      const filepath = path.join(uploadsDir, safeName);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('[Upload] Foto removida do disco:', filepath);
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('[Upload] Erro ao deletar:', error);
      return res.status(500).json({ error: 'Delete failed: ' + String(error) });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  // Banco de dados será inicializado na primeira requisição

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
