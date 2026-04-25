import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import HotelCard from '@/components/HotelCard';
import BookingForm from '@/components/BookingForm';
import AdminPanel from '@/components/AdminPanel';
import PaymentFeedbackModal from '@/components/PaymentFeedbackModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

interface HotelPhoto {
  id: string;
  url: string;
  title: string;
}

export default function Home() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'error' as 'success' | 'error',
    title: '',
    message: '',
  });

  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [checkInDate, setCheckInDate] = useState<Date>(new Date(2026, 1, 13));
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(2026, 1, 17));
  
  const nights = Math.floor(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (date: Date): string => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  };

  const defaultHotelData = {
    propertyName: 'Luxury Beachfront Resort',
    clientName: 'João Silva',
    address: 'Praia de Taperapuan, Porto Seguro, CEP 45810-000, Brazil',
    rating: 8.9,
    reviewCount: 1245,
    checkInDate: '2026-02-13',
    checkOutDate: '2026-02-17',
    hospedageValue: 2198,
    paymentLink100: '',
    paymentLink30Pix: '',
    clientEmail: 'hospede@booking.example.com',
    clientPhone: '+55 (11) 99999-9999',
    clientCpf: '',
    guestCount: 2,
    detail1: 'Não reembolsvel',
    detail2: 'WiFi disponível',
    detail3: 'Café da manhã incluido',
    roomType: 'Quarto Duplo',
    breakfastIncluded: true,
    freeCancellationDate: '2026-01-29',
    mainGuestName: 'Wallas Pereira',
  };

  const { data: dbHotelData } = trpc.hotelBooking.getDefault.useQuery();
  const updateHotelDataMutation = trpc.hotelBooking.update.useMutation();

  const [hotelData, setHotelData] = useState(() => {
    if (dbHotelData) {
      return {
        propertyName: dbHotelData.propertyName || defaultHotelData.propertyName,
        clientName: dbHotelData.clientName || defaultHotelData.clientName,
        address: dbHotelData.address || defaultHotelData.address,
        rating: dbHotelData.rating || defaultHotelData.rating,
        reviewCount: dbHotelData.reviewCount || defaultHotelData.reviewCount,
        checkInDate: dbHotelData.checkInDate || defaultHotelData.checkInDate,
        checkOutDate: dbHotelData.checkOutDate || defaultHotelData.checkOutDate,
        hospedageValue: dbHotelData.hospedageValue || defaultHotelData.hospedageValue,
        paymentLink100: dbHotelData.paymentLink100 || defaultHotelData.paymentLink100,
        paymentLink30Pix: dbHotelData.paymentLink30Pix || defaultHotelData.paymentLink30Pix,
        clientEmail: dbHotelData.clientEmail || defaultHotelData.clientEmail,
        clientPhone: dbHotelData.clientPhone || defaultHotelData.clientPhone,
        clientCpf: dbHotelData.clientCpf || defaultHotelData.clientCpf,
        guestCount: dbHotelData.guestCount || defaultHotelData.guestCount,
        detail1: dbHotelData.detail1 || defaultHotelData.detail1,
        detail2: dbHotelData.detail2 || defaultHotelData.detail2,
        detail3: dbHotelData.detail3 || defaultHotelData.detail3,
        roomType: dbHotelData.roomType || defaultHotelData.roomType,
        breakfastIncluded: dbHotelData.breakfastIncluded ? true : defaultHotelData.breakfastIncluded,
        freeCancellationDate: dbHotelData.freeCancellationDate || defaultHotelData.freeCancellationDate,
        mainGuestName: dbHotelData.mainGuestName || defaultHotelData.mainGuestName,
      };
    }
    return defaultHotelData;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.search) {
      const urlData = {
        propertyName: params.get('propertyName') || defaultHotelData.propertyName,
        clientName: params.get('clientName') || defaultHotelData.clientName,
        address: params.get('address') || defaultHotelData.address,
        rating: parseFloat(params.get('rating') || String(defaultHotelData.rating)),
        reviewCount: parseInt(params.get('reviewCount') || String(defaultHotelData.reviewCount)),
        checkInDate: params.get('checkInDate') || defaultHotelData.checkInDate,
        checkOutDate: params.get('checkOutDate') || defaultHotelData.checkOutDate,
        hospedageValue: parseFloat(params.get('hospedageValue') || String(defaultHotelData.hospedageValue)),
        paymentLink100: params.get('paymentLink100') || defaultHotelData.paymentLink100,
        paymentLink30Pix: params.get('paymentLink30Pix') || defaultHotelData.paymentLink30Pix,
        clientEmail: params.get('clientEmail') || defaultHotelData.clientEmail,
        clientPhone: params.get('clientPhone') || defaultHotelData.clientPhone,
        clientCpf: params.get('clientCpf') || defaultHotelData.clientCpf,
        guestCount: parseInt(params.get('guestCount') || String(defaultHotelData.guestCount)),
        detail1: params.get('detail1') || defaultHotelData.detail1,
        detail2: params.get('detail2') || defaultHotelData.detail2,
        detail3: params.get('detail3') || defaultHotelData.detail3,
        roomType: params.get('roomType') || defaultHotelData.roomType,
        breakfastIncluded: params.get('breakfastIncluded') === 'true' ? true : defaultHotelData.breakfastIncluded,
        freeCancellationDate: params.get('freeCancellationDate') || defaultHotelData.freeCancellationDate,
        mainGuestName: params.get('mainGuestName') || defaultHotelData.mainGuestName,
      };
      setHotelData(urlData);
      const checkIn = parseDate(urlData.checkInDate);
      const checkOut = parseDate(urlData.checkOutDate);
      setCheckInDate(checkIn);
      setCheckOutDate(checkOut);
    }
  }, []);

  useEffect(() => {
    if (hotelData && hotelData.checkInDate && hotelData.checkOutDate) {
      const checkIn = parseDate(hotelData.checkInDate);
      const checkOut = parseDate(hotelData.checkOutDate);
      setCheckInDate(checkIn);
      setCheckOutDate(checkOut);
    }
  }, [hotelData?.checkInDate, hotelData?.checkOutDate]);

  useEffect(() => {
    if (dbHotelData && !window.location.search) {
      setHotelData({
        propertyName: dbHotelData.propertyName || defaultHotelData.propertyName,
        clientName: dbHotelData.clientName || defaultHotelData.clientName,
        address: dbHotelData.address || defaultHotelData.address,
        rating: dbHotelData.rating || defaultHotelData.rating,
        reviewCount: dbHotelData.reviewCount || defaultHotelData.reviewCount,
        checkInDate: dbHotelData.checkInDate || defaultHotelData.checkInDate,
        checkOutDate: dbHotelData.checkOutDate || defaultHotelData.checkOutDate,
        hospedageValue: dbHotelData.hospedageValue || defaultHotelData.hospedageValue,
        paymentLink100: dbHotelData.paymentLink100 || defaultHotelData.paymentLink100,
        paymentLink30Pix: dbHotelData.paymentLink30Pix || defaultHotelData.paymentLink30Pix,
        clientEmail: dbHotelData.clientEmail || defaultHotelData.clientEmail,
        clientPhone: dbHotelData.clientPhone || defaultHotelData.clientPhone,
        clientCpf: dbHotelData.clientCpf || defaultHotelData.clientCpf,
        guestCount: dbHotelData.guestCount || defaultHotelData.guestCount,
        detail1: dbHotelData.detail1 || defaultHotelData.detail1,
        detail2: dbHotelData.detail2 || defaultHotelData.detail2,
        detail3: dbHotelData.detail3 || defaultHotelData.detail3,
        roomType: dbHotelData.roomType || defaultHotelData.roomType,
        breakfastIncluded: dbHotelData.breakfastIncluded ? true : defaultHotelData.breakfastIncluded,
        freeCancellationDate: dbHotelData.freeCancellationDate || defaultHotelData.freeCancellationDate,
        mainGuestName: dbHotelData.mainGuestName || defaultHotelData.mainGuestName,
      });
      
      if (dbHotelData.photos) {
        try {
          const loadedPhotos = JSON.parse(dbHotelData.photos);
          setPhotos(loadedPhotos);
        } catch (e) {
          console.error('Erro ao carregar fotos:', e);
        }
      }
    }
  }, [dbHotelData]);

  const [hotelAmenities] = useState(['WiFi']);

  const [photos, setPhotos] = useState<HotelPhoto[]>([
    {
      id: '1',
      url: '/images/hotel-hero.jpg',
      title: 'Hotel Exterior',
    },
    {
      id: '2',
      url: '/images/hotel-room.jpg',
      title: 'Hotel Room',
    },
    {
      id: '3',
      url: '/images/hotel-pool.jpg',
      title: 'Pool Area',
    },
  ]);

  const createReservationMutation = trpc.reservations.create.useMutation();

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const paymentMethod = data.cardholderName ? 'card' : 'pix';
      
      await createReservationMutation.mutateAsync({
        hotelBookingId: dbHotelData?.id || 1,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        checkInTime: data.checkInTime,
        towels: data.towels,
        bookingFor: data.bookingFor,
        paymentMethod: paymentMethod,
        cardholderName: data.cardholderName,
        cardNumber: data.cardNumber,
        cardExpiry: data.cardExpiry,
        cardCvv: data.cardCvv,
        totalPrice: hotelData.hospedageValue,
      });
      
      console.log('Booking data:', data);
      
      if (paymentMethod === 'card') {
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Pagamento não aprovado',
          message: 'Sua reserva foi finalizada, mas o pagamento não foi aprovado. Entre em contato com o anfitrião para resolver o problema.',
        });
      } else {
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Reserva confirmada!',
          message: 'Sua reserva foi salva com sucesso. Você será redirecionado para o PIX em breve.',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao processar',
        message: 'Houve um erro ao salvar sua reserva. Por favor, tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-primary font-bold text-lg">Booking</span>
            </div>

            {/* Progress */}
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-muted-foreground">Sua Seleção</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-foreground font-semibold">Seus Dados</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-muted-foreground">Finalizar reserva</span>
              </div>
            </div>

            {/* Admin Button */}
            <Button
              onClick={() => setIsAdminOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Hotel Info (35%) */}
          <div className="lg:col-span-2">
            <HotelCard
              hotelName={hotelData.propertyName}
              address={hotelData.address}
              rating={hotelData.rating}
              reviewCount={hotelData.reviewCount}
              photos={photos}
              amenities={hotelAmenities}
              checkIn={formatDate(checkInDate)}
              checkOut={formatDate(checkOutDate)}
              totalPrice={hotelData.hospedageValue}
              nights={nights}
              guestCount={hotelData.guestCount}
              details={[hotelData.detail1, hotelData.detail2, hotelData.detail3]}
            />
          </div>

          {/* Right Column - Booking Form (65%) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-sm border border-border p-6 shadow-sm">
              {/* Session Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      Sessão iniciada
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {hotelData.clientEmail}
                    </p>
                  </div>
                </div>
              </div>

              <BookingForm 
                onSubmit={handleFormSubmit} 
                totalPrice={hotelData.hospedageValue}
                paymentLink100={hotelData.paymentLink100 || undefined}
                paymentLink30Pix={hotelData.paymentLink30Pix || undefined}
                clientName={hotelData.clientName}
                clientEmail={hotelData.clientEmail}
                clientPhone={hotelData.clientPhone}
                clientCpf={hotelData.clientCpf}
                details={[hotelData.detail1, hotelData.detail2, hotelData.detail3]}
                propertyName={hotelData.propertyName}
                roomType={hotelData.roomType}
                breakfastIncluded={hotelData.breakfastIncluded}
                freeCancellationDate={hotelData.freeCancellationDate}
                mainGuestName={hotelData.mainGuestName}
                guestCount={hotelData.guestCount}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Admin Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          // Save photos to database when closing admin panel
          if (photos.length > 0) {
            updateHotelDataMutation.mutate({
              propertyName: hotelData.propertyName,
              clientName: hotelData.clientName,
              address: hotelData.address,
              rating: hotelData.rating,
              reviewCount: hotelData.reviewCount,
              checkInDate: hotelData.checkInDate,
              checkOutDate: hotelData.checkOutDate,
              hospedageValue: hotelData.hospedageValue,
              paymentLink100: hotelData.paymentLink100,
              paymentLink30Pix: hotelData.paymentLink30Pix,
              clientEmail: hotelData.clientEmail,
              clientPhone: hotelData.clientPhone,
              clientCpf: hotelData.clientCpf,
              guestCount: hotelData.guestCount,
              detail1: hotelData.detail1,
              detail2: hotelData.detail2,
              detail3: hotelData.detail3,
              roomType: hotelData.roomType,
              breakfastIncluded: hotelData.breakfastIncluded,
              freeCancellationDate: hotelData.freeCancellationDate,
              mainGuestName: hotelData.mainGuestName,
              photos: JSON.stringify(photos),
            });
          }
        }}
        photos={photos}
        onPhotosChange={setPhotos}
        updateHotelDataMutation={updateHotelDataMutation}
        hotelInfo={hotelData}
        onHotelInfoChange={(newInfo) => {
          setHotelData(newInfo);
          if (typeof window !== 'undefined') {
            localStorage.setItem('hotelData', JSON.stringify(newInfo));
          }
          updateHotelDataMutation.mutate({
            propertyName: newInfo.propertyName,
            clientName: newInfo.clientName,
            address: newInfo.address,
            rating: newInfo.rating,
            reviewCount: newInfo.reviewCount,
            checkInDate: newInfo.checkInDate,
            checkOutDate: newInfo.checkOutDate,
            hospedageValue: newInfo.hospedageValue,
            paymentLink100: newInfo.paymentLink100,
            paymentLink30Pix: newInfo.paymentLink30Pix,
            clientEmail: newInfo.clientEmail,
            clientPhone: newInfo.clientPhone,
            clientCpf: newInfo.clientCpf,
            guestCount: newInfo.guestCount,
            detail1: newInfo.detail1,
            detail2: newInfo.detail2,
            detail3: newInfo.detail3,
            roomType: newInfo.roomType,
            breakfastIncluded: newInfo.breakfastIncluded,
            freeCancellationDate: newInfo.freeCancellationDate,
            mainGuestName: newInfo.mainGuestName,
            photos: JSON.stringify(photos),
          });
        }}
      />

      {/* Payment Feedback Modal */}
      <PaymentFeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        actionButtonText={feedbackModal.type === 'error' ? 'Entendi' : 'Continuar'}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-xs text-muted-foreground">
            <p>© 2026 Booking.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
