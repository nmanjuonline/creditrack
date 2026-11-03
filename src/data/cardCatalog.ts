import type { CardBenefits, CardNetwork } from '../types/card';

export interface CatalogCard {
  bankName: string;
  cardName: string;
  network: CardNetwork;
  suggestedColor: string;
  defaultStatementDay: number;
  defaultGraceDays: number;
  benefits: CardBenefits;
}

export const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'SBI Card',
  'Axis Bank',
  'American Express',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Tata Neu / HDFC',
  'IDFC FIRST Bank',
  'Standard Chartered',
  'HSBC',
  'RBL Bank',
  'AU Small Finance Bank',
  'Yes Bank',
  'Federal Bank',
];

export const CARD_CATALOG: CatalogCard[] = [
  {
    bankName: 'HDFC Bank',
    cardName: 'Infinia Metal Edition',
    network: 'visa',
    suggestedColor: 'from-slate-900 via-gray-900 to-zinc-800',
    defaultStatementDay: 15,
    defaultGraceDays: 20,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 'Unlimited',
        details: 'Unlimited complimentary domestic airport lounge access for primary and add-on cardholders with Visa Infinite.',
      },
      internationalLounge: {
        available: true,
        countPerYear: 'Unlimited',
        program: 'Priority Pass',
        details: 'Unlimited complimentary international lounge access worldwide for primary & add-on members.',
      },
      rewardRate: {
        basePercent: 3.3,
        rewardPointsPer100: 5,
        pointsValueRupees: 1.0,
        multipliers: [
          { category: 'Flights & Hotels (SmartBuy)', rate: '5X (16.6% to 33% value)' },
          { category: 'Gyftr Vouchers (Amazon/Flipkart/Swiggy)', rate: '3X - 5X' },
        ],
      },
      cashbackHighlights: [
        { category: 'Travel (SmartBuy)', rate: 'Up to 33% back in points', capsOrLimits: '15,000 points/calendar month on SmartBuy' },
        { category: 'Dining', rate: '2X via Good Food Trail', capsOrLimits: 'Selected partners' },
      ],
      milestones: [
        { spendAmount: '₹10,00,000', reward: 'Annual fee waiver (₹12,500 + GST)', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 2.0,
        details: 'Low 2.0% + GST foreign currency markup fee on international spends.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% fuel surcharge waiver at all fuel stations across India.',
        minSpend: 400,
        maxSpend: 100000,
      },
      annualFee: {
        amount: '₹12,500 + GST',
        waiverSpend: '₹10 Lakhs annual spend',
      },
      isRupayUPI: false,
      summaryPoints: [
        'Unlimited domestic & international lounge access with Priority Pass',
        '5 Reward Points per ₹150 spend (3.3% base reward rate with 1:1 redemption on flights/hotels)',
        'Up to 10X reward points on SmartBuy (up to 33% reward rate)',
        'Club Marriott membership & 24/7 global concierge service',
      ],
      allPerks: [
        { category: 'lounge', title: 'Unlimited Airport Lounges', description: 'Unlimited domestic and international lounges for primary and add-on members.', highlight: 'Unlimited' },
        { category: 'reward_points', title: '5 Points per ₹150', description: '1 point = ₹1 for flight and hotel bookings on SmartBuy.', highlight: '3.3% Return' },
        { category: 'dining', title: 'Good Food Trail', description: 'Up to 20% savings at premium dining restaurants across major cities.', highlight: '20% off' },
        { category: 'forex', title: 'Low Forex Markup', description: '2.0% forex fee vs standard 3.5% across other cards.', highlight: '2.0%' },
      ],
    },
  },
  {
    bankName: 'HDFC Bank',
    cardName: 'Regalia Gold',
    network: 'visa',
    suggestedColor: 'from-amber-900 via-yellow-950 to-stone-900',
    defaultStatementDay: 18,
    defaultGraceDays: 20,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 3,
        details: '12 complimentary domestic lounge visits per calendar year (3 per quarter) with spend threshold.',
        spendCriteria: 'Spend ₹1 Lakh or more in previous calendar quarter to unlock complimentary visits.',
      },
      internationalLounge: {
        available: true,
        countPerYear: 6,
        program: 'Priority Pass',
        details: '6 complimentary international airport lounge access visits per calendar year with Priority Pass.',
      },
      rewardRate: {
        basePercent: 1.33,
        rewardPointsPer100: 4,
        pointsValueRupees: 0.5,
        multipliers: [
          { category: 'Marks & Spencer, Myntra, Nykaa, Reliance Digital', rate: '5X (20 points / ₹150)' },
          { category: 'SmartBuy Flights', rate: 'Up to 6.6%' },
        ],
      },
      cashbackHighlights: [
        { category: 'Shopping Partners', rate: '5X Reward Points (6.6% return)' },
        { category: 'Flights via SmartBuy', rate: 'Up to 6.6% return value' },
      ],
      milestones: [
        { spendAmount: '₹1.5 Lakhs / Quarter', reward: '₹1,500 Marriott / Marks & Spencer voucher', timeframe: 'quarterly' },
        { spendAmount: '₹5 Lakhs / Year', reward: '₹5,000 flight voucher', timeframe: 'annual' },
        { spendAmount: '₹7.5 Lakhs / Year', reward: 'Additional ₹5,000 flight voucher', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 2.0,
        details: 'Low 2.0% + GST markup fee on all foreign currency transactions.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% fuel surcharge waiver on transactions between ₹400 and ₹5,000.',
        minSpend: 400,
        maxSpend: 5000,
      },
      annualFee: {
        amount: '₹2,500 + GST',
        waiverSpend: '₹4 Lakhs in anniversary year',
      },
      isRupayUPI: false,
      recentChangesOrAlerts: [
        'Domestic lounge visits now require ₹1 Lakh quarterly spend criteria to activate for the next quarter.',
      ],
      summaryPoints: [
        '12 Domestic (spend criteria: ₹1L/quarter) + 6 International lounge visits',
        '4 Reward Points per ₹150 spend; 20 Points per ₹150 on retail partner brands',
        '₹1,500 quarterly milestone vouchers (Marriott/M&S) + up to ₹10,000 annual flight vouchers',
        '2.0% forex markup for international spends',
      ],
      allPerks: [
        { category: 'lounge', title: '12 Domestic Lounges/Year', description: '3 visits/quarter on meeting ₹1L prior spend criteria.', highlight: '12 visits/yr' },
        { category: 'milestone', title: 'Quarterly Voucher ₹1,500', description: 'Get ₹1,500 voucher on spending ₹1.5 Lakhs in each calendar quarter.', highlight: '₹6,000/yr' },
        { category: 'reward_points', title: '5X on Top Brands', description: '20 reward points per ₹150 at Nykaa, Myntra, M&S, Reliance Digital.', highlight: '5X Points' },
      ],
    },
  },
  {
    bankName: 'ICICI Bank',
    cardName: 'Amazon Pay ICICI Card',
    network: 'visa',
    suggestedColor: 'from-amber-600 via-orange-700 to-stone-900',
    defaultStatementDay: 12,
    defaultGraceDays: 18,
    benefits: {
      domesticLounge: {
        available: false,
        details: 'No complimentary airport lounge access included on this card.',
      },
      internationalLounge: {
        available: false,
        details: 'No international lounge access.',
      },
      rewardRate: {
        basePercent: 1.0,
        pointsValueRupees: 1.0,
      },
      cashbackHighlights: [
        { category: 'Amazon Shopping (Prime)', rate: '5% Unlimited Cashback', capsOrLimits: 'No upper limit or expiry' },
        { category: 'Amazon Shopping (Non-Prime)', rate: '3% Unlimited Cashback', capsOrLimits: 'No upper limit' },
        { category: 'Flight bookings & Partner Merchants', rate: '2% Unlimited Cashback', capsOrLimits: 'Direct statement/Amazon Pay balance' },
        { category: 'All other spends', rate: '1% Unlimited Cashback', capsOrLimits: 'Excludes rent and fuel' },
      ],
      milestones: [],
      forexMarkup: {
        ratePercent: 3.5,
        details: 'Standard 3.5% + GST foreign currency markup fee.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% waiver on fuel purchases across all petrol pumps.',
        minSpend: 400,
        maxSpend: 4000,
      },
      annualFee: {
        amount: 'Lifetime Free (₹0)',
        waiverSpend: 'No annual fee ever',
      },
      isRupayUPI: false,
      summaryPoints: [
        'Lifetime Free card with zero joining or annual fees',
        '5% unlimited cashback on Amazon.in for Prime members (auto-credited every month)',
        '2% cashback on 100+ partner merchants (Swiggy, Uber, BookMyShow, etc.)',
        '1% flat cashback on all other eligible spends',
      ],
      allPerks: [
        { category: 'cashback', title: '5% Unlimited Amazon Cashback', description: 'Auto-credited as Amazon Pay balance every billing cycle with no expiry.', highlight: '5% Flat' },
        { category: 'general', title: 'Lifetime Free Card', description: 'Zero joining fee, zero annual renewal fee forever.', highlight: '₹0 Fees' },
        { category: 'dining', title: 'ICICI Culinary Treats', description: 'Minimum 15% discount at partner dining outlets.', highlight: '15% Off' },
      ],
    },
  },
  {
    bankName: 'SBI Card',
    cardName: 'Cashback SBI Card',
    network: 'visa',
    suggestedColor: 'from-blue-700 via-sky-800 to-indigo-950',
    defaultStatementDay: 20,
    defaultGraceDays: 20,
    benefits: {
      domesticLounge: {
        available: false,
        details: 'Domestic lounge access was discontinued in recent devaluations.',
      },
      internationalLounge: {
        available: false,
        details: 'No international lounge access.',
      },
      rewardRate: {
        basePercent: 1.0,
        pointsValueRupees: 1.0,
      },
      cashbackHighlights: [
        { category: 'Online Spends (Any Website/App)', rate: '5% Cashback', capsOrLimits: 'Capped at ₹5,000 cashback per billing cycle' },
        { category: 'Offline / POS Spends', rate: '1% Cashback', capsOrLimits: 'No monthly cap' },
      ],
      milestones: [
        { spendAmount: '₹2,00,000', reward: 'Annual fee waiver (₹999 + GST)', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 3.5,
        details: 'Standard 3.5% + GST foreign currency markup fee.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% fuel surcharge waiver up to ₹100 per statement cycle.',
        minSpend: 500,
        maxSpend: 3000,
      },
      annualFee: {
        amount: '₹999 + GST',
        waiverSpend: '₹2 Lakhs annual spend',
      },
      isRupayUPI: false,
      recentChangesOrAlerts: [
        'Excluded from 5% cashback: Rent, Utilities, Wallet load, School fees, Jewelry, Government payments, Railways.',
      ],
      summaryPoints: [
        '5% flat cashback on all online retail shopping without merchant restrictions',
        'Monthly cashback cap of ₹5,000 (translates to ₹1 Lakh online spend)',
        'Cashback auto-credited directly to credit card statement within 2 days of bill generation',
        'Fee waived on ₹2 Lakhs annual spend',
      ],
      allPerks: [
        { category: 'cashback', title: '5% on Online Spends', description: 'Direct statement credit on virtually any online merchant.', highlight: '5% Cashback' },
        { category: 'general', title: 'Auto-Statement Credit', description: 'No manual redemption or conversion fee required; reduces next bill.', highlight: 'Auto Credit' },
      ],
    },
  },
  {
    bankName: 'Axis Bank',
    cardName: 'Airtel Axis Bank Credit Card',
    network: 'mastercard',
    suggestedColor: 'from-red-700 via-rose-800 to-slate-900',
    defaultStatementDay: 8,
    defaultGraceDays: 20,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 1,
        details: '4 complimentary domestic airport lounge visits per year (1 per calendar quarter with spend criteria).',
        spendCriteria: 'Spend ₹50,000 in previous 3 months to unlock lounge access.',
      },
      internationalLounge: {
        available: false,
        details: 'No international lounge access.',
      },
      rewardRate: {
        basePercent: 1.0,
      },
      cashbackHighlights: [
        { category: 'Airtel Mobile, Broadband, DTH, WiFi (Airtel Thanks app)', rate: '25% Cashback', capsOrLimits: 'Capped at ₹250 per month' },
        { category: 'Utility Bills (Electricity, Gas, Water via Thanks app)', rate: '10% Cashback', capsOrLimits: 'Capped at ₹250 per month' },
        { category: 'Swiggy, Zomato, BigBasket', rate: '10% Cashback', capsOrLimits: 'Combined cap of ₹500 per month' },
        { category: 'All other spends', rate: '1% Cashback', capsOrLimits: 'No cap' },
      ],
      milestones: [
        { spendAmount: '₹2,00,000', reward: 'Annual fee waiver (₹500 + GST)', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 3.5,
        details: 'Standard 3.5% + GST.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% waiver between ₹400 and ₹4,000.',
        minSpend: 400,
        maxSpend: 4000,
      },
      annualFee: {
        amount: '₹500 + GST',
        waiverSpend: '₹2 Lakhs annual spend',
      },
      isRupayUPI: false,
      summaryPoints: [
        '25% cashback on Airtel mobile recharges, Broadband, & DTH (up to ₹250/mo)',
        '10% cashback on utility bill payments (Electricity, Water, Gas) via Airtel Thanks (up to ₹250/mo)',
        '10% cashback on food delivery & grocery via Swiggy, Zomato & BigBasket (up to ₹500/mo)',
        'Cashback credited directly in next credit card statement',
      ],
      allPerks: [
        { category: 'cashback', title: '25% on Airtel Recharges', description: 'Massive 25% savings on monthly family mobile & fiber plans.', highlight: '25% Back' },
        { category: 'utilities', title: '10% on Electricity & Gas', description: 'Pay home utility bills on Airtel Thanks app for 10% statement credit.', highlight: '10% Utilities' },
        { category: 'dining', title: '10% on Swiggy & Zomato', description: 'Daily dining and food delivery savings up to ₹500/month.', highlight: '10% Dining' },
      ],
    },
  },
  {
    bankName: 'American Express',
    cardName: 'Platinum Travel Credit Card',
    network: 'amex',
    suggestedColor: 'from-slate-400 via-gray-600 to-zinc-900',
    defaultStatementDay: 22,
    defaultGraceDays: 18,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 2,
        details: '8 complimentary domestic lounge visits per calendar year (2 per quarter).',
      },
      internationalLounge: {
        available: false,
        program: 'Priority Pass',
        details: 'Complimentary Priority Pass membership; lounge visits chargeable at standard member rate.',
      },
      rewardRate: {
        basePercent: 1.0,
        rewardPointsPer100: 1,
        pointsValueRupees: 0.5,
      },
      cashbackHighlights: [
        { category: 'Reward Multiplier (Amex Portal)', rate: 'Up to 3X Membership Rewards Points' },
      ],
      milestones: [
        { spendAmount: '₹1.90 Lakhs', reward: '15,000 Bonus MR Points + ₹4,000 Taj / Tata CLiQ voucher', timeframe: 'annual' },
        { spendAmount: '₹4.00 Lakhs', reward: '25,000 Bonus MR Points + ₹10,000 Taj Experiences Gift Card', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 3.5,
        details: '3.5% + GST.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '0% fuel surcharge waiver at HPCL petrol stations.',
      },
      annualFee: {
        amount: '₹5,000 + GST (1st yr ₹3,500)',
        waiverSpend: 'Spend milestone bonus covers fee many times over',
      },
      isRupayUPI: false,
      summaryPoints: [
        'Premier milestone card in India: Earn ~48,000 Membership Rewards points + ₹10,000 Taj stay voucher on ₹4L spend (over 9% net reward rate!)',
        '8 complimentary domestic airport lounge visits per year (2 per quarter)',
        'Complimentary Priority Pass membership',
        'Redeem MR points for Taj luxury hotel stays, Marriott Bonvoy, or Singapore KrisFlyer miles',
      ],
      allPerks: [
        { category: 'milestone', title: '48,000 MR Points + ₹10k Taj Stay', description: 'Reach ₹4 Lakhs annual spend to unlock huge luxury travel perks.', highlight: '9%+ Net Value' },
        { category: 'lounge', title: '8 Domestic Lounges', description: '2 visits per quarter at major Indian airport lounges.', highlight: '8 visits/yr' },
        { category: 'travel', title: 'Marriott Bonvoy Transfer', description: 'Transfer MR points 1:1 to Marriott Bonvoy for free luxury hotel nights.', highlight: '1:1 Marriott' },
      ],
    },
  },
  {
    bankName: 'Tata Neu / HDFC',
    cardName: 'Tata Neu Infinity HDFC Credit Card',
    network: 'rupay',
    suggestedColor: 'from-purple-900 via-fuchsia-950 to-neutral-900',
    defaultStatementDay: 14,
    defaultGraceDays: 20,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 2,
        details: '8 complimentary domestic lounge visits per calendar year (2 per quarter).',
      },
      internationalLounge: {
        available: true,
        countPerYear: 4,
        program: 'Priority Pass',
        details: '4 complimentary international lounge visits per calendar year.',
      },
      rewardRate: {
        basePercent: 1.5,
        pointsValueRupees: 1.0,
      },
      cashbackHighlights: [
        { category: 'Tata Brands on Tata Neu (Tata 1mg, BigBasket, Croma, Air India Express, Tata CliQ)', rate: '10% NeuCoins (5% card + 5% app NeuPass)', capsOrLimits: '1 NeuCoin = ₹1' },
        { category: 'RuPay UPI Spends (Any QR / Merchant UPI)', rate: '1.5% NeuCoins', capsOrLimits: 'Capped at 500 NeuCoins per calendar month on UPI' },
        { category: 'Non-Tata Spends', rate: '1.5% NeuCoins', capsOrLimits: 'Direct NeuCoins in Neu App' },
      ],
      milestones: [
        { spendAmount: '₹3,00,000', reward: 'Annual renewal fee waiver (₹1,499 + GST)', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 2.0,
        details: 'Low 2.0% + GST markup fee on foreign currency spends.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% waiver between ₹400 and ₹5,000.',
        minSpend: 400,
        maxSpend: 5000,
      },
      annualFee: {
        amount: '₹1,499 + GST',
        waiverSpend: '₹3 Lakhs annual spend',
      },
      isRupayUPI: true,
      summaryPoints: [
        'RuPay credit card linkable directly to UPI apps (Google Pay, PhonePe, Paytm, CRED)',
        '1.5% back on UPI QR merchant spends (highest in class for RuPay UPI)',
        '10% NeuCoins on Tata Neu purchases (Air India, Croma, BigBasket, 1mg, Westside)',
        '8 Domestic + 4 International airport lounge visits per year',
        'Low 2% forex markup fee for international travel',
      ],
      allPerks: [
        { category: 'upi', title: '1.5% on RuPay UPI Payments', description: 'Scan any shop QR code with Google Pay / PhonePe and earn 1.5% back.', highlight: '1.5% UPI' },
        { category: 'shopping', title: '10% on Tata Neu Ecosystem', description: '5% card + 5% app coins across BigBasket, Croma, 1mg, Air India.', highlight: '10% NeuCoins' },
        { category: 'lounge', title: '8 Domestic + 4 International', description: 'Full lounge suite on a RuPay card.', highlight: 'Domestic & Int' },
        { category: 'forex', title: '2% Low Forex Markup', description: 'Save on international merchant & travel transactions.', highlight: '2.0% Forex' },
      ],
    },
  },
  {
    bankName: 'Axis Bank',
    cardName: 'Atlas Credit Card',
    network: 'visa',
    suggestedColor: 'from-zinc-800 via-stone-900 to-black',
    defaultStatementDay: 5,
    defaultGraceDays: 20,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 'Tier based (8 to 18/yr)',
        details: 'Tier-based domestic lounge visits based on previous year spends (Silver: 8, Gold: 12, Platinum: 18).',
      },
      internationalLounge: {
        available: true,
        countPerYear: '4 to 12',
        program: 'DreamFolks',
        details: 'Complimentary international lounge access via DreamFolks / partner network.',
      },
      rewardRate: {
        basePercent: 4.0,
        pointsValueRupees: 2.0, // 1 EDGE Mile = 2 Partner Miles
      },
      cashbackHighlights: [
        { category: 'Direct Airline & Hotel Spends', rate: '5 EDGE Miles per ₹100 (10% airline miles value)', capsOrLimits: 'Capped at ₹2 Lakhs travel spend per month' },
        { category: 'All other spends', rate: '2 EDGE Miles per ₹100 (4% airline miles value)' },
      ],
      milestones: [
        { spendAmount: '₹3 Lakhs (Silver Tier)', reward: '2,500 EDGE Miles bonus', timeframe: 'annual' },
        { spendAmount: '₹7.5 Lakhs (Gold Tier)', reward: '5,000 EDGE Miles bonus', timeframe: 'annual' },
        { spendAmount: '₹15 Lakhs (Platinum Tier)', reward: '10,000 EDGE Miles bonus', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 3.5,
        details: 'Standard 3.5% + GST.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% waiver between ₹400 and ₹4,000.',
        minSpend: 400,
        maxSpend: 4000,
      },
      annualFee: {
        amount: '₹5,000 + GST',
        waiverSpend: 'Annual fee offset by 5,000 welcome EDGE miles (worth ₹10,000 travel)',
      },
      isRupayUPI: false,
      summaryPoints: [
        'India’s premier miles card: 1 EDGE Mile converts 1:2 to airline & hotel partners (Singapore KrisFlyer, Accor, Qatar, Turkish, Marriott)',
        '5 EDGE Miles per ₹100 on direct airlines and hotel websites (up to 10% return in travel)',
        '2 EDGE Miles per ₹100 on all other general retail spends (4% base return)',
        'Up to 18 domestic and 12 international lounge visits per year across Silver/Gold/Platinum tiers',
      ],
      allPerks: [
        { category: 'travel', title: '1:2 Airline Mile Conversion', description: 'Convert to Accor ALL, Singapore Airlines, Qatar Airways, Turkish, Air France.', highlight: '1:2 Miles' },
        { category: 'travel', title: '5 EDGE Miles on Travel', description: 'Book directly on airlines & hotel sites for huge accelerated returns.', highlight: '10% Travel' },
        { category: 'lounge', title: 'Tiered Lounge Access', description: 'Both primary and guest visits allowed from your allocated tier balance.', highlight: 'Guest Allowed' },
      ],
    },
  },
  {
    bankName: 'ICICI Bank',
    cardName: 'Sapphiro Credit Card',
    network: 'mastercard',
    suggestedColor: 'from-teal-900 via-cyan-950 to-gray-900',
    defaultStatementDay: 16,
    defaultGraceDays: 18,
    benefits: {
      domesticLounge: {
        available: true,
        countPerQuarter: 4,
        details: '4 complimentary domestic airport lounge visits per calendar quarter (with spend criteria).',
        spendCriteria: 'Spend ₹75,000 in previous calendar quarter to unlock access for the next quarter.',
      },
      internationalLounge: {
        available: true,
        countPerYear: 2,
        program: 'DreamFolks',
        details: '2 complimentary international lounge visits per calendar year via DreamFolks DragonPass.',
      },
      rewardRate: {
        basePercent: 1.0,
      },
      cashbackHighlights: [
        { category: 'BookMyShow Movies', rate: 'Buy 1 Get 1 Free (up to ₹500 off on 2nd ticket)', capsOrLimits: 'Can be availed up to twice every calendar month' },
        { category: 'International Spends', rate: '2X Reward Points' },
      ],
      milestones: [
        { spendAmount: '₹6,00,000', reward: 'Annual fee waiver (₹3,500 + GST)', timeframe: 'annual' },
      ],
      forexMarkup: {
        ratePercent: 3.5,
        details: 'Standard 3.5% + GST.',
      },
      fuelSurchargeWaiver: {
        available: true,
        details: '1% waiver between ₹400 and ₹4,000.',
        minSpend: 400,
        maxSpend: 4000,
      },
      annualFee: {
        amount: '₹3,500 + GST',
        waiverSpend: '₹6 Lakhs annual spend',
      },
      isRupayUPI: false,
      summaryPoints: [
        'Buy 1 Get 1 Free on BookMyShow movie/event tickets (up to ₹500 off, twice per month = ₹12,000/yr savings)',
        '4 complimentary domestic lounge visits per quarter (requires ₹75k quarterly spend)',
        '2 complimentary international lounge visits per year',
        'Complimentary golf rounds / lessons every month on spending ₹50,000',
      ],
      allPerks: [
        { category: 'movies', title: 'BOGO Movie Tickets (Up to ₹500)', description: 'BookMyShow Buy 1 Get 1 Free twice every month.', highlight: 'BOGO ₹500' },
        { category: 'lounge', title: '16 Domestic Lounges / Year', description: '4 visits per quarter with ₹75k quarter spend requirement.', highlight: '16 visits/yr' },
      ],
    },
  },
];

/**
 * Searches catalog for pre-seeded card benefits
 */
export function findInCatalog(bankName: string, cardName: string): CatalogCard | undefined {
  const normBank = bankName.toLowerCase().trim();
  const normCard = cardName.toLowerCase().trim();

  return CARD_CATALOG.find(c => {
    const bMatch = c.bankName.toLowerCase().includes(normBank) || normBank.includes(c.bankName.toLowerCase());
    const cMatch = c.cardName.toLowerCase().includes(normCard) || normCard.includes(c.cardName.toLowerCase());
    return bMatch && cMatch;
  }) || CARD_CATALOG.find(c => {
    // Fallback: match by card name alone if distinctive (e.g. "Infinia", "Regalia", "Amazon Pay")
    const cardWords = normCard.split(/\s+/).filter(w => w.length > 3);
    return cardWords.some(w => c.cardName.toLowerCase().includes(w));
  });
}
