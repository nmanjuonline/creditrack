import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Plane, 
  Percent, 
  Gift, 
  QrCode, 
  Globe, 
  Utensils, 
  Fuel, 
  Film, 
  ChevronDown,
  Check,
  CreditCard
} from 'lucide-react';

export type BenefitQuickFilter = 
  | 'all'
  | 'lounge'
  | 'cashback'
  | 'milestone'
  | 'fuel'
  | 'forex'
  | 'upi'
  | 'dining'
  | 'movies';

export type CardSortOption = 
  | 'float_desc'
  | 'statement_asc'
  | 'due_asc'
  | 'reward_desc'
  | 'name_asc';

interface BenefitFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: BenefitQuickFilter;
  setActiveFilter: (filter: BenefitQuickFilter) => void;
  sortOption: CardSortOption;
  setSortOption: (sort: CardSortOption) => void;
  totalCardsCount: number;
  filteredCount: number;
}

const FILTER_PILLS: { id: BenefitQuickFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Perks', icon: <CreditCard className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'lounge', label: 'Airport Lounge', icon: <Plane className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'cashback', label: 'Cashback & Returns', icon: <Percent className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'milestone', label: 'Milestones', icon: <Gift className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'upi', label: 'RuPay UPI', icon: <QrCode className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'forex', label: 'Low Forex Fee', icon: <Globe className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'dining', label: 'Dining', icon: <Utensils className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'fuel', label: 'Fuel Surcharge', icon: <Fuel className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'movies', label: 'Movies & Events', icon: <Film className="w-3.5 h-3.5" aria-hidden="true" /> },
];

const SORT_OPTIONS: { id: CardSortOption; label: string }[] = [
  { id: 'float_desc', label: 'Longest Float Runway' },
  { id: 'statement_asc', label: 'Earliest Statement Cut' },
  { id: 'due_asc', label: 'Payment Due Soonest' },
  { id: 'reward_desc', label: 'Highest Base Reward %' },
  { id: 'name_asc', label: 'Card Name (A-Z)' },
];

export const BenefitFilterBar: React.FC<BenefitFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  sortOption,
  setSortOption,
  totalCardsCount,
  filteredCount,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortOption)?.label || 'Sort Cards';
  return (
    <div className="space-y-3.5 mb-6">
      {/* Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search perks: 'Priority Pass', 'Swiggy', 'Zomato', '5%', 'Golf', 'BOGO'..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Apple-Style Custom Sort Menu */}
        <div ref={sortRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-medium text-zinc-300 hover:text-white border border-white/10 shadow-sm transition-colors min-h-[40px]"
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            aria-label={`Sort by: ${currentSortLabel}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Sort:</span>
            <span className="text-white font-medium">{currentSortLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortOpen && (
            <div 
              className="absolute right-0 mt-1.5 w-56 bg-[#12151e]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-1.5 space-y-0.5 z-40 animate-in fade-in zoom-in-95 duration-100"
              role="listbox"
              aria-label="Sort options"
            >
              <div className="px-3 py-1 text-[11px] font-medium text-zinc-400">
                Sort cards by
              </div>
              {SORT_OPTIONS.map(opt => {
                const isSelected = sortOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortOption(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors min-h-[38px] ${
                      isSelected
                        ? 'bg-amber-400/15 text-amber-200 font-medium'
                        : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Benefit Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
        {FILTER_PILLS.map(pill => (
          <button
            key={pill.id}
            onClick={() => setActiveFilter(pill.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
              activeFilter === pill.id
                ? 'bg-amber-400/15 text-amber-200 border border-amber-400/30 shadow-sm'
                : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
            }`}
          >
            {pill.icon}
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* Count Indicator */}
      {(searchQuery || activeFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pt-0.5">
          <span>
            Showing <strong className="text-white tabular-num">{filteredCount}</strong> of <span className="tabular-num">{totalCardsCount}</span> cards matching filter
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
