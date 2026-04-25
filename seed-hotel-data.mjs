import { drizzle } from 'drizzle-orm/mysql2';
import { hotelBooking } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const hotelData = {
  propertyName: 'casa porto',
  clientName: 'claudio silva',
  address: 'Praia de Taperapuan, Porto Seguro, CEP 45810-000, Brazil',
  rating: 8.9,
  reviewCount: 1245,
  checkInDate: '2026-02-10',
  checkOutDate: '2026-02-16',
  hospedageValue: 4999.96,
  paymentLink100: 'https://hub.payevo.com.br/pay/b991e2ae-0cbd-4aad-9c9b-430170035073',
  paymentLink30Pix: 'https://hub.payevo.com.br/pay/b991e2ae-0cbd-4aad-9c9b-430170035073',
  clientEmail: 'wallas@booking.example.com',
  clientPhone: '+55 (11) 7854525218',
  clientCpf: '812.448.515-45',
  guestCount: 4,
  detail1: 'Não reembolsvel',
  detail2: 'WiFi disponível',
  detail3: 'Garagem',
  roomType: 'Quarto Duplo',
  breakfastIncluded: 1,
  freeCancellationDate: '2026-02-07',
  mainGuestName: 'claudio silva',
  photos: '[{"id":"17692689864920.06668954180096298","url":"/uploads/23UnLy1sJnWCYGpZEgPUa.jpeg","title":"WhatsApp Image 2026-01-17 at 10"}]',
};

async function seedData() {
  try {
    console.log('Iniciando migração de dados de hotéis...');
    
    // Limpar dados existentes
    await db.delete(hotelBooking);
    console.log('Dados antigos removidos');
    
    // Inserir novo dado
    await db.insert(hotelBooking).values(hotelData);
    console.log('Dados de hotel inseridos com sucesso!');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao migrar dados:', error);
    process.exit(1);
  }
}

seedData();
