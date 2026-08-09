import { describe, it, expect } from "vitest";
import { BLOCKED_CIDRS, clientIpFrom, isBlockedIp } from "../blocked-networks";

describe("isBlockedIp — corpus-harvester networks", () => {
  it("blocks the IPs actually observed harvesting the corpus", () => {
    // Sampled from user_interactions on 2026-08-08.
    for (const ip of [
      "43.119.100.158",
      "43.119.100.200",
      "43.119.100.62",
      "47.82.201.208",
      "47.82.201.160",
    ]) {
      expect(isBlockedIp(ip), ip).toBe(true);
    }
  });

  it("covers the whole /16, including the low-volume /24s the actor also uses", () => {
    expect(isBlockedIp("43.119.0.0")).toBe(true);
    expect(isBlockedIp("43.119.255.255")).toBe(true);
    expect(isBlockedIp("47.82.0.0")).toBe(true);
    expect(isBlockedIp("47.82.255.255")).toBe(true);
    expect(isBlockedIp("47.82.53.7")).toBe(true);
  });

  it("NEVER blocks Googlebot — it is re-crawling us after the canonical-fold fix", () => {
    for (const ip of ["66.249.72.136", "66.249.72.137", "66.249.64.1", "66.249.95.254"]) {
      expect(isBlockedIp(ip), ip).toBe(false);
    }
  });

  it("does not block other declared crawlers or ordinary traffic", () => {
    for (const ip of ["57.141.0.1", "8.8.8.8", "192.168.1.1", "1.1.1.1"]) {
      expect(isBlockedIp(ip), ip).toBe(false);
    }
  });

  it("does not bleed into adjacent /16s", () => {
    expect(isBlockedIp("43.118.100.158")).toBe(false);
    expect(isBlockedIp("43.120.0.1")).toBe(false);
    expect(isBlockedIp("47.81.201.208")).toBe(false);
    expect(isBlockedIp("47.83.0.1")).toBe(false);
  });

  it("lets junk input through rather than throwing", () => {
    for (const ip of [null, undefined, "", "999.1.1.1", "43.119.100", "not-an-ip", "2001:db8::1"]) {
      expect(isBlockedIp(ip as string | null | undefined), String(ip)).toBe(false);
    }
  });

  it("keeps every configured CIDR parseable", () => {
    expect(BLOCKED_CIDRS.length).toBeGreaterThan(0);
    for (const { cidr, note } of BLOCKED_CIDRS) {
      expect(cidr, note).toMatch(/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/);
      // A parse failure would silently drop the block, so assert it still
      // matches its own base address.
      expect(isBlockedIp(cidr.split("/")[0]), cidr).toBe(true);
    }
  });
});

describe("clientIpFrom", () => {
  const h = (o: Record<string, string>) => new Headers(o);

  it("takes the left-most entry of x-forwarded-for", () => {
    expect(clientIpFrom(h({ "x-forwarded-for": "43.119.100.158, 10.0.0.1" }))).toBe(
      "43.119.100.158"
    );
  });

  it("prefers the Vercel header", () => {
    expect(
      clientIpFrom(h({ "x-vercel-forwarded-for": "47.82.201.208", "x-forwarded-for": "8.8.8.8" }))
    ).toBe("47.82.201.208");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIpFrom(h({ "x-real-ip": "66.249.72.136" }))).toBe("66.249.72.136");
  });

  it("strips a port suffix, so values copied from user_interactions.user_ip match", () => {
    expect(clientIpFrom(h({ "x-forwarded-for": "43.119.100.158:65303" }))).toBe("43.119.100.158");
  });

  it("returns null when no forwarding header is present", () => {
    expect(clientIpFrom(h({}))).toBeNull();
  });

  it("leaves IPv6 intact (it simply never matches a blocked CIDR)", () => {
    const ip = clientIpFrom(h({ "x-forwarded-for": "2001:db8::1" }));
    expect(ip).toBe("2001:db8::1");
    expect(isBlockedIp(ip)).toBe(false);
  });
});
