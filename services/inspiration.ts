import { apiClient } from "./api"; 
import { InspirationCardDTO } from "@/types/inspiration";

import { NanoInspirationCardType } from "@/lib/nano_utils";
import { cache } from "react"; // 1. Import React Cache

// Define fetch options type
interface GetCardsOptions {
  review_status?: "DRAFT" | "APPROVED" | "REJECTED";
  lang?: string;
  min_rating?: number;
  limit?: number;
  offset?: number;
}

// ------------------------------------------------------------------
// Internal Implementation (Uncached Logic)
// ------------------------------------------------------------------

async function _getCards(params: GetCardsOptions = {}): Promise<InspirationCardDTO[]> {
  const queryParams = new URLSearchParams();
  
  if (params.review_status) queryParams.append("review_status", params.review_status);
  if (params.lang) queryParams.append("lang", params.lang);
  if (params.min_rating) queryParams.append("min_rating", params.min_rating.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());

  try {
    return await apiClient.request<InspirationCardDTO[]>(`/inspiration/cards?${queryParams.toString()}`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Failed to fetch inspiration list:", error);
    return [];
  }
}

async function _getCardById(id: string): Promise<InspirationCardDTO | null> {
  try {
    return await apiClient.request<InspirationCardDTO>(`/api/inspiration/${id}`, {
      method: "GET",
    });
  } catch (error) {
    return null;
  }
}

async function _getNanoCardById(id: string): Promise<NanoInspirationCardType | null> {
  try {
    return await apiClient.request<NanoInspirationCardType>(`/api/nano-inspiration/${id}`, {
      method: "GET",
    });
  } catch (error) {
    return null;
  }
}

async function _getStats() {
  return apiClient.request("/inspiration/stats", { method: "GET" });
}

// ------------------------------------------------------------------
// Public API (Memoized with React Cache)
// ------------------------------------------------------------------

export const inspirationService = {
  /**
   * Fetch a list of inspiration cards (Hub View)
   * Request Memoized: Deduplicates calls within the same render pass.
   */
  getCards: cache(_getCards),

  /**
   * Fetch a single Inspiration card by ID (Permalink)
   * Request Memoized
   */
  getCardById: cache(_getCardById),

  /**
   * Fetch a single Nano card by ID (Permalink)
   * Request Memoized
   */
  getNanoCardById: cache(_getNanoCardById),

  /**
   * Get system statistics
   * Request Memoized
   */
  getStats: cache(_getStats),
};