export type CardNetwork = 'visa' | 'mastercard' | 'rupay' | 'amex' | 'diners';

export type SpendCategory = 
  | 'all'
  | 'dining' 
  | 'travel' 
  | 'grocery' 
  | 'fuel' 
  | 'shopping' 
  | 'utilities'
  | 'movies'
  | 'upi';

export interface CardBenefitItem {
  category: 
    | 'lounge' 
    | 'cashback' 
    | 'reward_points' 
    | 'milestone' 
    | 'fuel' 
    | 'forex' 
    | 'dining' 
    | 'movies' 
    | 'upi' 
    | 'insurance' 
    | 'travel'
    | 'shopping'
    | 'utilities'
    | 'general';
  title: string;
  description: string;
  highlight?: string; // e.g. "4/quarter", "5% cashback", "0% forex"
  criteria?: string;  // e.g. "Spend ₹10,000 in previous calendar quarter"
}

export interface CardBenefits {
  domesticLounge: {
    available: boolean;
    countPerQuarter?: number | string;
    details: string;
    spendCriteria?: string;
  };
  internationalLounge: {
    available: boolean;
    countPerYear?: number | string;
    program?: 'Priority Pass' | 'DreamFolks' | 'LoungeKey' | 'Centurion' | 'None';
    details: string;
  };
  rewardRate: {
    basePercent: number; // estimated % return (e.g. 1.3%, 3.3%)
    rewardPointsPer100?: number;
    pointsValueRupees?: number;
    multipliers?: { category: string; rate: string }[];
  };
  cashbackHighlights: {
    category: string;
    rate: string;
    capsOrLimits?: string;
  }[];
  milestones: {
    spendAmount: string;
    reward: string;
    timeframe: 'quarterly' | 'annual' | 'monthly';
  }[];
  forexMarkup: {
    ratePercent: number;
    details: string;
  };
  fuelSurchargeWaiver: {
    available: boolean;
    details: string;
    minSpend?: number;
    maxSpend?: number;
  };
  annualFee: {
    amount: string;
    waiverSpend: string;
  };
  isRupayUPI: boolean;
  recentChangesOrAlerts?: string[];
  summaryPoints: string[];
  allPerks: CardBenefitItem[];
}

export interface CreditCard {
  id: string;
  bankName: string;         // e.g. "HDFC Bank", "ICICI Bank", "SBI Card", "American Express"
  cardName: string;         // e.g. "Regalia Gold", "Infinia Metal", "Amazon Pay", "Platinum Travel"
  cardNetwork: CardNetwork;  // 'visa', 'mastercard', 'rupay', 'amex', 'diners'
  cardColor?: string;       // Hex or Tailwind gradient identifier
  cardAlias?: string;       // User custom name e.g. "My Primary Travel Card"
  
  // Billing Cycle Information
  statementDay: number;     // Day of month (1 - 31) when statement is generated
  dueDaysAfterStatement: number; // Grace period days (typically 18 - 25 days)
  specificDueDay?: number;  // If fixed due day of month is preferred (1 - 31)
  
  creditLimit?: number;     // User's optional credit limit in INR/USD
  isFavorite?: boolean;
  notes?: string;
  
  // Benefits Data
  benefits: CardBenefits;
  lastBenefitsFetch?: string; // ISO date string
  isAiFetched?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface BillingCycleCalculations {
  cardId: string;
  lastStatementDate: Date;
  nextStatementDate: Date;
  daysUntilStatement: number;
  
  nextDueDate: Date;
  daysUntilDue: number;
  
  // Smart Float calculations
  floatDaysIfSpentToday: number;
  isOptimalSpendWindow: boolean; // True if within 5 days after statement date
  isStatementDueSoon: boolean;   // True if statement cuts in <= 3 days
  isBillPaymentUrgent: boolean;  // True if payment is due in <= 3 days
}
