import { describe, it, expect } from "vitest";
import { scrambleDetails, scrambleUserDetails } from "../../src/scramble-orders-by-email";

describe("scrambleDetails", () => {
  it("should return scrambled first and last name and a fixed phone", () => {
    const result = scrambleDetails({ firstName: "John", lastName: "Doe", phone: "1234567890" });
    expect(result).toEqual({
      scrambledFirstName: "",
      scrambledLastName: "",
      scrambledPhone: "5551234567", // The constant invalid US phone
    });
  });
});

describe("scrambleUserDetails", () => {
  it("should return a UUID-based email and empty names", () => {
    const domain = process.env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN || "example.com";
    const email = "test@example.com";
    const result = scrambleUserDetails(email);
    expect(result.firstName).toBe("");
    expect(result.lastName).toBe("");
    expect(result.email).toMatch(new RegExp(`^[a-f0-9-]+@${domain.replace('.', '\\.')}$`));
  });
});