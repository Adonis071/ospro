/**
 * ATENÇÃO: BACKEND EM MODO DE ESPERA (STANDBY)
 * 
 * Este servidor Express/Node.js foi construído e está 100% funcional, fornecendo endpoints
 * de Autenticação (/api/auth) e Gerenciamento de Clientes (/api/customers).
 * 
 * No entanto, para fins de demonstração, deploy estático e facilidade de testes,
 * o frontend atualmente foi configurado para **IGNORAR este backend**, utilizando
 * exclusivamente o `localStorage` do navegador para simular banco de dados e autenticação.
 * 
 * Se você for VENDER ou COMERCIALIZAR este aplicativo:
 * 1. O backend está pronto para uso e integra as lógicas de Banco de Dados local (database.json).
 * 2. Reative as chamadas de API (fetch) nos componentes do frontend, substituindo 
 *    as lógicas atuais de `localStorage` de volta para `/api/customers` e `/api/auth/*`.
 * 3. Rotas como o uso da Gemini AI (/api/gemini/finance-summary) e WhatsApp (/api/whatsapp/send)
 *    permanecem operando através deste servidor para ocultar chaves de API com segurança.
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key-change-me-in-production';
const DB_FILE = path.join(process.cwd(), 'database.json');

async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], customers: [] };
  }
}

async function writeDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Authentication endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const db = await readDB();
      res.json(db.customers || []);
    } catch (error) {
      console.error("Fetch Customers Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const { name, phone, email, address } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required" });
      }

      const db = await readDB();
      if (!db.customers) db.customers = [];
      
      const newCustomer = { 
        id: Date.now().toString(), 
        name, 
        phone, 
        email: email || '', 
        address: address || '',
        createdAt: new Date().toISOString()
      };
      
      db.customers.push(newCustomer);
      await writeDB(db);

      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Create Customer Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const db = await readDB();
      const existingUser = db.users.find((u: any) => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const newUser = { id: Date.now().toString(), name, email, password_hash };
      db.users.push(newUser);
      await writeDB(db);

      const token = jwt.sign({ id: newUser.id, email, name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: newUser.id, name, email } });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      const db = await readDB();
      const user = db.users.find((u: any) => u.email === email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Summary endpoint
  app.post("/api/gemini/finance-summary", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const { dataAnual, transactions } = req.body;

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
Você é um consultor financeiro. 
Por favor, analise brevemente os seguintes dados financeiros e resuma a situação atual da empresa. Seja direto, profissional e gere cerca de 3 a 4 frases (sem formatação markdown complexa).

Faturamento Anual até o momento: 
${JSON.stringify(dataAnual)}

Últimas Transações:
${JSON.stringify(transactions)}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      res.json({ summary: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // WhatsApp notification endpoint
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ error: "Phone and message are required" });
      }

      const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
      const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 11 || cleanPhone.length === 10) {
        cleanPhone = `55${cleanPhone}`;
      }

      const payload = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: {
          body: message
        }
      };

      if (!WHATSAPP_API_TOKEN) {
        console.log('[WhatsApp API Simulada - Servidor] Enviando payload:', JSON.stringify(payload, null, 2));
        await new Promise(resolve => setTimeout(resolve, 800));
        return res.json({ success: true, simulated: true });
      }

      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[WhatsApp API] Erro no envio:', errorData);
        return res.status(response.status).json({ error: "WhatsApp API error", details: errorData });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('[WhatsApp API] Falha de conexão:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Catch-all for SPA routing. (Using Express v4 syntax as per package.json express ^4.21.2)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
