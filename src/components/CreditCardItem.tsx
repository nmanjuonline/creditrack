import React from 'react';
import type { CreditCard } from '../types/card';
import { calculateBillingCycle } from '../utils/billingUtils';
import { 
  Plane, 
  RotateCw, 
  Eye, 
  Edit3, 
  Trash2, 
  Star, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Coins, 
  Globe, 
  Wifi 
} from 'lucide-react';

interface CreditCardItemProps {
  card: CreditCard;
  onViewBenefits: (card: CreditCard) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onRefreshBenefits: (card: CreditCard) => void;
  onToggleFavorite: (card: CreditCard) => void;
  isRefreshing?: boolean;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({
  card,
  onViewBenefits,
  onEditCard,
  onDeleteCard,
  onRefreshBenefits,
  onToggleFavorite,
  isRefreshing = false,
}) => {
  const calc = calculateBillingCycle(card);

  // Subtle luxury metallic finishes
  const getCardBg = () => {
    if (card.cardColor) return card.cardColor;
    if (card.cardNetwork === 'amex') return 'from-stone-800 via-neutral-900 to-black';
    if (card.bankName.toLowerCase().includes('icici')) return 'from-amber-950 via-stone-900 to-black';
    if (card.bankName.toLowerCase().includes('hdfc')) return 'from-slate-900 via-zinc-950 to-black';
    if (card.bankName.toLowerCase().includes('axis')) return 'from-rose-950/80 via-neutral-900 to-black';
    if (card.bankName.toLowerCase().includes('sbi')) return 'from-slate-900 via-neutral-950 to-black';
    return 'from-zinc-900 via-neutral-900 to-black';
  };

  return (
    <article 
      className="flex flex-col glass-card rounded-3xl overflow-hidden hover:border-amber-400/30 transition-all duration-300 shadow-xl group"
      aria-label={`${card.bankName} ${card.cardName} card details`}
    >
      {/* Apple Wallet Physical Card Artifact (ISO/IEC 7810 ID-1 standard ~1.586:1 aspect ratio) */}
      <div className="p-3 pb-0">
        <div className={`relative aspect-[1.586/1] p-4 sm:p-5 rounded-2xl bg-gradient-to-tr ${getCardBg()} text-white overflow-hidden shadow-xl ring-1 ring-white/15 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.01]`}>
          {/* Specular hairline shimmer & card texture */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] via-transparent to-black/20 pointer-events-none" />
          <div className="absolute right-3 bottom-2 opacity-15 text-4xl sm:text-5xl font-black select-none pointer-events-none uppercase tracking-tighter" aria-hidden="true">
            {card.cardNetwork}
          </div>

          {/* Top row: Bank & Favorite & Network */}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-300 drop-shadow-sm">
                {card.bankName}
              </span>
              {card.cardAlias && (
                <span className="block text-[10px] text-amber-300 font-medium">
                  {card.cardAlias}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(card);
                }}
                className="text-zinc-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-black/20 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label={card.isFavorite ? 'Unfavorite card' : 'Favorite card'}
                title="Favorite card"
              >
                <Star className={`w-4 h-4 ${card.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} aria-hidden="true" />
              </button>
              <div className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-zinc-200 border border-white/15">
                {card.cardNetwork}
              </div>
            </div>
          </div>

          {/* Middle row: EMV Chip & Contactless */}
          <div className="flex items-center gap-2.5 relative z-10" aria-hidden="true">
            <div className="w-9 h-6.5 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-600 border border-amber-200/60 shadow-sm flex flex-col justify-between p-1">
              <div className="w-full h-0.5 bg-yellow-900/30" />
              <div className="w-full h-0.5 bg-yellow-900/30" />
            </div>
            <Wifi className="w-3.5 h-3.5 text-zinc-400 rotate-90" />
          </div>

          {/* Bottom row: Card Name & Statement Cycle */}
          <div className="relative z-10">
            <h3 className="font-bold text-base sm:text-lg text-white tracking-wide truncate drop-shadow-sm">
              {card.cardName}
            </h3>
            <div className="flex items-center justify-between text-[10px] text-zinc-300/90 mt-0.5 tabular-num font-medium">
              <span>Cut: <strong className="text-white">{card.statementDay}th</strong></span>
              <span>Grace: <strong className="text-white">+{card.dueDaysAfterStatement}d</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Intelligence Bar */}
      <div className="p-4 bg-black/25 border-b border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          {/* Statement Countdown */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span className="text-zinc-400">Statement Cut:</span>
            <span className={`font-semibold tabular-num ${
              calc.daysUntilStatement <= 2 ? 'text-amber-400' : 'text-zinc-200'
            }`}>
              {calc.daysUntilStatement === 0 ? 'Today!' : `in ${calc.daysUntilStatement}d`}
            </span>
            <span className="text-[10px] text-slate-400 tabular-num">
              ({calc.nextStatementDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
            </span>
          </div>

          {/* Payment Due Countdown */}
          <div className="flex items-center gap-1.5">
            {calc.isBillPaymentUrgent ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" aria-hidden="true" />
            ) : null}
            <span className="text-zinc-400">Due:</span>
            <span className={`font-semibold tabular-num ${
              calc.daysUntilDue <= 3 ? 'text-rose-400' : 'text-zinc-200'
            }`}>
              {calc.daysUntilDue === 0 ? 'Today!' : `in ${calc.daysUntilDue}d`}
            </span>
            <span className="text-[10px] text-slate-400 tabular-num">
              ({calc.nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
            </span>
          </div>
        </div>

        {/* Float days badge in Warm Gold */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span className="text-zinc-300">Interest-Free Float:</span>
          </div>
          <span className={`font-bold px-2.5 py-0.5 rounded text-xs tabular-num ${
            calc.floatDaysIfSpentToday >= 40
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
              : calc.daysUntilStatement <= 3
              ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
              : 'bg-white/[0.06] text-zinc-300'
          }`}>
            {calc.floatDaysIfSpentToday} Days if spent today
          </span>
        </div>
      </div>

      {/* Top Benefits Badges */}
      <div className="p-4 space-y-2.5 flex-1">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          Privileges & Returns
        </div>

        <div className="space-y-1.5">
          {/* Lounge */}
          <div className="flex items-start gap-2 text-xs">
            <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-zinc-300">
              <strong className="text-white">Lounge:</strong>{' '}
              {card.benefits.domesticLounge.available ? (
                <span className="tabular-num">
                  {card.benefits.domesticLounge.countPerQuarter} Dom/qtr
                  {card.benefits.internationalLounge.available && ` + ${card.benefits.internationalLounge.countPerYear} Int`}
                </span>
              ) : (
                <span className="text-slate-400">No lounge access</span>
              )}
            </div>
          </div>

          {/* Reward Rate */}
          <div className="flex items-start gap-2 text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-zinc-300">
              <strong className="text-white">Rewards:</strong>{' '}
              <span className="tabular-num">{card.benefits.rewardRate.basePercent}% base return</span>
              {card.benefits.cashbackHighlights?.[0] && (
                <span className="text-amber-300 ml-1 font-semibold tabular-num">
                  ({card.benefits.cashbackHighlights[0].rate})
                </span>
              )}
            </div>
          </div>

          {/* Forex */}
          <div className="flex items-start gap-2 text-xs">
            <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-zinc-300">
              <strong className="text-white">Forex Fee:</strong>{' '}
              <span className={`tabular-num ${card.benefits.forexMarkup.ratePercent <= 2.0 ? 'text-amber-300 font-semibold' : ''}`}>
                {card.benefits.forexMarkup.ratePercent}% + GST
              </span>
            </div>
          </div>
        </div>

        {card.benefits.domesticLounge.spendCriteria && (
          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90 leading-tight">
            <span className="font-semibold text-amber-300">Lounge Criteria:</span> {card.benefits.domesticLounge.spendCriteria}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-black/35 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <button
          onClick={() => onViewBenefits(card)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 font-medium transition-colors min-h-[44px]"
          aria-label={`View all perks for ${card.cardName}`}
        >
          <Eye className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>All Perks</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onRefreshBenefits(card)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
            aria-label={`Refresh latest benefits for ${card.cardName}`}
            title="Fetch latest benefits via AI / Catalog"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} aria-hidden="true" />
          </button>

          <button
            onClick={() => onEditCard(card)}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Edit ${card.cardName} billing cycle`}
            title="Edit billing cycle or card info"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={() => onDeleteCard(card.id)}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Delete ${card.cardName}`}
            title="Delete card"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
