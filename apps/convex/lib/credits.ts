import {
  AI_LIMITS,
  CREDIT_TRANSACTION_TYPES,
  CREDITS,
} from "../convex/constants";
import { normalizePlan } from "./validation";

type CreditTransactionType =
  (typeof CREDIT_TRANSACTION_TYPES)[keyof typeof CREDIT_TRANSACTION_TYPES];

interface CreditTransactionLike {
  type: CreditTransactionType | string;
  amount: number;
  createdAt: number;
}

interface SubscriptionUserLike {
  plan: unknown;
  subscriptionStatus?: string | null;
  credits?: number | null;
}

interface ApiUsageEntryLike {
  endpoint: string;
  success?: boolean;
  creditsUsed?: number | null;
  responseTime?: number | null;
  createdAt: number;
}

export const CREDIT_COSTS = {
  COVER_LETTER_GENERATION: CREDITS.COVER_LETTER_GENERATION,
  JOB_EXTRACTION: CREDITS.JOB_EXTRACTION,
  RESUME_ANALYSIS: CREDITS.RESUME_TEXT_EXTRACTION,
  RESUME_UPLOAD: CREDITS.RESUME_UPLOAD,
} as const;

function getMonthStart(now: number): number {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function getCreditAvailability(
  currentCredits: number,
  requiredCredits: number
) {
  return {
    hasCredits: currentCredits >= requiredCredits,
    currentCredits,
    requiredCredits,
    shortfall: Math.max(0, requiredCredits - currentCredits),
  };
}

export function addCreditsToBalance(currentCredits: number, amount: number) {
  return {
    previousBalance: currentCredits,
    creditsAdded: amount,
    newBalance: currentCredits + amount,
  };
}

export function deductCreditsFromBalance(currentCredits: number, amount: number) {
  return {
    previousBalance: currentCredits,
    creditsDeducted: amount,
    newBalance: currentCredits - amount,
  };
}

export function calculateCreditStats(
  transactions: CreditTransactionLike[],
  currentBalance: number,
  now = Date.now()
) {
  const monthStart = getMonthStart(now);
  const thisMonthTransactions = transactions.filter(
    (transaction) => transaction.createdAt >= monthStart
  );

  const totalEarned = transactions
    .filter((transaction) => transaction.type === CREDIT_TRANSACTION_TYPES.EARNED)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalSpent = transactions
    .filter((transaction) => transaction.type === CREDIT_TRANSACTION_TYPES.SPENT)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalRefunded = transactions
    .filter((transaction) => transaction.type === CREDIT_TRANSACTION_TYPES.REFUNDED)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const thisMonthSpent = thisMonthTransactions
    .filter((transaction) => transaction.type === CREDIT_TRANSACTION_TYPES.SPENT)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const thisMonthEarned = thisMonthTransactions
    .filter((transaction) => transaction.type === CREDIT_TRANSACTION_TYPES.EARNED)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    currentBalance,
    totalEarned,
    totalSpent,
    totalRefunded,
    thisMonthSpent,
    thisMonthEarned,
    lifetimeNet: totalEarned - totalSpent + totalRefunded,
    transactionCount: transactions.length,
  };
}

export function getSubscriptionLimitSnapshot(
  userProfile: SubscriptionUserLike,
  transactions: CreditTransactionLike[],
  now = Date.now()
) {
  const currentPlan = normalizePlan(userProfile.plan);
  const currentCredits = userProfile.credits || 0;
  const hasActiveSubscription = userProfile.subscriptionStatus === "active";
  const monthStart = getMonthStart(now);
  const monthlyCreditsUsed = transactions
    .filter(
      (transaction) =>
        transaction.type === CREDIT_TRANSACTION_TYPES.SPENT &&
        transaction.createdAt >= monthStart
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    hasActiveSubscription,
    currentPlan,
    planLimit: AI_LIMITS[currentPlan],
    currentCredits,
    monthlyCreditsUsed,
    canUseCredits: hasActiveSubscription || currentCredits > 0,
    subscriptionStatus: userProfile.subscriptionStatus,
  };
}

export function getDailyUsageBreakdown(
  entries: Array<Pick<ApiUsageEntryLike, "createdAt" | "creditsUsed">>,
  days: number,
  now = Date.now()
) {
  if (days <= 0) return [];

  const endDate = new Date(now);
  const startDate = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate())
  );
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  const dailyData: Record<string, { requests: number; credits: number }> = {};

  for (let i = 0; i < days; i += 1) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + i);
    dailyData[date.toISOString().split("T")[0]] = { requests: 0, credits: 0 };
  }

  for (const entry of entries) {
    const dateKey = new Date(entry.createdAt).toISOString().split("T")[0];
    if (!dailyData[dateKey]) continue;

    dailyData[dateKey].requests += 1;
    dailyData[dateKey].credits += entry.creditsUsed || 0;
  }

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data,
  }));
}

function calculateEndpointStats(entries: ApiUsageEntryLike[]) {
  const stats = new Map<
    string,
    {
      totalRequests: number;
      totalCredits: number;
      successfulRequests: number;
      failedRequests: number;
      totalResponseTime: number;
    }
  >();

  for (const entry of entries) {
    const current = stats.get(entry.endpoint) ?? {
      totalRequests: 0,
      totalCredits: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
    };

    current.totalRequests += 1;
    current.totalCredits += entry.creditsUsed || 0;
    current.totalResponseTime += entry.responseTime || 0;

    if (entry.success) {
      current.successfulRequests += 1;
    } else {
      current.failedRequests += 1;
    }

    stats.set(entry.endpoint, current);
  }

  return Object.fromEntries(
    [...stats.entries()].map(([endpoint, data]) => [
      endpoint,
      {
        totalRequests: data.totalRequests,
        totalCredits: data.totalCredits,
        successfulRequests: data.successfulRequests,
        failedRequests: data.failedRequests,
        averageResponseTime:
          data.totalRequests > 0
            ? Math.round(data.totalResponseTime / data.totalRequests)
            : 0,
      },
    ])
  );
}

export function calculateApiUsageStats(
  entries: ApiUsageEntryLike[],
  days: number,
  now = Date.now()
) {
  const totalRequests = entries.length;
  const totalCredits = entries.reduce(
    (sum, entry) => sum + (entry.creditsUsed || 0),
    0
  );
  const successfulRequests = entries.filter((entry) => entry.success).length;

  return {
    totalRequests,
    totalCredits,
    successRate:
      totalRequests > 0
        ? Number(((successfulRequests / totalRequests) * 100).toFixed(2))
        : 0,
    endpointStats: calculateEndpointStats(entries),
    dailyUsage: getDailyUsageBreakdown(entries, days, now),
    periodDays: days,
  };
}
