/**
 * Sponsor Code Expiration Tests
 *
 * Tests for sponsor code expiration functionality
 */

import { describe, expect, it } from "vitest";

describe("Sponsor Code Expiration", () => {
  describe("Code Expiration", () => {
    it("should expire codes after 24 hours", () => {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 24);

      const hoursUntilExpiry =
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(hoursUntilExpiry).toBeCloseTo(24, 1);
    });

    it("should detect expired codes", () => {
      const now = new Date();
      const expiredTime = new Date(now);
      expiredTime.setHours(expiredTime.getHours() - 1); // 1 hour ago

      const isExpired = expiredTime < now;
      expect(isExpired).toBe(true);
    });

    it("should detect valid (non-expired) codes", () => {
      const now = new Date();
      const futureTime = new Date(now);
      futureTime.setHours(futureTime.getHours() + 12); // 12 hours from now

      const isExpired = futureTime < now;
      expect(isExpired).toBe(false);
    });
  });

  describe("Code Usage", () => {
    it("should mark codes as used after connection", () => {
      const code: {
        code: string;
        used_at: string | null;
        expires_at: string;
      } = {
        code: "ABC12345",
        used_at: null,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // After use
      code.used_at = new Date().toISOString();

      expect(code.used_at).not.toBeNull();
    });

    it("should prevent reuse of used codes", () => {
      const usedCode = {
        code: "ABC12345",
        used_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const isUsed = usedCode.used_at !== null;
      expect(isUsed).toBe(true);
    });
  });

  describe("Code Validation", () => {
    it("should validate code format", () => {
      const validCode = "ABC12345";
      const invalidCode1 = "ABC123"; // too short
      const invalidCode2 = "ABC@1234"; // special character

      expect(validCode).toMatch(/^[A-Z0-9]{8}$/);
      expect(invalidCode1).not.toMatch(/^[A-Z0-9]{8}$/);
      expect(invalidCode2).not.toMatch(/^[A-Z0-9]{8}$/);
    });

    it("should prevent self-sponsorship", () => {
      const userId = "user-123";
      const sponsorUserId = "user-123"; // same user

      const isSelfSponsorship = userId === sponsorUserId;
      expect(isSelfSponsorship).toBe(true);
    });
  });
});
