import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDefaultHotelBooking, updateHotelBooking, createHotelBooking, createReservation, getReservations, getReservationById, getHotelBookingById, getHospedeBySlug, getAllHospedes, createHospede, updateHospede, deleteHospede } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
        const result = await createReservation({
          ...input,
          country: input.country || 'BR',
          checkInTime: input.checkInTime || null,
          towels: input.towels || 2,
          bookingFor: input.bookingFor || 'self',
        });
        return { success: true, id: result?.insertId };
      }),
    getByHotel: publicProcedure.input(z.object({ hotelBookingId: z.number() })).query(async ({ input }) => {
      return await getReservations(input.hotelBookingId) || [];
    }),
  }),

  hotelBooking: router({
    getDefault: publicProcedure.query(async () => {
      const booking = await getDefaultHotelBooking();
      if (!booking) return null;
      return { ...booking, breakfastIncluded: booking.breakfastIncluded ? 1 : 0 };
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const booking = await getHotelBookingById(input.id);
      if (!booking) return null;
      return { ...booking, breakfastIncluded: booking.breakfastIncluded ? 1 : 0 };
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
        depositPercentage: z.number().optional(),
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
        hotelImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const bookingId = input.id || 1;
        const updateData = {
          ...input,
          breakfastIncluded: input.breakfastIncluded ? 1 : 0,
        };
        await updateHotelBooking(bookingId, updateData);
        return { success: true, id: bookingId };
      }),
  }),

  hospedes: router({
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const hospede = await getHospedeBySlug(input.slug);
      if (!hospede) return null;
      return { ...hospede, breakfastIncluded: hospede.breakfastIncluded ? 1 : 0 };
    }),
    getAll: publicProcedure.query(async () => {
      const list = await getAllHospedes();
      return list.map(h => ({ ...h, breakfastIncluded: h.breakfastIncluded ? 1 : 0 }));
    }),
    create: publicProcedure
      .input(z.object({
        slug: z.string(),
        photoUrl: z.string().optional(),
        propertyName: z.string(),
        clientName: z.string(),
        address: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        hospedageValue: z.number().optional(),
        depositPercentage: z.number().optional(),
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
        const result = await createHospede({
          ...input,
          depositPercentage: input.depositPercentage || 30,
          breakfastIncluded: input.breakfastIncluded ? 1 : 0,
        });
        return { success: true, id: result?.insertId };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        photoUrl: z.string().optional(),
        propertyName: z.string().optional(),
        clientName: z.string().optional(),
        address: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        hospedageValue: z.number().optional(),
        depositPercentage: z.number().optional(),
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
        const { id, ...data } = input;
        const updateData = {
          ...data,
          breakfastIncluded: data.breakfastIncluded !== undefined ? (data.breakfastIncluded ? 1 : 0) : undefined,
        };
        await updateHospede(id, updateData);
        return { success: true, id };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteHospede(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
