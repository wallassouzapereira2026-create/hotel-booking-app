import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Lock } from 'lucide-react';
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
    pixPercentage?: number;   // NOVO
  };
  onHotelInfoChange: (info: any) => void;
}

const ADMIN_PASSWORD = '12345678';

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
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: base64Data, mimeType: file.type }),
          });

          if (!response.ok) {
            toast.error(`Erro ao fazer upload de ${file.name}`);
            return;
          }

          const data = await response.json();
          const newPhoto = {
            id: Date.now().toString() + Math.random(),
            url: data.url,
            title: file.name.split('.')[0],
          };
          onPhotosChange([...photos, newPhoto]);
          toast.success(`Foto ${file.name} adicionada!`);
        } catch (error) {
          toast.error(`Erro ao processar ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
    setFileInputKey(prev => prev + 1);
  };

  const handleRemovePhoto = (id: string) => {
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
          <button onClick={handleLogout} className="p-1 hover:bg-primary/80 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-6 flex items-center justify-center min-h-96">
            <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold">Acesso Restrito</h3>
                <p className="text-sm text-muted-foreground mt-1">Digite a senha para acessar</p>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
              <Button type="submit" className="w-full">Entrar</Button>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Informações da Reserva</h3>

              <div className="space-y-3">
                <div>
                  <Label>Valor da Hospedagem (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={hotelInfo.hospedageValue}
                    onChange={(e) => onHotelInfoChange({ ...hotelInfo, hospedageValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* CAMPO NOVO - PORCENTAGEM PIX */}
                <div>
                  <Label htmlFor="pixPercentage">Porcentagem do Sinal via PIX (%)</Label>
                  <Input
                    id="pixPercentage"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={hotelInfo.pixPercentage ?? 30}
                    onChange={(e) => onHotelInfoChange({
                      ...hotelInfo,
                      pixPercentage: parseInt(e.target.value) || 30
                    })}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Defina aqui a % que aparecerá no pagamento via PIX (1 a 100)
                  </p>
                </div>

                {/* Outros campos existentes - mantenha se quiser */}
                <div>
                  <Label>Link de Pagamento 100% (Cartão)</Label>
                  <Input
                    value={hotelInfo.paymentLink100 || ''}
                    onChange={(e) => onHotelInfoChange({ ...hotelInfo, paymentLink100: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Link de Pagamento PIX</Label>
                  <Input
                    value={hotelInfo.paymentLink30Pix || ''}
                    onChange={(e) => onHotelInfoChange({ ...hotelInfo, paymentLink30Pix: e.target.value })}
                  />
                </div>

                {/* Adicione aqui os outros campos que você tinha se quiser (nome, email, etc.) */}
              </div>
            </section>

            {/* Botão Salvar */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={async () => {
                  try {
                    await updateHotelDataMutation.mutateAsync(hotelInfo);
                    toast.success('Salvo com sucesso!');
                    handleLogout();
                  } catch (err) {
                    toast.error('Erro ao salvar');
                  }
                }}
                className="flex-1"
              >
                Salvar e Fechar
              </Button>
              <Button variant="outline" onClick={handleLogout}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}