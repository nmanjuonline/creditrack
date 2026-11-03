import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { CreditCard, CardNetwork } from '../types/card';
import { POPULAR_BANKS, CARD_CATALOG, findInCatalog } from '../data/cardCatalog';
import { X, Sparkles, Info, Check } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Partial<CreditCard> & { autoFetchBenefits?: boolean }) => Promise<void>;
  editingCard?: CreditCard | null;
}

const COLOR_OPTIONS = [
  { id: 'from-slate-900 via-gray-900 to-zinc-800', label: 'Dark Titanium' },
  { id: 'from-blue-950 via-slate-900 to-indigo-950', label: 'Royal Sapphire' },
  { id: 'from-amber-900 via-yellow-950 to-stone-900', label: 'Imperial Gold' },
  { id: 'from-orange-900 via-amber-950 to-stone-900', label: 'Copper Bronze' },
  { id: 'from-rose-950 via-red-950 to-neutral-900', label: 'Ruby Crimson' },
  { id: 'from-emerald-950 via-teal-950 to-slate-900', label: 'Emerald Jade' },
  { id: 'from-purple-950 via-fuchsia-950 to-neutral-900', label: 'Amethyst Violet' },
  { id: 'from-slate-500 via-gray-600 to-zinc-900', label: 'Platinum Silver' },
];

