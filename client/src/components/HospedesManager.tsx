import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, Edit2, Trash2, Plus, ChevronDown, ChevronUp, Upload, CreditCard, Settings } from 'lucide-react';

interface HospedeFormData {
  slug: string;
  photoUrl?: string;
  propertyName: string;
  clientName: string;
  address: string;
  rating: number;
  reviewCount: number;
  checkInDate: string;
  checkOutDate: string;
  hospedageValue: number;
  depositPercentage: number;
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
}

const defaultFormData: HospedeFormData = {
  slug: '',
  photoUrl: '',
  propertyName: 'Luxury Beachfront Resort',
  clientName: '',
  address: 'Praia de Taperapuan, Porto Seguro, CEP 45810-000, Brazil',
  rating: 8.9,
  reviewCount: 1245,
  checkInDate: '2026-02-13',
  checkOutDate: '2026-02-17',
  hospedageValue: 2198,
  depositPercentage: 30,
  paymentLink100: '',
  paymentLink30Pix: '',
  clientEmail: '',
  clientPhone: '',
  clientCpf: '',
  guestCount: 2,
  detail1: 'Não reembolsável',
  detail2: 'WiFi disponível',
  detail3: 'Café da manhã incluído',
  roomType: 'Quarto Duplo',
  breakfastIncluded: true,
  freeCancellationDate: '2026-01-29',
  mainGuestName: '',
};

