import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, hotelBooking, InsertHotelBooking, reservations, InsertReservation, Reservation } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as fs from 'fs';
import * as path from 'path';

// Caminho para o arquivo de configuração persistente
const CONFIG_FILE = path.join(process.cwd(), 'hotel-config.json');

// Carregar configuração do arquivo
function loadHotelConfigFromFile() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);
      // Garante que campos numéricos sejam tratados corretamente
      return {
        ...config,
        depositPercentage: parseInt(config.depositPercentage) || 30,
        hospedageValue: parseFloat(config.hospedageValue) || 0,
        rating: parseFloat(config.rating) || 0,
        reviewCount: parseInt(config.reviewCount) || 0
      };
    }
  } catch (error) {
    console.warn('[Config] Erro ao carregar configuração:', error);
  }
  return null;
}

// Salvar configuração no arquivo
function saveHotelConfigToFile(data: any) {
  try {
    // Carrega o que já existe para não perder campos que não foram enviados no update
    const currentConfig = loadHotelConfigFromFile() || {};
    const updatedConfig = { ...currentConfig, ...data };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    console.log('[Config] Configuração salva com sucesso no arquivo');
  } catch (error) {
    console.error('[Config] Erro ao salvar configuração:', error);
  }
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values(user).onDuplicateKeyUpdate({ set: user });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDefaultHotelBooking() {
  const db = await getDb();
  if (!db) {
    return loadHotelConfigFromFile();
  }
  const result = await db.select().from(hotelBooking).limit(1);
  return result.length > 0 ? result[0] : loadHotelConfigFromFile();
}

export async function updateHotelBooking(id: number, data: Partial<InsertHotelBooking>) {
  const db = await getDb();
  // Salva sempre no arquivo para garantir persistência no Railway
  saveHotelConfigToFile(data);
  
  if (!db) return { affectedRows: 1 };
  return await db.update(hotelBooking).set(data).where(eq(hotelBooking.id, id));
}

export async function createHotelBooking(data: InsertHotelBooking) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(hotelBooking).values(data);
}

export async function createReservation(data: InsertReservation) {
  const db = await getDb();
  if (!db) {
    try {
      const reservationsDir = path.join(process.cwd(), 'reservations');
      if (!fs.existsSync(reservationsDir)) fs.mkdirSync(reservationsDir, { recursive: true });
      const timestamp = Date.now();
      const filename = path.join(reservationsDir, `reservation_${timestamp}.json`);
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      return { insertId: timestamp };
    } catch (error) {
      console.error('[Storage] Failed to save reservation:', error);
      return undefined;
    }
  }
  return await db.insert(reservations).values(data);
}

export async function getReservations(hotelBookingId: number) {
  const db = await getDb();
  if (!db) {
    try {
      const reservationsDir = path.join(process.cwd(), 'reservations');
      if (!fs.existsSync(reservationsDir)) return [];
      const files = fs.readdirSync(reservationsDir);
      return files.filter(f => f.endsWith('.json')).map(file => {
        return JSON.parse(fs.readFileSync(path.join(reservationsDir, file), 'utf-8'));
      });
    } catch (error) {
      return [];
    }
  }
  return await db.select().from(reservations).where(eq(reservations.hotelBookingId, hotelBookingId));
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