function getCreditLimitWords(amountStr: string): string | null {
  const clean = amountStr.replace(/,/g, '').trim();
  if (!clean) return null;
  const num = parseInt(clean, 10);
  if (isNaN(num) || num <= 0) return null;

  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  if (num >= 1000) {
    const thousand = num / 1000;
    return `₹${thousand % 1 === 0 ? thousand : thousand.toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCard,
}) => {
  const [bankName, setBankName] = useState(editingCard?.bankName || '');
  const [cardName, setCardName] = useState(editingCard?.cardName || '');
  const [cardNetwork, setCardNetwork] = useState<CardNetwork>(editingCard?.cardNetwork || 'visa');
  const [statementDay, setStatementDay] = useState<number>(editingCard?.statementDay || 15);
  const [dueDaysAfterStatement, setDueDaysAfterStatement] = useState<number>(editingCard?.dueDaysAfterStatement || 20);
  const [specificDueDay, setSpecificDueDay] = useState<string>(editingCard?.specificDueDay ? String(editingCard.specificDueDay) : '');
  const [cardAlias, setCardAlias] = useState(editingCard?.cardAlias || '');
  const [creditLimit, setCreditLimit] = useState<string>(editingCard?.creditLimit ? editingCard.creditLimit.toLocaleString('en-IN') : '');
  const [cardColor, setCardColor] = useState(editingCard?.cardColor || COLOR_OPTIONS[0].id);
  const [notes, setNotes] = useState(editingCard?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFetchBenefits, setAutoFetchBenefits] = useState(!editingCard);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);
  const bankContainerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const [prevCardId, setPrevCardId] = useState<string | undefined>(editingCard?.id);

  // Adjust form fields during render when editingCard changes (official React recommended pattern)
  if (editingCard?.id !== prevCardId) {
    setPrevCardId(editingCard?.id);
    if (editingCard) {
      setBankName(editingCard.bankName);
      setCardName(editingCard.cardName);
      setCardNetwork(editingCard.cardNetwork);
      setStatementDay(editingCard.statementDay);
      setDueDaysAfterStatement(editingCard.dueDaysAfterStatement);
      setSpecificDueDay(editingCard.specificDueDay ? String(editingCard.specificDueDay) : '');
      setCardAlias(editingCard.cardAlias || '');
      setCreditLimit(editingCard.creditLimit ? editingCard.creditLimit.toLocaleString('en-IN') : '');
      setCardColor(editingCard.cardColor || COLOR_OPTIONS[0].id);
      setNotes(editingCard.notes || '');
      setAutoFetchBenefits(false); // Retain existing perks instantly when editing
    } else {
      setBankName('');
      setCardName('');
      setCardNetwork('visa');
      setStatementDay(15);
      setDueDaysAfterStatement(20);
      setSpecificDueDay('');
      setCardAlias('');
      setCreditLimit('');
      setCardColor(COLOR_OPTIONS[0].id);
      setNotes('');
      setAutoFetchBenefits(true); // Default to fetching perks for new cards
    }
  }

  // Close custom dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (bankContainerRef.current && !bankContainerRef.current.contains(e.target as Node)) {
        setIsBankDropdownOpen(false);
      }
      if (cardContainerRef.current && !cardContainerRef.current.contains(e.target as Node)) {
        setIsCardDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle Escape key dismissal
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

  if (!isOpen) return null;

  const handleBankSelect = (selectedBank: string) => {
    setBankName(selectedBank);
  };

  const handleCardNameSelect = (name: string) => {
    setCardName(name);
    const match = findInCatalog(bankName, name);
    if (match) {
      setCardNetwork(match.network);
      setCardColor(match.suggestedColor);
      setStatementDay(match.defaultStatementDay);
      setDueDaysAfterStatement(match.defaultGraceDays);
    }
  };

  const cardSuggestions = CARD_CATALOG.filter(c => 
    !bankName || c.bankName.toLowerCase().includes(bankName.toLowerCase()) || bankName.toLowerCase().includes(c.bankName.toLowerCase())
  );

  const filteredBanks = POPULAR_BANKS.filter(b => 
    !bankName.trim() || b.toLowerCase().includes(bankName.toLowerCase().trim())
  );

  const matchingCards = cardSuggestions.filter(c => 
    !cardName.trim() || c.cardName.toLowerCase().includes(cardName.toLowerCase().trim())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !cardName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        bankName: bankName.trim(),
        cardName: cardName.trim(),
        cardNetwork,
        statementDay: Number(statementDay),
        dueDaysAfterStatement: Number(dueDaysAfterStatement),
        specificDueDay: specificDueDay ? Number(specificDueDay) : undefined,
        cardAlias: cardAlias.trim() || undefined,
        creditLimit: creditLimit ? Number(creditLimit.replace(/,/g, '').trim()) : undefined,
        cardColor,
        notes: notes.trim() || undefined,
        autoFetchBenefits,
      });
      onClose();
    } catch (err) {
      console.error('Error saving card:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      onClick={onClose}
    >
      <div 
        className="relative w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 my-0 sm:my-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* iOS Drag Handle indicator on mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto sm:hidden mb-4" aria-hidden="true" />

        {/* Close Button with >= 44x44px touch target */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{editingCard ? 'Modify Card Details' : 'Track New Credit Card'}</span>
          </div>
          <h2 id="card-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight">
            {editingCard ? 'Edit Card Details' : 'Track a New Card'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            No card numbers or CVVs needed. Simply provide the provider and card name to track billing cycles and auto-fetch benefits.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bank / Provider Selection */}
          <div ref={bankContainerRef} className="relative">
            <label htmlFor="card-bank-input" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Card Provider / Bank *
            </label>
            <input
              id="card-bank-input"
              ref={firstInputRef}
              type="text"
              autoComplete="off"
              value={bankName}
              onFocus={() => setIsBankDropdownOpen(true)}
              onChange={e => {
                handleBankSelect(e.target.value);
                setIsBankDropdownOpen(true);
              }}
              placeholder="e.g. HDFC Bank, ICICI Bank, SBI Card, American Express..."
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:outline-none transition-all min-h-[44px]"
            />

            {/* Apple-Style Custom Bank Dropdown */}
            {isBankDropdownOpen && filteredBanks.length > 0 && (
              <div 
                className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto bg-[#12151e]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-1.5 space-y-0.5 no-scrollbar animate-in fade-in zoom-in-95 duration-100"
                role="listbox"
                aria-label="Popular Banks"
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Select Provider
                </div>
                {filteredBanks.map(bank => {
                  const isSelected = bankName.toLowerCase() === bank.toLowerCase();
                  return (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => {
                        handleBankSelect(bank);
                        setIsBankDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left transition-colors min-h-[40px] ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-200 font-semibold'
                          : 'text-slate-200 hover:bg-white/[0.08] hover:text-white'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{bank}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Name / Type Selection */}
          <div ref={cardContainerRef} className="relative">
            <label htmlFor="card-name-input" className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Card Name / Model *
            </label>
            <input
              id="card-name-input"
              type="text"
              autoComplete="off"
              value={cardName}
              onFocus={() => setIsCardDropdownOpen(true)}
              onChange={e => {
                handleCardNameSelect(e.target.value);
                setIsCardDropdownOpen(true);
              }}
              placeholder="e.g. Regalia Gold, Infinia Metal, Amazon Pay, Platinum Travel..."
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:outline-none transition-all min-h-[44px]"
            />

            {/* Apple-Style Custom Card Suggestions Dropdown */}
            {isCardDropdownOpen && matchingCards.length > 0 && (
              <div 
                className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto bg-[#12151e]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-1.5 space-y-0.5 no-scrollbar animate-in fade-in zoom-in-95 duration-100"
                role="listbox"
                aria-label="Card Suggestions"
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Catalog Matches {bankName ? `(${bankName})` : ''}
                </div>
                {matchingCards.map(card => {
                  const isSelected = cardName.toLowerCase() === card.cardName.toLowerCase();
                  return (
                    <button
                      key={`${card.bankName}-${card.cardName}`}
                      type="button"
                      onClick={() => {
                        handleCardNameSelect(card.cardName);
                        setIsCardDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left transition-colors min-h-[44px] ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-200 font-semibold'
                          : 'text-slate-200 hover:bg-white/[0.08] hover:text-white'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div>
                        <div className="font-semibold text-white">{card.cardName}</div>
                        <div className="text-[10px] text-slate-400">{card.bankName} • {card.network.toUpperCase()}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Network Selector */}
          <div>
            <span className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Card Network
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Card network selection">
              {(['visa', 'mastercard', 'rupay', 'amex', 'diners'] as CardNetwork[]).map(net => {
                const isSelected = cardNetwork === net;
                return (
                  <button
                    type="button"
                    key={net}
                    onClick={() => setCardNetwork(net)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-150 active:scale-95 border min-h-[44px] flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-sm font-bold ring-1 ring-amber-400/30'
                        : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:border-white/20 hover:text-white'
                    }`}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <span>{net}</span>
                  </button>
                );
              })}
            </div>
            {cardNetwork === 'rupay' && (
              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                RuPay card detected: UPI scan-and-pay enabled.
              </p>
            )}
          </div>

          {/* Billing Cycle Details */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Billing Cycle Configuration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Statement Cut Day */}
              <div>
                <label htmlFor="statement-day-input" className="block text-[11px] font-semibold text-zinc-200 mb-1">
                  Statement Date (Day of Month) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="statement-day-input"
                    type="number"
                    min="1"
                    max="31"
                    value={statementDay}
                    onChange={e => setStatementDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none min-h-[44px] tabular-num"
                  />
                  <span className="text-xs text-zinc-300 font-medium whitespace-nowrap">th of month</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">The day each month your bill cuts</p>
              </div>

              {/* Grace Period / Payment Due */}
              <div>
                <label htmlFor="grace-days-input" className="block text-[11px] font-semibold text-zinc-200 mb-1">
                  Grace Period (Days to Pay) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="grace-days-input"
                    type="number"
                    min="10"
                    max="30"
                    value={dueDaysAfterStatement}
                    onChange={e => setDueDaysAfterStatement(Math.max(5, Math.min(40, parseInt(e.target.value) || 20)))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none min-h-[44px] tabular-num"
                  />
                  <span className="text-xs text-zinc-300 font-medium whitespace-nowrap">days after bill</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">Usually 18 to 25 days</p>
              </div>
            </div>
          </div>

          {/* Optional Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="card-alias-input" className="block text-xs font-semibold text-zinc-200 mb-1">
                Nickname / Alias (Optional)
              </label>
              <input
                id="card-alias-input"
                type="text"
                value={cardAlias}
                onChange={e => setCardAlias(e.target.value)}
                placeholder="e.g. Travel Card"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="credit-limit-input" className="block text-xs font-semibold text-zinc-200">
                  Credit Limit (Optional)
                </label>
                {creditLimit && getCreditLimitWords(creditLimit) && (
                  <span className="text-[10px] font-semibold text-amber-300 tabular-num">
                    {getCreditLimitWords(creditLimit)}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 select-none pointer-events-none">
                  ₹
                </span>
                <input
                  id="credit-limit-input"
                  type="text"
                  inputMode="numeric"
                  value={creditLimit}
                  onChange={(e) => {
                    const rawDigits = e.target.value.replace(/\D/g, '');
                    if (!rawDigits) {
                      setCreditLimit('');
                    } else {
                      const num = parseInt(rawDigits, 10);
                      setCreditLimit(isNaN(num) ? '' : num.toLocaleString('en-IN'));
                    }
                  }}
                  placeholder="e.g. 5,00,000"
                  className="w-full pl-6.5 pr-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none min-h-[44px] tabular-num font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specific-due-day-input" className="block text-xs font-semibold text-zinc-200 mb-1">
                Fixed Due Day (Optional)
              </label>
              <input
                id="specific-due-day-input"
                type="number"
                min="1"
                max="31"
                value={specificDueDay}
                onChange={e => setSpecificDueDay(e.target.value)}
                placeholder="e.g. 5th of month"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none min-h-[44px] tabular-num"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="card-notes-input" className="block text-xs font-semibold text-zinc-200 mb-1">
              Personal Notes &amp; Reminders (Optional)
            </label>
            <input
              id="card-notes-input"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Annual fee waiver target: ₹3L spend; Primary card for airport lounge"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Card Visual Finish */}
          <div>
            <span className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Card Visual Finish
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="radiogroup" aria-label="Card color finish">
              {COLOR_OPTIONS.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCardColor(c.id)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.id} border-2 transition-all shrink-0 min-h-[32px] min-w-[32px] ${
                    cardColor === c.id ? 'border-amber-400 scale-110 shadow-lg ring-2 ring-amber-400/40' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                  aria-label={c.label}
                  role="radio"
                  aria-checked={cardColor === c.id}
                />
              ))}
            </div>
          </div>

          {/* Auto-Fetch Benefits Option */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="flex items-center gap-2.5 pr-2">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Auto-fetch perks &amp; lounge rules</div>
                <div className="text-[11px] text-zinc-400 leading-tight">
                  {autoFetchBenefits
                    ? 'Retrieves airport lounge access, cashback rates & fees'
                    : 'Instant save using local catalog / preserves current perks'}
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoFetchBenefits}
              onClick={() => setAutoFetchBenefits(!autoFetchBenefits)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoFetchBenefits ? 'bg-amber-400' : 'bg-white/10'
              }`}
              aria-label="Toggle auto-fetch perks and lounge rules"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  autoFetchBenefits ? 'translate-x-5 !bg-black' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 font-medium text-xs transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isSubmitting
                  ? (autoFetchBenefits ? 'Saving & Fetching Perks...' : 'Saving Card...')
                  : autoFetchBenefits
                  ? (editingCard ? 'Update & Fetch Perks' : 'Save & Fetch Perks')
                  : (editingCard ? 'Update Card' : 'Save Card')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
