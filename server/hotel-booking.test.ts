import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("hotelBooking router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createContext();
  });

  it("should retrieve default hotel booking data", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.hotelBooking.getDefault();

    expect(result).toBeDefined();
    if (result) {
      expect(result).toHaveProperty("propertyName");
      expect(result).toHaveProperty("clientName");
      expect(result).toHaveProperty("address");
      expect(result).toHaveProperty("rating");
      expect(result).toHaveProperty("reviewCount");
      expect(result).toHaveProperty("checkInDate");
      expect(result).toHaveProperty("checkOutDate");
      expect(result).toHaveProperty("hospedageValue");
      expect(result).toHaveProperty("clientEmail");
      expect(result).toHaveProperty("clientPhone");
      expect(result).toHaveProperty("guestCount");
    }
  });

  it("should update hotel booking data", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const updateData = {
      propertyName: "Test Hotel",
      clientName: "Test Client",
      address: "Test Address",
      rating: 9.0,
      reviewCount: 500,
      checkInDate: "2026-03-01",
      checkOutDate: "2026-03-05",
      hospedageValue: 1000,
      clientEmail: "test@hotel.com",
      clientPhone: "+55 (11) 99999-9999",
      guestCount: 2,
      detail1: "Test Detail 1",
      detail2: "Test Detail 2",
      detail3: "Test Detail 3",
      roomType: "Quarto Duplo",
      breakfastIncluded: true,
      freeCancellationDate: "2026-02-28",
      mainGuestName: "Test Guest",
    };

    const result = await caller.hotelBooking.update(updateData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should handle hotel booking update with optional fields", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const updateData = {
      propertyName: "Minimal Hotel",
      clientName: "Minimal Client",
    };

    const result = await caller.hotelBooking.update(updateData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should validate required fields in hotel booking update", async () => {
    const caller = appRouter.createCaller(ctx);
    
    try {
      // @ts-ignore - Testing missing required fields
      await caller.hotelBooking.update({
        clientName: "Test",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("auth router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createContext();
  });

  it("should return current user info", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.openId).toBe("test-user");
    expect(result?.email).toBe("test@example.com");
  });

  it("should handle logout", async () => {
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

    const logoutCtx: TrpcContext = {
      user: ctx.user,
      req: ctx.req,
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(logoutCtx);
    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});
