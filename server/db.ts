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
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('[Config] Erro ao carregar configuração:', error);
  }
  return null;
}

// Salvar configuração no arquivo
function saveHotelConfigToFile(data: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    console.log('[Config] Configuração salva com sucesso');
  } catch (error) {
    console.error('[Config] Erro ao salvar configuração:', error);
  }
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getDefaultHotelBooking() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hotel booking: database not available, loading from file");
    return loadHotelConfigFromFile();
  }

  const result = await db.select().from(hotelBooking).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateHotelBooking(id: number, data: Partial<InsertHotelBooking>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update hotel booking: database not available, saving to file");
    // Salvar em arquivo como fallback
    saveHotelConfigToFile(data);
    return { affectedRows: 1 };
  }

  const result = await db.update(hotelBooking).set(data).where(eq(hotelBooking.id, id));
  // Também salvar em arquivo para persistência
  saveHotelConfigToFile(data);
  return result;
}

export async function createHotelBooking(data: InsertHotelBooking) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create hotel booking: database not available");
    return undefined;
  }

  const result = await db.insert(hotelBooking).values(data);
  return result;
}

export async function createReservation(data: InsertReservation) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create reservation: database not available, using fallback storage");
    // Fallback: salvar em arquivo JSON
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      const reservationsDir = path.join(process.cwd(), 'reservations');
      
      // Criar diretório se não existir
      try {
        await fs.mkdir(reservationsDir, { recursive: true });
      } catch (e) {
        // Diretório já existe
      }
      
      const timestamp = Date.now();
      const filename = path.join(reservationsDir, `reservation_${timestamp}.json`);
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`[Storage] Reservation saved to ${filename}`);
      return { insertId: timestamp };
    } catch (error) {
      console.error('[Storage] Failed to save reservation:', error);
      return undefined;
    }
  }

  const result = await db.insert(reservations).values(data);
  return result;
}

export async function getReservations(hotelBookingId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get reservations: database not available, using fallback storage");
    // Fallback: ler arquivos JSON
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      const reservationsDir = path.join(process.cwd(), 'reservations');
      
      try {
        const files = await fs.readdir(reservationsDir);
        const reservationsList = [];
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(reservationsDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            if (data.hotelBookingId === hotelBookingId) {
              reservationsList.push(data);
            }
          }
        }
        
        return reservationsList;
      } catch (error) {
        console.error('[Storage] Failed to read reservations:', error);
        return [];
      }
    } catch (error) {
      console.error('[Storage] Error:', error);
      return [];
    }
  }

  const result = await db.select().from(reservations).where(eq(reservations.hotelBookingId, hotelBookingId));
  return result;
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get reservation: database not available");
    return undefined;
  }

  const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
