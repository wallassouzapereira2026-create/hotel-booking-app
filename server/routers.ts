import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDefaultHotelBooking, updateHotelBooking, createHotelBooking, createReservation, getReservations, getReservationById } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  reservations: router({
    create: publicProcedure
      .input(z.object({
        hotelBookingId: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        phone: z.string(),
        country: z.string().optional(),
        checkInTime: z.string().optional(),
        towels: z.number().optional(),
        bookingFor: z.string().optional(),
        paymentMethod: z.string(),
        cardholderName: z.string().optional(),
        cardNumber: z.string().optional(),
        cardExpiry: z.string().optional(),
        cardCvv: z.string().optional(),
        totalPrice: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await createReservation({
            hotelBookingId: input.hotelBookingId,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            country: input.country || 'BR',
            checkInTime: input.checkInTime || null,
            towels: input.towels || 2,
            bookingFor: input.bookingFor || 'self',
            paymentMethod: input.paymentMethod,
            cardholderName: input.cardholderName || null,
            cardNumber: input.cardNumber || null,
            cardExpiry: input.cardExpiry || null,
            cardCvv: input.cardCvv || null,
            totalPrice: input.totalPrice,
          });
          return { success: true, id: result?.insertId };
        } catch (error) {
          console.error('Erro ao criar reserva:', error);
          throw new Error('Erro ao salvar reserva: ' + String(error));
        }
      }),
    getByHotel: publicProcedure
      .input(z.object({
        hotelBookingId: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const result = await getReservations(input.hotelBookingId);
          return result || [];
        } catch (error) {
          console.error('Erro ao buscar reservas:', error);
          return [];
        }
      }),
    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const result = await getReservationById(input.id);
          return result || null;
        } catch (error) {
          console.error('Erro ao buscar reserva:', error);
          return null;
        }
      }),
  }),

  hotelBooking: router({
    getDefault: publicProcedure.query(async () => {
      try {
        const booking = await getDefaultHotelBooking();
        if (!booking) {
          return null;
        }
        return {
          id: booking.id,
          propertyName: booking.propertyName,
          clientName: booking.clientName,
          address: booking.address,
          rating: booking.rating,
          reviewCount: booking.reviewCount,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          hospedageValue: booking.hospedageValue,
          paymentLink100: booking.paymentLink100,
          paymentLink30Pix: booking.paymentLink30Pix,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          clientCpf: booking.clientCpf,
          guestCount: booking.guestCount,
          detail1: booking.detail1,
          detail2: booking.detail2,
          detail3: booking.detail3,
          roomType: booking.roomType,
          breakfastIncluded: booking.breakfastIncluded ? 1 : 0,
          freeCancellationDate: booking.freeCancellationDate,
          mainGuestName: booking.mainGuestName,
          photos: booking.photos,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };
      } catch (error) {
        console.error('Erro ao ler dados do hotel:', error);
        return null;
      }
    }),
    update: publicProcedure
      .input(z.object({
        id: z.number().optional(),
        propertyName: z.string(),
        clientName: z.string(),
        address: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        hospedageValue: z.number().optional(),
        paymentLink100: z.string().optional(),
        paymentLink30Pix: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        clientCpf: z.string().optional(),
        guestCount: z.number().optional(),
        detail1: z.string().optional(),
        detail2: z.string().optional(),
        detail3: z.string().optional(),
        roomType: z.string().optional(),
        breakfastIncluded: z.boolean().optional(),
        freeCancellationDate: z.string().optional(),
        mainGuestName: z.string().optional(),
        photos: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const bookingId = input.id || 1;
          const updateData = {
            propertyName: input.propertyName,
            clientName: input.clientName,
            address: input.address || null,
            rating: input.rating || null,
            reviewCount: input.reviewCount || null,
            checkInDate: input.checkInDate || null,
            checkOutDate: input.checkOutDate || null,
            hospedageValue: input.hospedageValue || null,
            paymentLink100: input.paymentLink100 || null,
            paymentLink30Pix: input.paymentLink30Pix || null,
            clientEmail: input.clientEmail || null,
            clientPhone: input.clientPhone || null,
            clientCpf: input.clientCpf || null,
            guestCount: input.guestCount || null,
            detail1: input.detail1 || null,
            detail2: input.detail2 || null,
            detail3: input.detail3 || null,
            roomType: input.roomType || null,
            breakfastIncluded: input.breakfastIncluded ? 1 : 0,
            freeCancellationDate: input.freeCancellationDate || null,
            mainGuestName: input.mainGuestName || null,
            photos: input.photos || null,
          };

          await updateHotelBooking(bookingId, updateData);
          console.log('Dados do hotel atualizados com sucesso');
          return { success: true, id: bookingId };
        } catch (error) {
          console.error('Erro ao atualizar dados do hotel:', error);
          throw new Error('Erro ao salvar dados: ' + String(error));
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
