import { Star, MapPin, Wifi } from 'lucide-react';

interface HotelPhoto {
  id: string;
  url: string;
  title: string;
}

interface HotelCardProps {
  hotelName: string;
  address: string;
  rating: number;
  reviewCount: number;
  photos: HotelPhoto[];
  amenities: string[];
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  nights: number;
  guestCount?: number;
  details?: string[];
}

export default function HotelCard({
  hotelName,
  address,
  rating,
  reviewCount,
  photos,
  amenities,
  checkIn,
  checkOut,
  totalPrice,
  nights,
  guestCount = 2,
  details = [],
}: HotelCardProps) {
  const mainPhoto = photos.length > 0 ? photos[0] : null;

  const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-4 h-4" />,
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-border">
      {/* Hotel Image */}
      <div className="relative overflow-hidden bg-gray-100 h-64">
        {mainPhoto ? (
          <img
            src={mainPhoto.url}
            alt={hotelName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%23999" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <div className="p-4 space-y-3">
        {/* Hotel Name and Rating */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            {hotelName}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-sm text-sm">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {reviewCount.toLocaleString()} avaliações
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs">{address}</p>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-3 pt-1">
          {amenities.map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              {amenityIcons[amenity.toLowerCase()] || (
                <div className="w-4 h-4" />
              )}
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-3" />

        {/* Booking Details */}
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-sm">
            Detalhes da sua reserva
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-in</p>
              <p className="font-bold text-foreground text-sm">{checkIn}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Check-out</p>
              <p className="font-bold text-foreground text-sm">{checkOut}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Duração total da estadia: <span className="font-semibold">{nights} noites</span>
          </p>

          <div className="flex items-center gap-2 pt-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="text-xs text-foreground">Hóspedes: {guestCount} adulto(s)</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-3" />

        {/* Price Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {totalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            R$ {(totalPrice / nights).toFixed(2)} por noite
          </p>
        </div>
      </div>
    </div>
  );
}
