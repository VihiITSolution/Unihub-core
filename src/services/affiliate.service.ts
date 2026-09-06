import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

export interface AffiliateStatus {
  account: { referralCode: string; referralLink: string };
  campaign: { name: string; startsAt: string; signupEndsAt: string; minimumRedemption: number; tierRules: Array<{ through: number | null; amount: number }> } | null;
  balances: { available: number; reserved: number; paid: number };
  payoutProfile: { accountMask: string } | null;
  referrals: Array<{ id: number; status: string; rewardAmount?: number; tierSequence?: number; activityType?: string; referred: { firstName: string; lastName: string } | null; createdAt: string }>;
  payouts: Array<{ id: number; amount: number; status: string; accountMask: string; createdAt: string }>;
}
export const affiliateService = {
  getMe: (token: string) => apiClient.get<ApiResponse<AffiliateStatus>>("/affiliate/me", { token }),
  savePayoutProfile: (token: string, details: Record<string, string>) => apiClient.put("/affiliate/payout-profile", details, { token }),
  requestRedemption: (token: string, amount: number) => apiClient.post("/affiliate/redemptions", { amount }, { token }),
};
