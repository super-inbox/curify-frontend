import { apiClient } from "./api"; // Assuming this exists based on your uploads
import { InspirationCardDTO, NanoInspirationCardType } from "@/lib/types/inspiration"; 

// Define fetch options type
interface GetCardsOptions {
  review_status?: "DRAFT" | "APPROVED" | "REJECTED";
  lang?: string;
  min_rating?: number;
  limit?: number;
  offset?: number;
}

export const inspirationService = {
  /**
   * Fetch a list of inspiration cards (Hub View)
   */
  async getCards(params: GetCardsOptions = {}): Promise<InspirationCardDTO[]> {
    const queryParams = new URLSearchParams();
    
    if (params.review_status) queryParams.append("review_status", params.review_status);
    if (params.lang) queryParams.append("lang", params.lang);
    if (params.min_rating) queryParams.append("min_rating", params.min_rating.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());

    // Swallows errors internally or lets apiClient handle them? 
    // Usually better to let the page component handle the catch, 
    // but for lists, returning [] on error is a safe UI fallback.
    try {
      return await apiClient.request<InspirationCardDTO[]>(`/inspiration/cards?${queryParams.toString()}`, {
        method: "GET",
        // Add cache options here if your apiClient supports them, or pass generic fetch options
      });
    } catch (error) {
      console.error("Failed to fetch inspiration list:", error);
      return [];
    }
  },

  /**
   * Fetch a single Inspiration card by ID (Permalink)
   */
  async getCardById(id: string): Promise<InspirationCardDTO | null> {
    try {
      return await apiClient.request<InspirationCardDTO>(`/api/inspiration/${id}`, {
        method: "GET",
      });
    } catch (error) {
      // Return null on 404 or error so the page can trigger notFound()
      return null;
    }
  },

  /**
   * Fetch a single Nano card by ID (Permalink)
   */
  async getNanoCardById(id: string): Promise<NanoInspirationCardType | null> {
    try {
      return await apiClient.request<NanoInspirationCardType>(`/api/nano-inspiration/${id}`, {
        method: "GET",
      });
    } catch (error) {
      return null;
    }
  },

  /**
   * Get system statistics
   */
  async getStats() {
    return apiClient.request("/inspiration/stats", { method: "GET" });
  },
};