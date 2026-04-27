import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Info } from 'lucide-react';
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
  propertyName?: string;
}

export default function BookingForm({ 
  onSubmit, 
  totalPrice, 
  paymentLink100, 
  paymentLink30Pix, 
  depositPercentage = 30,
  clientName = '',
  clientEmail = '',
  clientPhone = '',
  clientCpf = '',
  propertyName = 'o hotel'
}: BookingFormProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: clientName.split(' ')[0] || '',
    lastName: clientName.split(' ').slice(1).join(' ') || '',
    email: clientEmail,
    country: 'Brazil',
    phone: clientPhone,
    phoneConfirmation: clientPhone,
    towels: 2,
    checkInTime: '14:00',
    paperlessConfirmation: true,
    bookingFor: 'self',
    workTravel: 'not-specified',
    specialRequests: '',
    arrivalTime: '14:00',
    cardholderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const depositAmount = (totalPrice * (depositPercentage / 100)).toFixed(2);

  const handleChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayment) {
      setShowPayment(true);
      window.scrollTo(0, 0);
      return;
    }
    if (onSubmit) {
      onSubmit({ ...formData, paymentMethod } as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!showPayment ? (
        <div className="bg-white p-6 border rounded-sm shadow-sm space-y-6">
          <h3 className="text-xl font-bold">Insira seus dados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input required value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sobrenome</Label>
              <Input required value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço de e-mail</Label>
            <Input type="email" required value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
            <p className="text-xs text-muted-foreground">O e-mail de confirmação será enviado para este endereço</p>
          </div>
          <div className="space-y-2">
            <Label>Telefone (preferencialmente WhatsApp)</Label>
            <Input required value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3">
            Próximo: Últimos detalhes
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 border rounded-sm shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Escolha a forma de pagamento</h3>
            
            <div className="space-y-4">
              {/* Opção Cartão */}
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'hover:border-gray-400'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-gray-400'}`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="font-bold">Pagar 100% com Cartão</p>
                      <p className="text-xs text-muted-foreground">Pague o valor total de R$ {totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-bold">R$ {totalPrice.toFixed(2)}</p>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Nome no cartão</Label>
                      <Input required value={formData.cardholderName} onChange={(e) => handleChange('cardholderName', e.target.value)} placeholder="Como escrito no cartão" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Número do cartão</Label>
                      <div className="relative">
                        <Input required value={formData.cardNumber} onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))} maxLength={19} placeholder="0000 0000 0000 0000" />
                        <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Validade</Label>
                        <Input required value={formData.cardExpiry} onChange={(e) => handleChange('cardExpiry', formatExpiry(e.target.value))} maxLength={5} placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">CVV</Label>
                        <Input required value={formData.cardCvv} onChange={(e) => handleChange('cardCvv', e.target.value.replace(/\D/g, ''))} maxLength={3} placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Opção PIX */}
              <div 
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'hover:border-gray-400'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'pix' ? 'border-primary' : 'border-gray-400'}`}>
                      {paymentMethod === 'pix' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="font-bold">Pagar {depositPercentage}% agora via PIX</p>
                      <p className="text-xs text-muted-foreground">Pague apenas {depositPercentage}% da reserva e o restante na chegada</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {depositAmount}</p>
                    <p className="text-[10px] text-muted-foreground">de R$ {totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="mt-4 p-4 bg-blue-100/50 border border-blue-200 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-blue-900 font-medium">Você será redirecionado para o link de pagamento seguro via PIX.</p>
                    <p className="text-sm text-blue-900">Clique em "Finalizar Reserva" para continuar com o pagamento.</p>
                    
                    {/* AVISO DOS BANCOS ADICIONADO AQUI */}
                    <div className="flex items-start gap-2 p-3 bg-white border border-blue-200 rounded shadow-sm">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900">
                        <strong>Atenção:</strong> No momento não estamos aceitando pagamentos via <strong>Nubank</strong> e <strong>Itaú</strong>. Por favor, utilize outro banco para concluir sua reserva.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-2">
                <Checkbox id="marketing" checked={formData.paperlessConfirmation} onCheckedChange={(checked) => handleChange('paperlessConfirmation', checked)} />
                <Label htmlFor="marketing" className="text-xs leading-tight cursor-pointer">
                  Concordo em receber e-mails de marketing, incluindo promocoes, recomendacoes personalizadas, recompensas, experiencias de viagem e atualizacoes sobre os produtos e servicos.
                </Label>
              </div>
              <p className="text-[10px] text-muted-foreground">
                A reserva e feita diretamente com {propertyName}, ou seja, ao completar esta reserva, concorda com as condicoes da reserva, os termos gerais, a politica de privacidade e os termos da Carteira.
              </p>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg">
                  Finalizar Reserva
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPayment(false)} className="py-6 px-8">
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
