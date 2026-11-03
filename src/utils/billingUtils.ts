import type { CreditCard, BillingCycleCalculations, SpendCategory } from '../types/card';

/**
 * Calculates billing cycle dates and float days for a credit card
 */
export function calculateBillingCycle(card: CreditCard, referenceDate: Date = new Date()): BillingCycleCalculations {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 1. Determine Next Statement Date
  let nextStatementMonth = currentMonth;
  let nextStatementYear = currentYear;

  if (currentDay > card.statementDay) {
    // Statement for this month has already cut, next one is next month
    nextStatementMonth += 1;
    if (nextStatementMonth > 11) {
      nextStatementMonth = 0;
      nextStatementYear += 1;
    }
  }

  // Handle month length (e.g. statement on 31st but month has 30 or 28 days)
  const daysInNextMonth = new Date(nextStatementYear, nextStatementMonth + 1, 0).getDate();
  const safeNextStatementDay = Math.min(card.statementDay, daysInNextMonth);
  const nextStatementDate = new Date(nextStatementYear, nextStatementMonth, safeNextStatementDay);

  // 2. Determine Last Statement Date
  let lastStatementMonth = currentMonth;
  let lastStatementYear = currentYear;

  if (currentDay <= card.statementDay) {
    // Current day is on or before statement day, last statement was last month
    lastStatementMonth -= 1;
    if (lastStatementMonth < 0) {
      lastStatementMonth = 11;
      lastStatementYear -= 1;
    }
  }

  const daysInLastMonth = new Date(lastStatementYear, lastStatementMonth + 1, 0).getDate();
  const safeLastStatementDay = Math.min(card.statementDay, daysInLastMonth);
  const lastStatementDate = new Date(lastStatementYear, lastStatementMonth, safeLastStatementDay);

  // 3. Determine Next Payment Due Date (for the bill generated on lastStatementDate)
  let nextDueDate: Date;
  if (card.specificDueDay) {
    let dueMonth = lastStatementDate.getMonth();
    let dueYear = lastStatementDate.getFullYear();
    if (card.specificDueDay <= safeLastStatementDay) {
      dueMonth += 1;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear += 1;
      }
    }
    const daysInDueMonth = new Date(dueYear, dueMonth + 1, 0).getDate();
    const safeDueDay = Math.min(card.specificDueDay, daysInDueMonth);
    nextDueDate = new Date(dueYear, dueMonth, safeDueDay);
  } else {
    const graceDays = card.dueDaysAfterStatement || 20;
    nextDueDate = new Date(lastStatementDate.getTime() + graceDays * 24 * 60 * 60 * 1000);
  }

  // 4. Calculate day differences
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilStatement = Math.round((nextStatementDate.getTime() - today.getTime()) / msPerDay);
  const daysUntilDue = Math.round((nextDueDate.getTime() - today.getTime()) / msPerDay);

  // 5. Calculate Interest-Free Float if spent TODAY:
  const graceDays = card.dueDaysAfterStatement || 20;
  const billDueDateForTodaySpend = new Date(nextStatementDate.getTime() + graceDays * msPerDay);
  const floatDaysIfSpentToday = Math.round((billDueDateForTodaySpend.getTime() - today.getTime()) / msPerDay);

  // 6. Flags
  const isOptimalSpendWindow = daysUntilStatement >= 20;
  const isStatementDueSoon = daysUntilStatement >= 0 && daysUntilStatement <= 3;
  const isBillPaymentUrgent = daysUntilDue >= 0 && daysUntilDue <= 3;

  return {
    cardId: card.id,
    lastStatementDate,
    nextStatementDate,
    daysUntilStatement,
    nextDueDate,
    daysUntilDue,
    floatDaysIfSpentToday,
    isOptimalSpendWindow,
    isStatementDueSoon,
    isBillPaymentUrgent,
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function scoreCardForSpend(
  card: CreditCard,
  calculations: BillingCycleCalculations,
  category: SpendCategory = 'all'
): { score: number; reason: string; rewardHighlight: string } {
  let rewardMultiplier = 1;
  let rewardHighlight = `${card.benefits.rewardRate.basePercent}% base return`;

  if (category !== 'all') {
    const matchingCashback = card.benefits.cashbackHighlights.find(c => 
      c.category.toLowerCase().includes(category.toLowerCase())
    );
    if (matchingCashback) {
      rewardHighlight = `${matchingCashback.rate} on ${matchingCashback.category}`;
      const parsedRate = parseFloat(matchingCashback.rate.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedRate)) rewardMultiplier = Math.max(rewardMultiplier, parsedRate / 2);
    }

    const matchingMultiplier = card.benefits.rewardRate.multipliers?.find(m =>
      m.category.toLowerCase().includes(category.toLowerCase())
    );
    if (matchingMultiplier) {
      rewardHighlight = `${matchingMultiplier.rate} points on ${matchingMultiplier.category}`;
      rewardMultiplier += 2;
    }

    if (category === 'upi' && card.benefits.isRupayUPI) {
      rewardHighlight = 'UPI scan & pay enabled with rewards';
      rewardMultiplier += 3;
    }

    if (category === 'fuel' && card.benefits.fuelSurchargeWaiver.available) {
      rewardHighlight = '1% fuel surcharge waiver active';
      rewardMultiplier += 1.5;
    }
  }

  const floatScore = (calculations.floatDaysIfSpentToday / 52) * 60;
  const rewardScore = Math.min(rewardMultiplier * 10, 40);
  const totalScore = Math.round(floatScore + rewardScore);
  
  let reason = '';
  if (calculations.floatDaysIfSpentToday >= 40) {
    reason = `${calculations.floatDaysIfSpentToday}-day payment runway available. Bill will not generate for ${calculations.daysUntilStatement} days.`;
  } else if (calculations.daysUntilStatement <= 3) {
    reason = `Notice: Statement cuts in ${calculations.daysUntilStatement} days. Purchases will be billed promptly.`;
  } else {
    reason = `Good balance with ${calculations.floatDaysIfSpentToday} days float and ${rewardHighlight}.`;
  }

  return {
    score: totalScore,
    reason,
    rewardHighlight,
  };
}

