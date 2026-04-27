import React, { useState } from 'react';
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
  depositPercentage?: number;
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
}

export default function BookingForm({ 
  onSubmit, 
  totalPrice, 
  paymentLink100, 
  paymentLink30Pix, 
  depositPercentage = 30,
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
  guestCount 
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const nameParts = mainGuestName ? mainGuestName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      firstName,
      lastName,
      email: clientEmail || '',
      country: 'Brazil',
      phone: clientPhone || '',
      phoneConfirmation: clientPhone || '',
      towels: guestCount || 2,
      checkInTime: '14:00',
      paperlessConfirmation: true,
      bookingFor: 'self',
      workTravel: 'not-specified',
      specialRequests: '',
      arrivalTime: '14:00 - 15:00',
      cardholderName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    };
  });

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'full' | '30percent'>('full');

  const handleChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const depositAmount = (totalPrice * (depositPercentage / 100)).toFixed(2);
  const remainingAmount = (totalPrice - parseFloat(depositAmount)).toFixed(2);

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
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs font-semibold">Primeiro Nome *</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required className="mt-1 text-sm" />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs font-semibold">Sobrenome *</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required className="mt-1 text-sm" />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-semibold">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required className="mt-1 text-sm" />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-semibold">Telefone *</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required className="mt-1 text-sm" />
            </div>

            <div className="border-t border-border pt-4">
              <Button type="button" onClick={() => setShowPayment(true)} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-sm text-sm">
                Próximo: Finalizar Reserva
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            <div className="border border-border rounded-lg p-4 space-y-3 bg-white">
              <h3 className="font-bold text-foreground text-sm border-b pb-2">Resumo da Reserva</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-semibold">{formData.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-lg">Escolha a forma de pagamento</h3>

              {/* Opção Cartão 100% */}
              <div onClick={() => setPaymentMethod('full')} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'full' ? 'border-primary bg-blue-50' : 'border-border'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm">Pagar 100% com Cartão</h4>
                    <p className="text-xs text-muted-foreground">Total: R$ {totalPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-primary">R$ {totalPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Opção Depósito Flexível PIX */}
              {paymentLink30Pix && (
                <div onClick={() => setPaymentMethod('30percent')} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === '30percent' ? 'border-primary bg-blue-50' : 'border-border'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm">Pagar {depositPercentage}% agora via PIX</h4>
                      <p className="text-xs text-muted-foreground">Restante (R$ {remainingAmount}) na chegada</p>
                    </div>
                    <p className="font-bold text-primary">R$ {depositAmount}</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'full' && (
                <div className="border border-border rounded-lg p-6 bg-white space-y-4">
                  <h4 className="font-bold text-sm border-b pb-2">Dados do Cartão</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Nome no Cartão</Label>
                      <Input value={formData.cardholderName} onChange={(e) => handleChange('cardholderName', e.target.value.toUpperCase())} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Número do Cartão</Label>
                      <Input value={formData.cardNumber} onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))} maxLength={19} className="text-sm font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Validade</Label>
                        <Input value={formData.cardExpiry} onChange={(e) => handleChange('cardExpiry', formatExpiry(e.target.value))} maxLength={5} placeholder="MM/YY" className="text-sm font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs">CVV</Label>
                        <Input value={formData.cardCvv} onChange={(e) => handleChange('cardCvv', e.target.value.replace(/\D/g, ''))} maxLength={3} className="text-sm font-mono" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-sm">
                Finalizar Reserva
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowPayment(false)} className="w-full text-xs text-muted-foreground">
                Voltar e editar dados
              </Button>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
