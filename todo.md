# Hotel Booking App - Migration TODO

## Database Schema
- [x] Migrate hotelBooking table schema to new project
- [x] Update schema with all required fields (propertyName, clientName, address, rating, reviewCount, checkInDate, checkOutDate, hospedageValue, paymentLink100, paymentLink30Pix, clientEmail, clientPhone, clientCpf, guestCount, detail1, detail2, detail3, roomType, breakfastIncluded, freeCancellationDate, mainGuestName, photos)
- [x] Run database migrations (pnpm db:push)

## Server-side Logic
- [x] Migrate hotelBooking routers (getDefault, update)
- [ ] Create hotelDataStore helper for data persistence
- [x] Implement query helpers in server/db.ts for hotel operations
- [ ] Add hotel data seeding from JSON file

## UI Components
- [x] Copy HotelCard component
- [x] Copy BookingForm component
- [x] Copy AdminPanel component
- [x] Copy AIChatBox component
- [x] Copy Map component
- [ ] Verify all UI components work with new tRPC setup

## Client Pages & Routing
- [x] Update Home.tsx with hotel booking UI
- [ ] Implement navigation and routing with wouter
- [x] Connect UI components to tRPC procedures
- [ ] Handle authentication flow

## Styling & Theme
- [x] Copy index.css with Booking.com color scheme
- [ ] Verify Tailwind configuration
- [ ] Test responsive design

## Images & Media
- [ ] Upload hotel images to CDN using manus-upload-file
- [ ] Update image references from /images to CDN URLs
- [ ] Configure photo storage in database

## Data Migration
- [ ] Migrate hotel data from hotel-data.json to database
- [ ] Seed initial booking data
- [ ] Verify data integrity

## Testing & Validation
- [x] Test hotel data retrieval
- [ ] Test booking form submission
- [x] Test admin panel functionality
- [x] Test authentication and authorization
- [ ] Test payment link integration
- [ ] Verify all images load correctly
- [ ] Test responsive design on mobile/tablet/desktop

## Deployment
- [ ] Create checkpoint for first delivery
- [x] Verify dev server is running
- [x] Test all features in preview
