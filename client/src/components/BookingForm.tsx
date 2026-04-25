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
}

export default function BookingForm({ onSubmit, totalPrice, paymentLink100, paymentLink30Pix, clientName, clientEmail, clientPhone, clientCpf, details, propertyName, roomType, breakfastIncluded, freeCancellationDate, mainGuestName, guestCount }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const nameParts = mainGuestName ? mainGuestName.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      firstName: firstName,
      lastName: lastName,
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

  const price30Percent = (totalPrice * 0.3).toFixed(2);

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
              <h3 className="font-bold text-foreground mb-1">
                Confirme seus dados
              </h3>
              <p className="text-xs text-muted-foreground">
                Suas informações de reserva
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs font-semibold">
                  Primeiro Nome <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Seu primeiro nome"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs font-semibold">
                  Sobrenome <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Seu sobrenome"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-semibold">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="country" className="text-xs font-semibold">
                  País
                </Label>
                <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                  <SelectTrigger className="mt-1 text-sm">
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
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Telefone <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+55 (11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="checkInTime" className="text-xs font-semibold">
                Horário de Check-in Preferido
              </Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => handleChange('checkInTime', e.target.value)}
                className="mt-1 text-sm"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Está reservando para si mesmo?
              </p>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="self"
                  checked={formData.bookingFor === 'self'}
                  onCheckedChange={() => handleChange('bookingFor', 'self')}
                  className="border-border"
                />
                <Label htmlFor="self" className="text-xs cursor-pointer">
                  Sim, estou reservando para mim
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="other"
                  checked={formData.bookingFor === 'other'}
                  onCheckedChange={() => handleChange('bookingFor', 'other')}
                  className="border-border"
                />
                <Label htmlFor="other" className="text-xs cursor-pointer">
                  A reservar para outra pessoa
                </Label>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="phoneConfirmation" className="text-xs font-semibold">
                  Confirmar Número de Telefone <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phoneConfirmation"
                  placeholder="Confirme seu número de telefone"
                  value={formData.phoneConfirmation}
                  onChange={(e) => handleChange('phoneConfirmation', e.target.value)}
                  required
                  className="border-border focus:border-primary focus:ring-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="towels" className="text-xs font-semibold">
                  Quantidade de Toalhas
                </Label>
                <Input
                  id="towels"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.towels}
                  onChange={(e) => handleChange('towels', parseInt(e.target.value))}
                  className="border-border focus:border-primary focus:ring-primary transition-colors text-sm"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <Button
                type="button"
                onClick={() => setShowPayment(true)}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-sm transition-colors text-sm"
              >
                Próximo: Finalizar Reserva
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-foreground text-lg mb-2">
                Confirme seus dados
              </h3>
              <p className="text-xs text-muted-foreground">
                Suas informações de reserva
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-3 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Nome Completo</p>
                  <p className="text-sm font-semibold text-foreground">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">CPF</p>
                  <p className="text-sm font-semibold text-foreground">{clientCpf || 'Não informado'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Telefone</p>
                  <p className="text-sm font-semibold text-foreground">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Hóspedes</p>
                  <p className="text-sm font-semibold text-foreground">{formData.towels}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Horário de Check-in</p>
                <p className="text-sm font-semibold text-foreground">{formData.checkInTime}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-lg mb-2">
                  Escolha a forma de pagamento
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecione como deseja completar o pagamento
                </p>
              </div>

              {/* Opção de Cartão de Crédito - Sempre Disponível */}
              <div
                onClick={() => setPaymentMethod('full')}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'full'
                    ? 'border-primary bg-blue-50'
                    : 'border-border hover:border-primary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'full'
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {paymentMethod === 'full' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-sm">
                      Pagar 100% com Cartão
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pague o valor total de R$ {totalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">
                      R$ {totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {paymentLink30Pix && (
                    <div
                      onClick={() => setPaymentMethod('30percent')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === '30percent'
                          ? 'border-primary bg-blue-50'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === '30percent'
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          }`}
                        >
                          {paymentMethod === '30percent' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-sm">
                            Pagar 30% agora via PIX
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pague apenas 30% da reserva e o restante na chegada
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">
                            R$ {price30Percent}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            de R$ {totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                     </div>
                  )}

              {paymentMethod === 'full' && (
                <div className="border border-border rounded-lg p-6 bg-white space-y-4">
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Informações do Cartão</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Preencha os dados do seu cartão de crédito de forma segura
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName" className="text-xs font-semibold">
                      Nome do Titular <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="cardholderName"
                      placeholder="Nome como aparece no cartão"
                      value={formData.cardholderName || ''}
                      onChange={(e) => handleChange('cardholderName', e.target.value.toUpperCase())}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-xs font-semibold">
                      Número do Cartão <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber || ''}
                      onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength="19"
                      className="mt-1 text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-xs font-semibold">
                        Validade <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry || ''}
                        onChange={(e) => handleChange('cardExpiry', formatExpiry(e.target.value))}
                        maxLength="5"
                        className="mt-1 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv" className="text-xs font-semibold">
                        CVV <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        value={formData.cardCvv || ''}
                        onChange={(e) => handleChange('cardCvv', e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                        maxLength="3"
                        type="password"
                        className="mt-1 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === '30percent' && paymentLink30Pix && (
                <div className="border-t border-border pt-6 space-y-4 bg-blue-50 p-4 rounded">
                  <p className="text-sm font-semibold text-foreground">
                    Você será redirecionado para o link de pagamento seguro via PIX.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique em "Finalizar Reserva" para continuar com o pagamento.
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="marketing"
                    defaultChecked
                    className="mt-1"
                  />
                  <Label htmlFor="marketing" className="text-xs text-muted-foreground cursor-pointer">
                    Concordo em receber e-mails de marketing, incluindo promocoes, recomendacoes personalizadas, recompensas, experiencias de viagem e atualizacoes sobre os produtos e servicos.
                  </Label>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  A reserva e feita diretamente com <span className="font-semibold text-foreground">{propertyName || 'Seu Imovel'}</span>, ou seja, ao completar esta reserva, concorda com as <span className="text-primary cursor-pointer hover:underline">condicoes da reserva</span>, os <span className="text-primary cursor-pointer hover:underline">termos gerais</span>, a <span className="text-primary cursor-pointer hover:underline">politica de privacidade</span> e os <span className="text-primary cursor-pointer hover:underline">termos da Carteira</span>.
                </p>
              </div>

              <div className="border-t border-border pt-4 flex gap-3">
                {paymentMethod === 'full' ? (
                  <Button
                    type="submit"
                    disabled={!isCardValid()}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold py-3 rounded-sm transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Finalizar Reserva
                  </Button>
                ) : paymentMethod === '30percent' && paymentLink30Pix ? (
                  <a
                    href={paymentLink30Pix}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-sm transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Finalizar Reserva
                    </Button>
                  </a>
                ) : (
                  <Button
                    type="button"
                    disabled
                    className="flex-1 bg-gray-300 text-gray-600 font-bold py-3 rounded-sm text-sm"
                  >
                    Selecione uma forma de pagamento
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  variant="outline"
                  className="border-border hover:bg-secondary text-sm"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
