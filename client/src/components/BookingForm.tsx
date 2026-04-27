import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phone: string;
  phoneConfirmation: string;
  towels: number;
  checkInTime: string;
  paperlessConfirmation: boolean;
  bookingFor: 'self' | 'other';
  workTravel: 'yes' | 'no' | 'not-specified';
  specialRequests: string;
  arrivalTime: string;
  cardholderName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

interface BookingFormProps {
  onSubmit?: (data: BookingFormData) => void;
  totalPrice: number;
  paymentLink100?: string;
  paymentLink30Pix?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCpf?: string;
  details?: string[];
  propertyName?: string;
  roomType?: string;
  breakfastIncluded?: boolean;
  freeCancellationDate?: string;
  mainGuestName?: string;
  guestCount?: number;
  pixPercentage?: number;        // ← NOVO: porcentagem vinda do Admin
}

export default function BookingForm({
  onSubmit,
  totalPrice,
  paymentLink100,
  paymentLink30Pix,
  clientName,
  clientEmail,
  clientPhone,
  clientCpf,
  details,
  propertyName,
  roomType,
  breakfastIncluded,
  freeCancellationDate,
  mainGuestName,
  guestCount,
  pixPercentage = 30,   // Valor padrão caso não venha do Admin
}: BookingFormProps) {

  const [formData, setFormData] = useState<BookingFormData>(() => {
    const nameParts = mainGuestName ? mainGuestName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
      email: clientEmail || '',
      country: 'BR',
      phone: clientPhone || '',
      phoneConfirmation: clientPhone || '',
      towels: guestCount || 2,
      checkInTime: '14:00',
      paperlessConfirmation: true,
      bookingFor: 'self',
      workTravel: 'not-specified',
      specialRequests: '',
      arrivalTime: '',
      cardholderName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    };
  });

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'full' | '30percent' | null>(null);

  // Atualiza dados quando props mudam
  useEffect(() => {
    const nameParts = mainGuestName ? mainGuestName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setFormData(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: clientEmail || prev.email,
      phone: clientPhone || prev.phone,
      phoneConfirmation: clientPhone || prev.phoneConfirmation,
      towels: guestCount || prev.towels,
    }));
  }, [mainGuestName, clientEmail, clientPhone, guestCount]);

  const handleChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  // ====================== CÁLCULO COM PORCENTAGEM DINÂMICA ======================
  const currentPixPercentage = pixPercentage;
  const pricePix = (totalPrice * (currentPixPercentage / 100)).toFixed(2);
  // =============================================================================

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  const isCardValid = () => {
    return (
      formData.cardholderName &&
      formData.cardNumber &&
      formData.cardNumber.replace(/\s/g, '').length === 16 &&
      formData.cardExpiry &&
      formData.cardExpiry.length === 5 &&
      formData.cardCvv &&
      formData.cardCvv.length === 3
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!showPayment ? (
        <>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-1">Confirme seus dados</h3>
              <p className="text-xs text-muted-foreground">Suas informações de reserva</p>
            </div>

            {/* Campos de dados pessoais (mantidos iguais) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">Primeiro Nome *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>País</Label>
                <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Horário de Check-in Preferido</Label>
              <Input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => handleChange('checkInTime', e.target.value)}
              />
            </div>

            {/* Outros checkboxes e campos... mantidos simplificados */}
          </div>

          <Button 
            type="button"
            onClick={() => setShowPayment(true)}
            className="w-full"
          >
            Próximo: Finalizar Reserva
          </Button>
        </>
      ) : (
        <div className="space-y-6">
          <h3 className="font-bold">Escolha a forma de pagamento</h3>

          <div className="space-y-4">
            {/* Pagamento 100% Cartão */}
            <Button 
              type="button"
              onClick={() => {
                setPaymentMethod('full');
                // Aqui você pode chamar lógica de pagamento 100%
                alert(`Redirecionando para pagamento de 100% via Cartão\nValor: R$ ${totalPrice}`);
              }}
              className="w-full h-16 text-lg"
            >
              💳 Pagar 100% com Cartão<br />
              <span className="text-sm">R$ {totalPrice.toFixed(2)}</span>
            </Button>

            {/* Pagamento via PIX com % dinâmica */}
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                setPaymentMethod('30percent');
                // Aqui você pode chamar lógica de pagamento PIX
                alert(`Redirecionando para pagamento de ${currentPixPercentage}% via PIX\nValor: R$ ${pricePix}`);
              }}
              className="w-full h-16 text-lg border-2"
            >
              📱 Pagar {currentPixPercentage}% via PIX<br />
              <span className="text-sm">R$ {pricePix}</span>
            </Button>
          </div>

          <Button 
            type="button" 
            variant="ghost"
            onClick={() => setShowPayment(false)}
            className="w-full"
          >
            ← Voltar
          </Button>
        </div>
      )}
    </form>
  );
}