

import React, { useState, useRef, useEffect } from 'react';
import type { CreditCard } from '../types/card';
import { calculateBillingCycle, getCardTopPerks, formatCreditLimit, getMaskedCardNumber } from '../utils/billingUtils';
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  Wifi,
  Clock,
  AlertTriangle,
  Plane,
  Eye,
  Edit3,
  Trash2,
  RotateCw,
  Coins,
  Globe,
  Plus,
  X,
  Layers,
  Zap,
  Gift
} from 'lucide-react';

interface WalletStackProps {
  cards: CreditCard[];
  onViewBenefits: (card: CreditCard) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onRefreshBenefits: (card: CreditCard) => void;
  onToggleFavorite: (card: CreditCard) => void;
  refreshingCardId: string | null;
  onAddCard: () => void;
}

const renderPerkIcon = (category: string) => {
  switch (category) {
    case 'lounge':
      return <Plane className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />;
    case 'upi':
      return <Zap className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />;
    case 'cashback':
      return <Gift className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />;
    case 'forex':
      return <Globe className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />;
    default:
      return <Star className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />;
  }
};

export const WalletStack: React.FC<WalletStackProps> = ({
  cards,
  onViewBenefits,
  onEditCard,
  onDeleteCard,
  onRefreshBenefits,
  onToggleFavorite,
  refreshingCardId,
  onAddCard,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Real-time touch drag state for 1:1 finger tracking
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const deckScrollRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Lock background window scroll when the full vertical stack deck is open
  useEffect(() => {
    if (isExpanded) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (deckScrollRef.current) {
        deckScrollRef.current.scrollTop = 0;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isExpanded]);

  if (cards.length === 0) return null;

  // Clamped active index
  const safeIndex = Math.min(activeIndex, Math.max(0, cards.length - 1));
  const activeCard = cards[safeIndex] || cards[0];
  const activeCalc = calculateBillingCycle(activeCard);

  // Helper for card background gradient styling
  const getCardBg = (card: CreditCard) => {
    if (card.cardColor) return card.cardColor;
    if (card.cardNetwork === 'amex') return 'from-stone-800 via-neutral-900 to-black';
    if (card.bankName.toLowerCase().includes('icici')) return 'from-amber-950 via-stone-900 to-black';
    if (card.bankName.toLowerCase().includes('hdfc')) return 'from-slate-900 via-zinc-950 to-black';
    if (card.bankName.toLowerCase().includes('axis')) return 'from-rose-950/80 via-neutral-900 to-black';
    if (card.bankName.toLowerCase().includes('sbi')) return 'from-slate-900 via-neutral-950 to-black';
    return 'from-zinc-900 via-neutral-900 to-black';
  };

  // =========================================================================
  // CAROUSEL TOUCH GESTURES (1:1 Finger Tracking, Zero Page Movement)
  // =========================================================================
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartRef.current.x;
    const diffY = currentY - touchStartRef.current.y;

    // Track horizontal displacement in real-time
    // Add rubber-band resistance at the ends of the carousel
    if ((safeIndex === 0 && diffX > 0) || (safeIndex === cards.length - 1 && diffX < 0)) {
      setDragOffset(diffX * 0.35);
    } else {
      setDragOffset(diffX);
    }

    // If swiping upwards significantly, cancel drag offset to prepare for deck expansion
    if (diffY < -50 && Math.abs(diffY) > Math.abs(diffX)) {
      setDragOffset(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartRef.current.x;
    const diffY = endY - touchStartRef.current.y;
    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // 1. Swipe UP -> Expand to Full Vertical Stack Deck
    if (diffY < -45 && absY > absX) {
      setIsExpanded(true);
      return;
    }

    // 2. Horizontal Swipe -> Snap to Next / Previous Card
    const threshold = 40; // minimum drag distance in px
    if (absX > threshold && absX > absY) {
      if (diffX < 0 && safeIndex < cards.length - 1) {
        // Dragged LEFT -> Next card
        setActiveIndex(safeIndex + 1);
      } else if (diffX > 0 && safeIndex > 0) {
        // Dragged RIGHT -> Previous card
        setActiveIndex(safeIndex - 1);
      }
    }
  };

  // Expanded deck gesture: Swipe DOWN near the top collapses back to carousel
  const handleDeckTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleDeckTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const scrollTop = deckScrollRef.current?.scrollTop || 0;
    if (diffY > 50 && scrollTop <= 10) {
      setIsExpanded(false);
    }
  };

  const handleSelectCardInDeck = (index: number) => {
    setActiveIndex(index);
    setIsExpanded(false);
  };

  return (
    <div className="max-w-xl mx-auto w-full select-none space-y-3.5">
      {/* Carousel Navigation Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Access
          </span>
          <span className="text-xs font-bold text-amber-300 tabular-num">
            {safeIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Hop Left / Right */}
          <button
            type="button"
            onClick={() => setActiveIndex(prev => (prev > 0 ? prev - 1 : cards.length - 1))}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex(prev => (prev < cards.length - 1 ? prev + 1 : 0))}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Add Card Button */}
          <button
            type="button"
            onClick={onAddCard}
            className="w-8 h-8 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 flex items-center justify-center border border-amber-400/40 active:scale-95 transition-all ml-1"
            aria-label="Add new credit card"
            title="Add Card"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          THE HORIZONTAL SWIPE CAROUSEL (Samsung Wallet Quick Access)
          touch-action: none prevents ANY vertical document scrolling while touching cards!
          ========================================================================= */}
      <div className="relative overflow-hidden py-1">
        <div
          ref={cardContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
          className="relative w-full aspect-[1.586/1] cursor-grab active:cursor-grabbing"
        >
          {cards.map((card, idx) => {
            // Distance from active card
            const offsetIndex = idx - safeIndex;
            // Only render adjacent cards for optimal performance
            if (Math.abs(offsetIndex) > 2) return null;

            // Compute exact horizontal translation with 1:1 finger drag offset
            const baseTranslatePercent = offsetIndex * 105; // 105% leaves a pleasant 5% peek gap
            const scale = offsetIndex === 0 ? 1 : 0.94;
            const opacity = Math.abs(offsetIndex) === 1 ? 0.65 : offsetIndex === 0 ? 1 : 0.2;
            const zIndex = offsetIndex === 0 ? 20 : 10 - Math.abs(offsetIndex);

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (offsetIndex === 0) {
                    setIsExpanded(true);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                className={`absolute inset-0 rounded-3xl p-4 sm:p-5 bg-gradient-to-tr ${getCardBg(card)} text-white overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.75)] ring-1 ${offsetIndex === 0 ? 'ring-white/20' : 'ring-white/10 pointer-events-none sm:pointer-events-auto'
                  } flex flex-col justify-between`}
                style={{
                  transform: `translateX(calc(${baseTranslatePercent}% + ${dragOffset}px)) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease',
                  opacity,
                  zIndex,
                }}
              >
                {/* Specular sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-black/20 pointer-events-none" />

                {/* Top row: Bank, Favorite, Network */}
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-300 drop-shadow-sm">
                      {card.bankName}
                    </span>
                    {card.cardAlias && (
                      <span className="block text-[11px] text-amber-300 font-semibold">
                        {card.cardAlias}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(card);
                      }}
                      className="text-zinc-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-black/20 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      aria-label={card.isFavorite ? 'Unfavorite card' : 'Favorite card'}
                    >
                      <Star className={`w-4 h-4 ${card.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <div className="px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-zinc-200 border border-white/15">
                      {card.cardNetwork}
                    </div>
                  </div>
                </div>

                {/* Middle row: EMV Chip & Top Perks Badges */}
                <div className="flex items-center justify-between gap-2 relative z-10 my-auto py-1">
                  <div className="flex items-center gap-2" aria-hidden="true">
                    <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-600 border border-amber-200/60 shadow-sm flex flex-col justify-between p-1">
                      <div className="w-full h-0.5 bg-yellow-900/30" />
                      <div className="w-full h-0.5 bg-yellow-900/30" />
                    </div>
                    <Wifi className="w-4 h-4 text-zinc-400 rotate-90" />
                  </div>

                  {/* Top Perks Badges right on card face */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[65%]">
                    {getCardTopPerks(card, 2).map((perk, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/15 flex items-center gap-1 shadow-sm shrink-0"
                      >
                        {renderPerkIcon(perk.category)}
                        <span className="truncate max-w-[110px]">{perk.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom row: Card Name, Statement Cycle, & Credit Limit */}
                <div className="relative z-10">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide truncate drop-shadow-sm">
                      {card.cardName}
                    </h3>
                    <span className="tracking-widest font-mono text-[11px] text-zinc-400 shrink-0">
                      {getMaskedCardNumber(card.id)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-300/90 tabular-num font-medium pt-1.5 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <span>Cut: <strong className="text-white">{card.statementDay}th</strong></span>
                      <span>Grace: <strong className="text-white">+{card.dueDaysAfterStatement}d</strong></span>
                    </div>
                    {card.creditLimit && card.creditLimit > 0 ? (
                      <span className="text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 whitespace-nowrap shrink-0">
                        Limit: {formatCreditLimit(card.creditLimit)}
                      </span>
                    ) : (
                      <span>Return: <strong className="text-amber-300">{card.benefits?.rewardRate?.basePercent || 1}%</strong></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand Action Handle */}
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full mt-2.5 py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-300 group transition-colors active:scale-95"
          aria-label="Expand all cards in wallet stack"
        >
          <ChevronUp className="w-4 h-4 text-amber-400 group-hover:-translate-y-0.5 transition-transform animate-pulse" />
          <span>Swipe up or tap to expand all {cards.length} cards</span>
        </button>
      </div>

      {/* =========================================================================
          ACTIVE CARD DETAILS PANEL (Anchored stably below the card)
          ========================================================================= */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl border border-white/10">
        {/* Float Runway Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center border border-amber-400/20 shrink-0">
              <Clock className="w-4 h-4 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-300">Interest-free float</div>
              <div className="text-[11px] text-zinc-400">Runway if spent today</div>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-xl text-xs font-semibold tabular-num tracking-wide shrink-0 border ${activeCalc.floatDaysIfSpentToday >= 40
            ? 'bg-amber-400/15 text-amber-200 border-amber-400/30 shadow-sm'
            : activeCalc.daysUntilStatement <= 3
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
              : 'bg-white/[0.06] text-white border-white/10'
            }`}>
            {activeCalc.floatDaysIfSpentToday} days
          </div>
        </div>

        {/* Two-Column Structured Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Statement Cut */}
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-medium">Statement Cut</span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`text-sm font-bold tabular-num ${activeCalc.daysUntilStatement <= 2 ? 'text-amber-400' : 'text-white'
                }`}>
                {activeCalc.daysUntilStatement === 0 ? 'Today!' : `in ${activeCalc.daysUntilStatement}d`}
              </span>
              <span className="text-[11px] text-slate-400 tabular-num">
                ({activeCalc.nextStatementDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
              </span>
            </div>
          </div>

          {/* Payment Due */}
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              {activeCalc.isBillPaymentUrgent ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce shrink-0" aria-hidden="true" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              )}
              <span className="text-[11px] font-medium">Payment Due</span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`text-sm font-bold tabular-num ${activeCalc.daysUntilDue <= 3 ? 'text-rose-400 font-extrabold' : 'text-white'
                }`}>
                {activeCalc.daysUntilDue === 0 ? 'Today!' : `in ${activeCalc.daysUntilDue}d`}
              </span>
              <span className="text-[11px] text-slate-400 tabular-num">
                ({activeCalc.nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Privileges Row */}
        <div className="space-y-1.5 pt-1 border-t border-white/[0.06] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-amber-400" />
              <span>Airport Lounge</span>
            </span>
            <span className="font-semibold text-white tabular-num">
              {activeCard.benefits.domesticLounge.available
                ? `${activeCard.benefits.domesticLounge.countPerQuarter} Dom/qtr`
                : 'None'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Base Rewards</span>
            </span>
            <span className="font-semibold text-amber-300 tabular-num">
              {activeCard.benefits.rewardRate.basePercent}% return
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Forex Markup</span>
            </span>
            <span className="font-semibold text-white tabular-num">
              {activeCard.benefits.forexMarkup.ratePercent}% + GST
            </span>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewBenefits(activeCard)}
            className="flex-1 btn-gold py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md min-h-[44px]"
          >
            <Eye className="w-4 h-4" />
            <span>All Perks</span>
          </button>

          <button
            type="button"
            onClick={() => onRefreshBenefits(activeCard)}
            disabled={refreshingCardId === activeCard.id}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
            aria-label="Refresh AI benefits"
            title="Refresh benefits"
          >
            <RotateCw className={`w-4 h-4 ${refreshingCardId === activeCard.id ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onEditCard(activeCard)}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Edit card"
            title="Edit card"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteCard(activeCard.id)}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Delete card"
            title="Delete card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          THE FULL WALLET DECK OVERLAY (Samsung Wallet Expanded Deck)
          Scroll through all stacked cards vertically with zero page movement!
          ========================================================================= */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-[#070b14]/95 backdrop-blur-3xl flex flex-col animate-in fade-in slide-in-from-bottom duration-300"
          onTouchStart={handleDeckTouchStart}
          onTouchEnd={handleDeckTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Wallet Deck"
        >
          {/* Deck Top Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Wallet Deck</h3>
                <span className="text-[11px] text-slate-400 block tabular-num">
                  {cards.length} cards · Tap any card to select
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddCard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-semibold border border-amber-400/40 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all"
                aria-label="Close wallet deck"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Swipe down cue */}
          <div className="text-center pt-2 shrink-0">
            <span className="text-[10px] font-medium text-slate-400 inline-flex items-center gap-1">
              <span>Swipe down or tap a card to collapse</span>
            </span>
          </div>

          {/* Scrollable Overlapping Cards Deck */}
          <div
            ref={deckScrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 max-w-lg mx-auto w-full pb-36 no-scrollbar"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {cards.map((card, idx) => {
              const cardCalc = calculateBillingCycle(card);
              const isSelected = idx === safeIndex;
              const isLastCard = idx === cards.length - 1;

              return (
                <div
                  key={card.id}
                  onClick={() => handleSelectCardInDeck(idx)}
                  className={`relative aspect-[1.586/1] w-full rounded-3xl p-4 sm:p-5 bg-gradient-to-tr ${getCardBg(card)} text-white overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-all duration-300 hover:translate-y-[-8px] cursor-pointer active:scale-[0.99] flex flex-col justify-between ${isSelected ? 'ring-2 ring-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.3)]' : 'ring-1 ring-white/15'
                    }`}
                  style={{
                    // Exactly 76px exposed tab on every screen size (card height is 63.05% of width)
                    marginTop: idx === 0 ? '0px' : 'calc(-63.05% + 76px)',
                    // Strictly ascending z-index so each card stacks cleanly on top of the previous one
                    zIndex: idx + 1,
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${card.bankName} ${card.cardName}, tap to select and close deck`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectCardInDeck(idx);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-black/25 pointer-events-none" />

                  {/* Top row: Bank Name, Active Pill & Network Badge & Float */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-200 drop-shadow-sm">
                        {card.bankName}
                      </span>
                      {card.isFavorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" aria-label="Favorite" />
                      )}
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold ml-1">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tabular-num ${cardCalc.floatDaysIfSpentToday >= 40
                        ? 'bg-amber-400/25 text-amber-200 border-amber-400/40'
                        : cardCalc.daysUntilDue <= 3
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                          : 'bg-black/40 text-slate-200 border-white/15'
                        }`}>
                        {cardCalc.daysUntilDue <= 3
                          ? `Due in ${cardCalc.daysUntilDue}d`
                          : `${cardCalc.floatDaysIfSpentToday}d Float`}
                      </span>

                      <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-zinc-300 border border-white/15">
                        {card.cardNetwork}
                      </div>
                    </div>
                  </div>

                  {/* Middle row: EMV Chip & Contactless & Card Name */}
                  <div className="flex items-center justify-between relative z-10 pt-2 pb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-6 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-600 border border-amber-200/60 shadow-sm flex flex-col justify-between p-0.5">
                        <div className="w-full h-0.5 bg-yellow-900/30" />
                        <div className="w-full h-0.5 bg-yellow-900/30" />
                      </div>
                      <Wifi className="w-3.5 h-3.5 text-zinc-400 rotate-90" />
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-white tracking-wide truncate max-w-[200px] sm:max-w-xs text-right">
                      {card.cardName}
                    </h4>
                  </div>

                  {/* Expanded Card Details (Top Perks & Credit Limit) - Visible on bottom card or single card */}
                  {isLastCard && (
                    <div className="relative z-10 mt-auto pt-3 flex flex-col justify-end gap-2.5">
                      {/* Top Perks Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getCardTopPerks(card, 3).map((perk, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[10.5px] font-semibold text-white/95 border border-white/15 flex items-center gap-1.5 shadow-sm"
                          >
                            {renderPerkIcon(perk.category)}
                            <span>{perk.label}</span>
                          </span>
                        ))}
                      </div>

                      {/* Bottom Footer: Cut, Grace, Credit Limit & Masked Digits */}
                      <div className="flex items-center justify-between text-xs text-zinc-300/90 pt-2 border-t border-white/[0.10] tabular-num font-medium">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <span>Cut: <strong className="text-white">{card.statementDay}th</strong></span>
                          <span>Grace: <strong className="text-white">+{card.dueDaysAfterStatement}d</strong></span>
                          {card.creditLimit && card.creditLimit > 0 ? (
                            <span className="text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 whitespace-nowrap shrink-0">
                              Limit: {formatCreditLimit(card.creditLimit)}
                            </span>
                          ) : (
                            <span>Return: <strong className="text-amber-300">{card.benefits?.rewardRate?.basePercent || 1}%</strong></span>
                          )}
                        </div>
                        <span className="tracking-widest font-mono text-[11px] text-zinc-400">
                          {getMaskedCardNumber(card.id)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
