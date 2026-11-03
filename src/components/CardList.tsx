import React, { useMemo } from 'react';
import type { CreditCard } from '../types/card';
import { CreditCardItem } from './CreditCardItem';
import type { BenefitQuickFilter, CardSortOption } from './BenefitFilterBar';
import { calculateBillingCycle } from '../utils/billingUtils';
import { Plus, CreditCard as CardIcon, Search } from 'lucide-react';

interface CardListProps {
  cards: CreditCard[];
  totalCardsCount?: number;
  searchQuery: string;
  activeFilter: BenefitQuickFilter;
  sortOption: CardSortOption;
  onClearFilters?: () => void;
  onAddCard: () => void;
  onLoadSamples: () => void;
  onViewBenefits: (card: CreditCard) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onRefreshBenefits: (card: CreditCard) => void;
  onToggleFavorite: (card: CreditCard) => void;
  refreshingCardId: string | null;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  totalCardsCount = cards.length,
  searchQuery,
  activeFilter,
  sortOption,
  onClearFilters,
  onAddCard,
  onLoadSamples,
  onViewBenefits,
  onEditCard,
  onDeleteCard,
  onRefreshBenefits,
  onToggleFavorite,
  refreshingCardId,
}) => {
  // Sort cards based on selected criterion
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      // Favorites always on top
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      const calcA = calculateBillingCycle(a);
      const calcB = calculateBillingCycle(b);

      switch (sortOption) {
        case 'float_desc':
          return calcB.floatDaysIfSpentToday - calcA.floatDaysIfSpentToday;
        case 'statement_asc':
          return calcA.daysUntilStatement - calcB.daysUntilStatement;
        case 'due_asc':
          return calcA.daysUntilDue - calcB.daysUntilDue;
        case 'reward_desc':
          return b.benefits.rewardRate.basePercent - a.benefits.rewardRate.basePercent;
        case 'name_asc':
          return a.cardName.localeCompare(b.cardName);
        default:
          return 0;
      }
    });
  }, [cards, sortOption]);

  // Zero cards in wallet: Onboarding state
  if (totalCardsCount === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl glass-panel">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-500/10">
          <CardIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Credit Cards Tracked Yet</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Add your cards to track billing cycles, discover lounge rules, unlock maximum interest-free float, and never miss a payment deadline.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onAddCard}
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Card</span>
          </button>
          <button
            onClick={onLoadSamples}
            className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-zinc-200 font-medium text-xs border border-white/10 transition-all min-h-[44px]"
          >
            Load Sample Cards (HDFC, ICICI, SBI, Amex)
          </button>
        </div>
      </div>
    );
  }

  // Cards exist, but search query yielded 0 results
  if (sortedCards.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl glass-panel space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.05] text-zinc-400 flex items-center justify-center border border-white/10">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Matching Cards Found</h3>
        <p className="text-zinc-400 text-xs max-w-sm mx-auto">
          No credit cards matched your criteria
          {searchQuery ? ` for "${searchQuery}"` : ''}
          {activeFilter !== 'all' ? ` under "${activeFilter}" filter` : ''}.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 min-h-[44px]"
          >
            Clear Search &amp; Show All Cards
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedCards.map(card => (
        <CreditCardItem
          key={card.id}
          card={card}
          onViewBenefits={onViewBenefits}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
          onRefreshBenefits={onRefreshBenefits}
          onToggleFavorite={onToggleFavorite}
          isRefreshing={refreshingCardId === card.id}
        />
      ))}
    </div>
  );
};