export default function HospedesManager() {
  const [activeTab, setActiveTab] = useState<'hospedes' | 'cartoes' | 'configuracoes'>('hospedes');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HospedeFormData>(defaultFormData);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [defaultHotelData, setDefaultHotelData] = useState<any>(null);

  const { data: hospedes, isLoading, refetch } = trpc.hospedes.getAll.useQuery();
  const { data: reservations } = trpc.reservations.getByHotel.useQuery({ hotelBookingId: 1 });
  const { data: hotelData } = trpc.hotelBooking.getById.useQuery({ id: 1 });

  // Sincronizar hotelData com defaultHotelData
  React.useEffect(() => {
    if (hotelData) {
      setDefaultHotelData(hotelData);
    }
  }, [hotelData]);
  const createMutation = trpc.hospedes.create.useMutation();
  const updateMutation = trpc.hospedes.update.useMutation();
  const deleteMutation = trpc.hospedes.delete.useMutation();
  const updateHotelMutation = trpc.hotelBooking.update.useMutation();

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
      const data = await response.json();
      setFormData({ ...formData, photoUrl: data.url });
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao enviar foto: ${errorMsg}`);
      console.error(error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleEditClick = (hospede: any) => {
    setEditingId(hospede.id);
    setIsCreating(false);
    setFormData({
      slug: hospede.slug,
      photoUrl: hospede.photoUrl || '',
      propertyName: hospede.propertyName,
      clientName: hospede.clientName,
      address: hospede.address || '',
      rating: hospede.rating || 0,
      reviewCount: hospede.reviewCount || 0,
      checkInDate: hospede.checkInDate || '',
      checkOutDate: hospede.checkOutDate || '',
      hospedageValue: hospede.hospedageValue || 0,
      paymentLink100: hospede.paymentLink100 || '',
      paymentLink30Pix: hospede.paymentLink30Pix || '',
      clientEmail: hospede.clientEmail || '',
      clientPhone: hospede.clientPhone || '',
      clientCpf: hospede.clientCpf || '',
      guestCount: hospede.guestCount || 0,
      detail1: hospede.detail1 || '',
      detail2: hospede.detail2 || '',
      detail3: hospede.detail3 || '',
      roomType: hospede.roomType || '',
      breakfastIncluded: hospede.breakfastIncluded ? true : false,
      freeCancellationDate: hospede.freeCancellationDate || '',
      mainGuestName: hospede.mainGuestName || '',
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handleSave = async () => {
    if (!formData.slug.trim()) {
      toast.error('Slug é obrigatório');
      return;
    }

    if (!formData.clientName.trim()) {
      toast.error('Nome do hóspede é obrigatório');
      return;
    }

    try {
      if (isCreating) {
        await createMutation.mutateAsync(formData);
        toast.success('Hóspede criado com sucesso!');
      } else if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success('Hóspede atualizado com sucesso!');
      }
      refetch();
      handleCancel();
    } catch (error) {
      toast.error('Erro ao salvar hóspede');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este hóspede?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Hóspede deletado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar hóspede');
      console.error(error);
    }
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/hospede/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando hóspedes...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciador de Hóspedes</h1>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus size={20} />
          Novo Hóspede
        </Button>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('hospedes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'hospedes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Hóspedes
        </button>
        <button
          onClick={() => setActiveTab('cartoes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cartoes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <CreditCard size={18} />
          Cartões
        </button>
        <button
          onClick={() => setActiveTab('configuracoes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'configuracoes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Settings size={18} />
          Configurações
        </button>
      </div>

      {/* Aba Hóspedes */}
      {activeTab === 'hospedes' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus size={20} />
              Novo Hóspede
            </Button>
          </div>

          {/* Formulário de Criação/Edição */}
          {(isCreating || editingId) && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-bold mb-4">
            {isCreating ? 'Criar Novo Hóspede' : 'Editar Hóspede'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Slug (identificador único, ex: casa1, suite-luxo)
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase() })
                }
                placeholder="casa1"
                disabled={!isCreating}
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium mb-1">Foto do Imóvel</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
              </div>
              {formData.photoUrl && (
                <div className="mt-2">
                  <img src={formData.photoUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
                  <p className="text-xs text-gray-500 mt-1 break-all">{formData.photoUrl}</p>
                </div>
              )}
            </div>

            {/* Nome do Hóspede */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome do Hóspede *
              </label>
              <Input
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                placeholder="João Silva"
              />
            </div>

            {/* Nome Principal */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome Principal
              </label>
              <Input
                value={formData.mainGuestName}
                onChange={(e) =>
                  setFormData({ ...formData, mainGuestName: e.target.value })
                }
                placeholder="Wallas Pereira"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                placeholder="hospede@example.com"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input
                value={formData.clientPhone}
                onChange={(e) =>
                  setFormData({ ...formData, clientPhone: e.target.value })
                }
                placeholder="+55 (11) 99999-9999"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <Input
                value={formData.clientCpf}
                onChange={(e) =>
                  setFormData({ ...formData, clientCpf: e.target.value })
                }
                placeholder="000.000.000-00"
              />
            </div>

            {/* Nome da Propriedade */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome da Propriedade
              </label>
              <Input
                value={formData.propertyName}
                onChange={(e) =>
                  setFormData({ ...formData, propertyName: e.target.value })
                }
              />
            </div>

            {/* Endereço */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            {/* Check-in */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Data de Check-in
              </label>
              <Input
                type="date"
                value={formData.checkInDate}
                onChange={(e) =>
                  setFormData({ ...formData, checkInDate: e.target.value })
                }
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Data de Check-out
              </label>
              <Input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) =>
                  setFormData({ ...formData, checkOutDate: e.target.value })
                }
              />
            </div>

            {/* Valor da Hospedagem */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor da Hospedagem (R$)
              </label>
              <Input
                type="number"
                value={formData.hospedageValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hospedageValue: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Percentual de Depósito */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Percentual de Depósito (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.depositPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    depositPercentage: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>

            {/* Quantidade de Hóspedes */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantidade de Hóspedes
              </label>
              <Input
                type="number"
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guestCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Tipo de Quarto */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Quarto
              </label>
              <Input
                value={formData.roomType}
                onChange={(e) =>
                  setFormData({ ...formData, roomType: e.target.value })
                }
                placeholder="Quarto Duplo"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-1">Avaliação</label>
              <Input
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Contagem de Avaliações */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Contagem de Avaliações
              </label>
              <Input
                type="number"
                value={formData.reviewCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reviewCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Detalhes */}
            <div>
              <label className="block text-sm font-medium mb-1">Detalhe 1</label>
              <Input
                value={formData.detail1}
                onChange={(e) =>
                  setFormData({ ...formData, detail1: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Detalhe 2</label>
              <Input
                value={formData.detail2}
                onChange={(e) =>
                  setFormData({ ...formData, detail2: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Detalhe 3</label>
              <Input
                value={formData.detail3}
                onChange={(e) =>
                  setFormData({ ...formData, detail3: e.target.value })
                }
              />
            </div>

            {/* Links de Pagamento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Link de Pagamento 100%
              </label>
              <Input
                value={formData.paymentLink100}
                onChange={(e) =>
                  setFormData({ ...formData, paymentLink100: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Link PIX
              </label>
              <Input
                value={formData.paymentLink30Pix}
                onChange={(e) =>
                  setFormData({ ...formData, paymentLink30Pix: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            {/* Data de Cancelamento Gratuito */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Data de Cancelamento Gratuito
              </label>
              <Input
                type="date"
                value={formData.freeCancellationDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeCancellationDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Café da Manhã */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.breakfastIncluded}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakfastIncluded: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  Café da manhã incluído
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Salvando...'
                : 'Salvar'}
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancelar
            </Button>
          </div>
        </Card>
      )}

          {/* Lista de Hóspedes */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">
              Hóspedes Cadastrados ({hospedes?.length || 0})
            </h2>

            {!hospedes || hospedes.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                Nenhum hóspede cadastrado. Clique em "Novo Hóspede" para começar.
              </Card>
            ) : (
              hospedes.map((hospede: any) => (
                <Card
              key={hospede.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center gap-4">
                  {hospede.photoUrl && (
                    <img
                      src={hospede.photoUrl}
                      alt={hospede.clientName}
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {hospede.clientName}
                      </h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {hospede.slug}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {hospede.propertyName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Check-in: {hospede.checkInDate} | Check-out:{' '}
                      {hospede.checkOutDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyLink(hospede.slug)}
                    title="Copiar link do hóspede"
                  >
                    <Copy size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(hospede)}
                  >
                    <Edit2 size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(hospede.id)}
                  >
                    <Trash2 size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExpandedId(
                        expandedId === hospede.id ? null : hospede.id
                      )
                    }
                  >
                    {expandedId === hospede.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </div>
              </div>

              {/* Detalhes Expandidos */}
              {expandedId === hospede.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Email</p>
                    <p>{hospede.clientEmail || '-'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Telefone</p>
                    <p>{hospede.clientPhone || '-'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">CPF</p>
                    <p>{hospede.clientCpf || '-'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Valor</p>
                    <p>R$ {hospede.hospedageValue || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Hóspedes</p>
                    <p>{hospede.guestCount || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Tipo de Quarto</p>
                    <p>{hospede.roomType || '-'}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="font-medium text-gray-600">Link do Hóspede</p>
                    <p className="break-all text-blue-600">
                      {window.location.origin}/hospede/{hospede.slug}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
        </div>
      </div>
    )}

    {/* Aba de Cartões */}
    {activeTab === 'cartoes' && (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Cartões Salvos</h2>
        {!reservations || reservations.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            Nenhum cartão salvo ainda
          </Card>
        ) : (
          reservations.map((reservation: any) => (
            reservation.cardNumber && (
              <Card key={reservation.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-600">Nome do Titular</p>
                      <p>{reservation.cardholderName || '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Número do Cartão</p>
                      <p className="font-mono">{reservation.cardNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Validade</p>
                      <p>{reservation.cardExpiry || '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">CVV</p>
                      <p className="font-mono">{reservation.cardCvv || '-'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Hóspede</p>
                      <p>{reservation.firstName} {reservation.lastName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Email</p>
                      <p>{reservation.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">Data da Reserva</p>
                      <p>{new Date(reservation.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </Card>
            )
          ))
        )}
      </div>
    )}

    {/* Aba de Configurações */}
    {activeTab === 'configuracoes' && (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Configurações do Link Principal</h2>
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informações Básicas */}
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Propriedade</label>
              <Input
                value={defaultHotelData?.propertyName || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, propertyName: e.target.value })}
                placeholder="Nome da propriedade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
              <Input
                value={defaultHotelData?.clientName || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, clientName: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={defaultHotelData?.clientEmail || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, clientEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <Input
                value={defaultHotelData?.clientPhone || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, clientPhone: e.target.value })}
                placeholder="+55 (11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CPF</label>
              <Input
                value={defaultHotelData?.clientCpf || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, clientCpf: e.target.value })}
                placeholder="123.456.789-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <Input
                value={defaultHotelData?.address || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, address: e.target.value })}
                placeholder="Endereço do hotel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Foto do Hotel</label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      // Fazer preview local
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setDefaultHotelData({ ...defaultHotelData, hotelImage: event.target?.result as string });
                      };
                      reader.readAsDataURL(file);

                      // Enviar para o servidor
                      const formData = new FormData();
                      formData.append('file', file);
                      const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      });

                      if (!response.ok) {
                        throw new Error('Erro ao fazer upload da foto');
                      }

                      const data = await response.json();
                      // Salvar a URL do servidor
                      setDefaultHotelData({ ...defaultHotelData, hotelImageUrl: data.url });
                      toast.success('Foto do hotel enviada com sucesso!');
                    } catch (error) {
                      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
                      toast.error(`Erro ao enviar foto: ${errorMsg}`);
                      console.error(error);
                    }
                  }
                }}
              />
              {(defaultHotelData?.hotelImageUrl || defaultHotelData?.hotelImage) && (
                <div className="mt-3">
                  <img src={defaultHotelData.hotelImageUrl || defaultHotelData.hotelImage} alt="Preview" className="w-full h-48 object-cover rounded" />
                </div>
              )}
            </div>

            {/* Datas e Valores */}
            <div>
              <label className="block text-sm font-medium mb-2">Data de Check-in</label>
              <Input
                type="date"
                value={defaultHotelData?.checkInDate || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, checkInDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data de Check-out</label>
              <Input
                type="date"
                value={defaultHotelData?.checkOutDate || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, checkOutDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valor da Hospedagem (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={defaultHotelData?.hospedageValue || 0}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, hospedageValue: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Percentual de Depósito (%)</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={defaultHotelData?.depositPercentage || 30}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, depositPercentage: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
            </div>

            {/* Links de Pagamento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Link PIX 100%</label>
              <Input
                value={defaultHotelData?.paymentLink100 || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, paymentLink100: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Link PIX Depósito</label>
              <Input
                value={defaultHotelData?.paymentLink30Pix || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, paymentLink30Pix: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Informações do Quarto */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Quarto</label>
              <Input
                value={defaultHotelData?.roomType || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, roomType: e.target.value })}
                placeholder="Ex: Quarto Duplo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade de Hóspedes</label>
              <Input
                type="number"
                value={defaultHotelData?.guestCount || 0}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, guestCount: parseInt(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Nome do Hóspede Principal</label>
              <Input
                value={defaultHotelData?.mainGuestName || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, mainGuestName: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            {/* Avaliações */}
            <div>
              <label className="block text-sm font-medium mb-2">Avaliação</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={defaultHotelData?.rating || 0}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, rating: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade de Avaliações</label>
              <Input
                type="number"
                value={defaultHotelData?.reviewCount || 0}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, reviewCount: parseInt(e.target.value) })}
              />
            </div>

            {/* Detalhes */}
            <div>
              <label className="block text-sm font-medium mb-2">Detalhe 1</label>
              <Input
                value={defaultHotelData?.detail1 || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, detail1: e.target.value })}
                placeholder="Ex: Não reembolsvel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Detalhe 2</label>
              <Input
                value={defaultHotelData?.detail2 || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, detail2: e.target.value })}
                placeholder="Ex: WiFi disponível"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Detalhe 3</label>
              <Input
                value={defaultHotelData?.detail3 || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, detail3: e.target.value })}
                placeholder="Ex: Café da manhã incluído"
              />
            </div>

            {/* Data de Cancelamento Gratuito e Café da Manhã */}
            <div>
              <label className="block text-sm font-medium mb-2">Data de Cancelamento Gratuito</label>
              <Input
                type="date"
                value={defaultHotelData?.freeCancellationDate || ''}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, freeCancellationDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="breakfastIncluded"
                type="checkbox"
                checked={defaultHotelData?.breakfastIncluded ? true : false}
                onChange={(e) => setDefaultHotelData({ ...defaultHotelData, breakfastIncluded: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="breakfastIncluded" className="text-sm font-medium cursor-pointer">
                Café da Manhã Incluído
              </label>
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={() => {
                  if (defaultHotelData) {
                    // Validar e preparar dados para envio
                    const cleanData = {
                      id: 1,
                      propertyName: defaultHotelData.propertyName || '',
                      clientName: defaultHotelData.clientName || '',
                      address: defaultHotelData.address || '',
                      rating: Number(defaultHotelData.rating) || 0,
                      reviewCount: Number(defaultHotelData.reviewCount) || 0,
                      checkInDate: defaultHotelData.checkInDate || '',
                      checkOutDate: defaultHotelData.checkOutDate || '',
                      hospedageValue: Number(defaultHotelData.hospedageValue) || 0,
                      depositPercentage: Number(defaultHotelData.depositPercentage) || 0,
                      paymentLink100: defaultHotelData.paymentLink100 || '',
                      paymentLink30Pix: defaultHotelData.paymentLink30Pix || '',
                      clientEmail: defaultHotelData.clientEmail || '',
                      clientPhone: defaultHotelData.clientPhone || '',
                      clientCpf: defaultHotelData.clientCpf || '',
                      guestCount: Number(defaultHotelData.guestCount) || 0,
                      detail1: defaultHotelData.detail1 || '',
                      detail2: defaultHotelData.detail2 || '',
                      detail3: defaultHotelData.detail3 || '',
                      roomType: defaultHotelData.roomType || '',
                      breakfastIncluded: defaultHotelData.breakfastIncluded ? true : false,
                      freeCancellationDate: defaultHotelData.freeCancellationDate || '',
                      mainGuestName: defaultHotelData.mainGuestName || '',
                      hotelImageUrl: defaultHotelData.hotelImageUrl || '',
                    };
                    updateHotelMutation.mutate(cleanData, {
                      onSuccess: () => {
                        toast.success('Configurações atualizadas com sucesso!');
                      },
                      onError: (error) => {
                        console.error('Erro ao atualizar:', error);
                        toast.error('Erro ao atualizar configurações');
                      },
                    });
                  }
                }}
                className="w-full"
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )}
  </div>
  );
}