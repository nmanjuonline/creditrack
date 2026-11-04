import React, { useState } from 'react';
import type { CreditCard, SpendCategory } from '../types/card';
import { calculateBillingCycle, scoreCardForSpend } from '../utils/billingUtils';
import { Compass, ArrowRight, Flame, Utensils, Plane, ShoppingBag, Fuel, QrCode, Film, CreditCard as CardIcon } from 'lucide-react';

interface SmartFloatBannerProps {
  cards: CreditCard[];
  onSelectCard: (card: CreditCard) => void;
}

const CATEGORIES: { id: SpendCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Everyday Spends', icon: <CardIcon className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'dining', label: 'Dining & Food', icon: <Utensils className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'travel', label: 'Flights & Hotels', icon: <Plane className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'shopping', label: 'Online Retail', icon: <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'fuel', label: 'Fuel & Commute', icon: <Fuel className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'upi', label: 'RuPay UPI QR', icon: <QrCode className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'movies', label: 'Movies & Events', icon: <Film className="w-3.5 h-3.5" aria-hidden="true" /> },
];

export const SmartFloatBanner: React.FC<SmartFloatBannerProps> = ({ cards, onSelectCard }) => {
  const [selectedCategory, setSelectedCategory] = useState<SpendCategory>('all');

  if (cards.length === 0) {
    return null;
  }

  // Calculate scores for all cards
  const scoredCards = cards.map(card => {
    const calc = calculateBillingCycle(card);
    const scoreData = scoreCardForSpend(card, calc, selectedCategory);
    return {
      card,
      calc,
      ...scoreData,
    };
  }).sort((a, b) => b.score - a.score);

  const topCard = scoredCards[0];
  const runnersUp = scoredCards.slice(1, 4);

  return (
    <section 
      className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-7 shadow-xl mb-8 border border-white/[0.08]"
      role="region"
      aria-label="Smart Float & Spend Maximizer Recommendation"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-amber-300 font-medium text-xs mb-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Optimal payment runway</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Which Card Should You Use Today?
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Balances the longest interest-free float runway (up to 52 days) with the highest category reward rate.
          </p>
        </div>

        {/* Spend Category Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar" role="radiogroup" aria-label="Spend category filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[38px] ${
                selectedCategory === cat.id
                  ? 'bg-amber-400/15 text-amber-200 border border-amber-400/30 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
              }`}
              role="radio"
              aria-checked={selectedCategory === cat.id}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Recommended Card Hero */}
      {topCard && (
        <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-white/[0.10] relative z-10">
          <div className="flex items-start gap-5">
            {/* Float Counter */}
            <div 
              className="w-16 h-16 rounded-xl bg-zinc-900 flex flex-col items-center justify-center text-zinc-100 shrink-0 tabular-num border border-white/10"
              aria-label={`${topCard.calc.floatDaysIfSpentToday} days of interest-free float`}
            >
              <span className="text-[10px] text-zinc-400 font-medium">Float</span>
              <span className="text-2xl font-bold text-amber-300 my-0.5 leading-none">{topCard.calc.floatDaysIfSpentToday}</span>
              <span className="text-[10px] text-zinc-400 font-medium">days</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Flame className="w-3 h-3 text-amber-400" aria-hidden="true" />
                  Top Recommendation Today
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {topCard.card.bankName}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {topCard.card.cardName}
                {topCard.card.cardAlias && (
                  <span className="text-xs font-normal text-amber-300/80">({topCard.card.cardAlias})</span>
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                <span className="text-amber-200 font-semibold">
                  {topCard.rewardHighlight}
                </span>
                <span className="text-zinc-600" aria-hidden="true">•</span>
                <span className="text-zinc-300 tabular-num">
                  Statement in <strong className="text-white">{topCard.calc.daysUntilStatement} days</strong> ({topCard.calc.nextStatementDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                </span>
                <span className="text-zinc-600" aria-hidden="true">•</span>
                <span className="text-zinc-300 tabular-num">
                  Payment due: <strong className="text-white">{topCard.calc.nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
                </span>
              </div>

              <p className="text-xs text-zinc-400 mt-2 font-medium">
                {topCard.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => onSelectCard(topCard.card)}
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
              aria-label={`View benefits for recommended card ${topCard.card.cardName}`}
            >
              <span>View Benefits</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Runners Up Cards comparison */}
      {runnersUp.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/[0.08] relative z-10">
          <div className="text-xs text-zinc-400 font-medium mb-3">Other Cards in Your Wallet:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {runnersUp.map(item => (
              <button
                key={item.card.id}
                onClick={() => onSelectCard(item.card)}
                className="text-left p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-400/30 transition-colors group min-h-[44px]"
                aria-label={`${item.card.cardName}: ${item.calc.floatDaysIfSpentToday} days float`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 truncate font-medium">{item.card.bankName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tabular-num ${
                    item.calc.floatDaysIfSpentToday >= 40
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                      : item.calc.daysUntilStatement <= 3
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                      : 'bg-white/[0.06] text-zinc-300'
                  }`}>
                    {item.calc.floatDaysIfSpentToday}d Float
                  </span>
                </div>
                <div className="font-semibold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                  {item.card.cardName}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between tabular-num">
                  <span>Cut: {item.calc.nextStatementDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span className="text-amber-300 font-semibold">{item.rewardHighlight.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
