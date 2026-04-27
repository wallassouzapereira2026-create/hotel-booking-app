import express from "express";
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
  
  // Upload endpoint for hotel photos
  app.post('/api/upload', async (req, res) => {
    try {
      const { imageData, mimeType } = req.body;
      
      if (!imageData || !mimeType) {
        return res.status(400).json({ error: 'Missing imageData or mimeType' });
      }
      
      // Convert base64 to buffer
      const base64Data = imageData.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const ext = mimeType.split('/')[1] || 'jpg';
      const filename = `hotel-photo-${timestamp}-${random}.${ext}`;
      
      try {
        // Import storage helper
        const { storagePut } = await import('../storage.js');
        
        // Upload to storage
        const { url } = await storagePut(
          `hotel-photos/${filename}`,
          buffer,
          mimeType
        );
        
        console.log('Upload successful:', url);
        return res.json({ url, filename });
      } catch (storageError) {
        console.error('Storage error:', storageError);
        
        // Fallback: Create a data URL or temporary URL
        // For development, we'll return a success response with a placeholder
        const tempUrl = `/api/temp-image/${filename}`;
        
        // Store the image temporarily in memory (in production, use proper storage)
        (req.app as any).tempImages = (req.app as any).tempImages || {};
        (req.app as any).tempImages[filename] = {
          data: buffer,
          mimeType: mimeType,
          timestamp: Date.now()
        };
        
        console.log('Using fallback temporary URL:', tempUrl);
        return res.json({ url: tempUrl, filename });
      }
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + String(error) });
    }
  });
  
  // Endpoint to serve temporary images
  app.get('/api/temp-image/:filename', (req, res) => {
    const { filename } = req.params;
    const tempImages = (req.app as any).tempImages || {};
    const imageData = tempImages[filename];
    
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Check if image is expired (older than 24 hours)
    if (Date.now() - imageData.timestamp > 24 * 60 * 60 * 1000) {
      delete tempImages[filename];
      return res.status(404).json({ error: 'Image expired' });
    }
    
    res.set('Content-Type', imageData.mimeType);
    res.send(imageData.data);
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

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