export interface CardPerkBadge {
  label: string;
  category: 'lounge' | 'upi' | 'cashback' | 'forex' | 'rewards';
}

/**
 * Extracts the top 2-3 superpower badges for a card face
 */
export function getCardTopPerks(card: CreditCard, max: number = 3): CardPerkBadge[] {
  const perks: CardPerkBadge[] = [];

  // 1. Airport Lounge Access
  if (card.benefits?.domesticLounge?.available) {
    const qtr = card.benefits.domesticLounge.countPerQuarter;
    const label = qtr ? (String(qtr).toLowerCase() === 'unlimited' ? 'Unlimited Lounge' : `${qtr}/qtr Lounge`) : 'Airport Lounge';
    perks.push({
      label,
      category: 'lounge',
    });
  }

  // 2. RuPay UPI Feature
  if (card.benefits?.isRupayUPI || card.cardNetwork === 'rupay') {
    const upiHighlight = card.benefits?.cashbackHighlights?.find(c => 
      c.category.toLowerCase().includes('upi') || c.rate.toLowerCase().includes('upi')
    );
    const rate = upiHighlight ? upiHighlight.rate.split(' ')[0] : '1.5%';
    perks.push({
      label: `${rate} UPI Back`,
      category: 'upi',
    });
  }

  // 3. Top Category Multiplier or Cashback
  if (card.benefits?.cashbackHighlights && card.benefits.cashbackHighlights.length > 0) {
    const nonUpi = card.benefits.cashbackHighlights.find(c => !c.category.toLowerCase().includes('upi')) || card.benefits.cashbackHighlights[0];
    const cleanRate = nonUpi.rate.split(' ')[0] || nonUpi.rate;
    const shortCategory = nonUpi.category
      .replace(/\(.*?\)/g, '')
      .replace(/Spends|Brands|Payments/gi, '')
      .trim()
      .slice(0, 14);
    perks.push({
      label: `${cleanRate} ${shortCategory || 'Cashback'}`,
      category: 'cashback',
    });
  } else if (card.benefits?.rewardRate?.multipliers && card.benefits.rewardRate.multipliers.length > 0) {
    const topMult = card.benefits.rewardRate.multipliers[0];
    const shortCategory = topMult.category.replace(/\(.*?\)/g, '').trim().slice(0, 14);
    perks.push({
      label: `${topMult.rate.split(' ')[0]} ${shortCategory}`,
      category: 'rewards',
    });
  }

  // 4. Low Forex (<= 2%)
  if (perks.length < max && card.benefits?.forexMarkup?.ratePercent && card.benefits.forexMarkup.ratePercent <= 2) {
    perks.push({
      label: `${card.benefits.forexMarkup.ratePercent}% Forex`,
      category: 'forex',
    });
  }

  // 5. Base Reward Rate fallback if still under max
  if (perks.length < 2 && card.benefits?.rewardRate?.basePercent) {
    perks.push({
      label: `${card.benefits.rewardRate.basePercent}% Base Return`,
      category: 'rewards',
    });
  }

  return perks.slice(0, max);
}

/**
 * Formats a credit limit amount into standard INR notation with separators (e.g. ₹5,00,000)
 */
export function formatCreditLimit(amount?: number): string | null {
  if (!amount || amount <= 0) return null;
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Deterministically generates a masked 4-digit card number for authentic card aesthetics
 */
export function getMaskedCardNumber(cardId: string): string {
  let num = 0;
  for (let i = 0; i < cardId.length; i++) {
    num = (num * 31 + cardId.charCodeAt(i)) % 9000;
  }
  const digits = 1000 + Math.abs(num);
  return `•••• ${digits}`;
}
