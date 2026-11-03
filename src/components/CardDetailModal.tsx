import React, { useState, useEffect, useCallback } from 'react';
import type { CreditCard } from '../types/card';
import { calculateBillingCycle, formatDate } from '../utils/billingUtils';
import { 
  X, 
  Plane, 
  RotateCw, 
  Coins, 
  Globe, 
  Fuel, 
  Gift, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

interface CardDetailModalProps {
  card: CreditCard | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshBenefits: (card: CreditCard) => Promise<void>;
  isRefreshing?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onRefreshBenefits,
  isRefreshing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'lounge' | 'milestones' | 'billing'>('benefits');

  // Escape key listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !card) return null;

  const calc = calculateBillingCycle(card);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-detail-title"
    >
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 my-8 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Card Header Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
                {card.bankName}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.08] text-zinc-300 uppercase tracking-wider">
                {card.cardNetwork}
              </span>
              {card.benefits.isRupayUPI && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  RuPay UPI Enabled
                </span>
              )}
            </div>
            <h2 id="card-detail-title" className="text-xl sm:text-2xl font-bold tracking-tight">
              {card.cardName}
            </h2>
            {card.cardAlias && (
              <p className="text-xs text-zinc-400 mt-0.5">Alias: {card.cardAlias}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefreshBenefits(card)}
              disabled={isRefreshing}
              className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 min-h-[44px]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isRefreshing ? 'Updating...' : 'Refresh Benefits'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 mb-5 overflow-x-auto no-scrollbar" role="tablist">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] ${
              activeTab === 'benefits'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            role="tab"
            aria-selected={activeTab === 'benefits'}
          >
            All Perks & Rewards
          </button>
          <button
            onClick={() => setActiveTab('lounge')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] ${
              activeTab === 'lounge'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            role="tab"
            aria-selected={activeTab === 'lounge'}
          >
            Airport Lounges
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] ${
              activeTab === 'milestones'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            role="tab"
            aria-selected={activeTab === 'milestones'}
          >
            Milestones & Fees
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[44px] ${
              activeTab === 'billing'
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            role="tab"
            aria-selected={activeTab === 'billing'}
          >
            Billing Cycle & Float
          </button>
        </div>

        {/* TAB 1: ALL BENEFITS & REWARDS */}
        {activeTab === 'benefits' && (
          <div className="space-y-5" role="tabpanel">
            {/* Summary Highlights */}
            {card.benefits.summaryPoints && card.benefits.summaryPoints.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Key Card Highlights</span>
                </div>
                <ul className="space-y-2">
                  {card.benefits.summaryPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Base Reward & Multipliers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                  <Coins className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Base Reward Return</span>
                </div>
                <div className="text-2xl font-black text-white tabular-num">
                  {card.benefits.rewardRate.basePercent}%
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {card.benefits.rewardRate.rewardPointsPer100 ? `${card.benefits.rewardRate.rewardPointsPer100} points per ₹100 spend` : 'Effective base value'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                  <Globe className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Forex Markup Fee</span>
                </div>
                <div className={`text-2xl font-black tabular-num ${card.benefits.forexMarkup.ratePercent <= 2.0 ? 'text-amber-300' : 'text-white'}`}>
                  {card.benefits.forexMarkup.ratePercent}% + GST
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {card.benefits.forexMarkup.details}
                </div>
              </div>
            </div>

            {/* Cashback Highlights */}
            {card.benefits.cashbackHighlights && card.benefits.cashbackHighlights.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                  Category Cashback & Multipliers
                </h4>
                <div className="space-y-2">
                  {card.benefits.cashbackHighlights.map((cb, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{cb.category}</div>
                        {cb.capsOrLimits && <div className="text-[11px] text-zinc-400">{cb.capsOrLimits}</div>}
                      </div>
                      <span className="font-bold text-amber-300 text-sm px-2.5 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/20 tabular-num">
                        {cb.rate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Perks Detailed List */}
            {card.benefits.allPerks && card.benefits.allPerks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                  Detailed Perks Catalog
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {card.benefits.allPerks.map((perk, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{perk.title}</span>
                        {perk.highlight && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            {perk.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">{perk.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AIRPORT LOUNGES */}
        {activeTab === 'lounge' && (
          <div className="space-y-4" role="tabpanel">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span className="font-bold text-sm text-white">Domestic Airport Lounge</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  card.benefits.domesticLounge.available ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30' : 'bg-white/[0.06] text-zinc-500'
                }`}>
                  {card.benefits.domesticLounge.available ? 'Complimentary' : 'None'}
                </span>
              </div>

              {card.benefits.domesticLounge.available ? (
                <div className="space-y-2 text-xs">
                  <div className="text-zinc-200">
                    <strong>Complimentary Visits:</strong> <span className="tabular-num">{card.benefits.domesticLounge.countPerQuarter}</span> visits per quarter
                  </div>
                  <p className="text-zinc-400 leading-relaxed">{card.benefits.domesticLounge.details}</p>

                  {card.benefits.domesticLounge.spendCriteria && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 mt-2">
                      <div className="font-bold flex items-center gap-1.5 mb-0.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                        <span>Spend Qualification Criteria</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{card.benefits.domesticLounge.spendCriteria}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">{card.benefits.domesticLounge.details}</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span className="font-bold text-sm text-white">International Airport Lounge</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  card.benefits.internationalLounge.available ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30' : 'bg-white/[0.06] text-zinc-500'
                }`}>
                  {card.benefits.internationalLounge.available ? 'Complimentary' : 'None'}
                </span>
              </div>

              {card.benefits.internationalLounge.available ? (
                <div className="space-y-2 text-xs">
                  <div className="text-zinc-200">
                    <strong>Program:</strong> {card.benefits.internationalLounge.program || 'Priority Pass / DreamFolks'}
                  </div>
                  <div className="text-zinc-200">
                    <strong>Free Visits:</strong> <span className="tabular-num">{card.benefits.internationalLounge.countPerYear}</span> visits per calendar year
                  </div>
                  <p className="text-zinc-400 leading-relaxed">{card.benefits.internationalLounge.details}</p>
                </div>
              ) : (
                <p className="text-xs text-zinc-400">{card.benefits.internationalLounge.details}</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MILESTONES & FEES */}
        {activeTab === 'milestones' && (
          <div className="space-y-4" role="tabpanel">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-white mb-2">
                <Gift className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Annual Fee & Spend Waiver</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Annual / Renewal Fee:</span>
                  <span className="font-bold text-white text-sm tabular-num">{card.benefits.annualFee.amount}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Fee Waiver Threshold:</span>
                  <span className="font-bold text-amber-300 text-sm tabular-num">{card.benefits.annualFee.waiverSpend}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-white mb-1.5">
                <Fuel className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Fuel Surcharge Waiver</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{card.benefits.fuelSurchargeWaiver.details}</p>
            </div>

            {card.benefits.milestones && card.benefits.milestones.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                  Milestone Targets & Vouchers
                </h4>
                <div className="space-y-2">
                  {card.benefits.milestones.map((ms, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 mr-2">
                          {ms.timeframe}
                        </span>
                        <span className="font-bold text-white tabular-num">Spend {ms.spendAmount}</span>
                        <div className="text-zinc-400 mt-1">{ms.reward}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BILLING CYCLE & FLOAT */}
        {activeTab === 'billing' && (
          <div className="space-y-4" role="tabpanel">
            <div className="p-4 rounded-2xl bg-amber-400/[0.08] border border-amber-400/25 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Current Float Status</span>
                </span>
                <span className="font-black text-amber-300 text-base tabular-num">
                  {calc.floatDaysIfSpentToday} Days Free
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                If you make a purchase with this card today, you will not have to pay for it until{' '}
                <strong className="text-white">{formatDate(calc.nextDueDate)}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-zinc-400 block mb-1">Monthly Statement Day:</span>
                <span className="font-bold text-white text-sm tabular-num">{card.statementDay}th of every month</span>
                <span className="text-[11px] text-amber-300 block mt-1 tabular-num">
                  Next cut: {formatDate(calc.nextStatementDate)} ({calc.daysUntilStatement} days away)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-zinc-400 block mb-1">Payment Grace Period:</span>
                <span className="font-bold text-white text-sm tabular-num">+{card.dueDaysAfterStatement} days after statement</span>
                <span className="text-[11px] text-rose-300 block mt-1 tabular-num">
                  Next bill due: {formatDate(calc.nextDueDate)} ({calc.daysUntilDue} days away)
                </span>
              </div>
            </div>

            {card.creditLimit && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
                <span className="text-zinc-400 block mb-1">Tracked Credit Limit:</span>
                <span className="font-bold text-white text-sm tabular-num">₹{card.creditLimit.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500">
          <span>
            {card.lastBenefitsFetch ? `Benefits updated: ${new Date(card.lastBenefitsFetch).toLocaleDateString()}` : 'Default catalog benefits'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
