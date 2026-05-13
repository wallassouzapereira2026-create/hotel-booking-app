import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, hotelBooking, InsertHotelBooking, reservations, InsertReservation, Reservation, hospedes, InsertHospede, Hospede } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as fs from 'fs';
import * as path from 'path';

// Caminho para o arquivo de configuração persistente
const CONFIG_FILE = path.join(process.cwd(), 'hotel-config.json');
const HOSPEDES_FILE = path.join(process.cwd(), 'hospedes-data.json');

// Carregar hóspedes do arquivo
function loadHospedesFromFile(): any[] {
  try {
    if (fs.existsSync(HOSPEDES_FILE)) {
      const data = fs.readFileSync(HOSPEDES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('[Hospedes] Erro ao carregar hóspedes:', error);
  }
  return [];
}

// Salvar hóspedes no arquivo
function saveHospedestoFile(hospedes: any[]) {
  try {
    fs.writeFileSync(HOSPEDES_FILE, JSON.stringify(hospedes, null, 2));
    console.log('[Hospedes] Hóspedes salvos com sucesso');
  } catch (error) {
    console.error('[Hospedes] Erro ao salvar hóspedes:', error);
  }
}

// Variável global para armazenar hóspedes em memória
let _hospedes: any[] = [];

// Inicializar hóspedes
function initHospedes() {
  _hospedes = loadHospedesFromFile();
  console.log(`[Hospedes] ${_hospedes.length} hóspedes carregados`);
}

// Chamar inicialização
initHospedes();

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
    // Remove o campo hotelImage para não salvar base64 no arquivo
    delete updatedConfig.hotelImage;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    console.log('[Config] Configuração salva com sucesso no arquivo');
  } catch (error) {
    console.error('[Config] Erro ao salvar configuração:', error);
  }
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL || ENV.databaseUrl;
    if (!dbUrl) {
      console.warn('[Database] DATABASE_URL não configurado');
      return null;
    }
    try {
      console.log('[Database] Conectando ao banco...');
      _db = drizzle(dbUrl);
      console.log('[Database] Conectado com sucesso!');
    } catch (error) {
      console.error("[Database] Erro ao conectar:", error);
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

export async function getHotelBookingById(id: number) {
  const db = await getDb();
  if (!db) {
    return loadHotelConfigFromFile();
  }
  const result = await db.select().from(hotelBooking).where(eq(hotelBooking.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
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

// Funções para hospedes
export async function getHospedeBySlug(slug: string): Promise<Hospede | null> {
  // Usar arquivo em vez de banco de dados
  const hospede = _hospedes.find((h: any) => h.slug === slug);
  return hospede || null;
}

export async function getAllHospedes(): Promise<Hospede[]> {
  // Usar arquivo em vez de banco de dados
  return _hospedes;
}

export async function createHospede(data: InsertHospede) {
  try {
    console.log('[Hospedes] Criando hóspede:', data.slug);
    const newHospede = {
      id: _hospedes.length > 0 ? Math.max(..._hospedes.map((h: any) => h.id)) + 1 : 1,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _hospedes.push(newHospede);
    saveHospedestoFile(_hospedes);
    console.log('[Hospedes] Hóspede criado com sucesso:', newHospede.id);
    return { insertId: newHospede.id };
  } catch (error) {
    console.error('[Hospedes] Erro ao criar hóspede:', error);
    throw error;
  }
}

export async function updateHospede(id: number, data: Partial<InsertHospede>) {
  try {
    console.log('[Hospedes] Atualizando hóspede:', id);
    const index = _hospedes.findIndex((h: any) => h.id === id);
    if (index === -1) {
      console.error('[Hospedes] Hóspede não encontrado:', id);
      return undefined;
    }
    _hospedes[index] = {
      ..._hospedes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveHospedestoFile(_hospedes);
    console.log('[Hospedes] Hóspede atualizado com sucesso:', id);
    return { affectedRows: 1 };
  } catch (error) {
    console.error('[Hospedes] Erro ao atualizar hóspede:', error);
    throw error;
  }
}

export async function updateHospedeOld(id: number, data: Partial<InsertHospede>) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(hospedes).set(data).where(eq(hospedes.id, id));
}

export async function deleteHospede(id: number) {
  try {
    console.log('[Hospedes] Deletando hóspede:', id);
    const index = _hospedes.findIndex((h: any) => h.id === id);
    if (index === -1) {
      console.error('[Hospedes] Hóspede não encontrado:', id);
      return undefined;
    }
    _hospedes.splice(index, 1);
    saveHospedestoFile(_hospedes);
    console.log('[Hospedes] Hóspede deletado com sucesso:', id);
    return { affectedRows: 1 };
  } catch (error) {
    console.error('[Hospedes] Erro ao deletar hóspede:', error);
    throw error;
  }
}

export async function deleteHospedeOld(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.delete(hospedes).where(eq(hospedes.id, id));
}
