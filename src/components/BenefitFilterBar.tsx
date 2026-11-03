import React from 'react';
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
  Sparkles 
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
  { id: 'all', label: 'All Perks', icon: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'lounge', label: 'Airport Lounge', icon: <Plane className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'cashback', label: 'Cashback & Returns', icon: <Percent className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'milestone', label: 'Milestones', icon: <Gift className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'upi', label: 'RuPay UPI', icon: <QrCode className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'forex', label: 'Low Forex Fee', icon: <Globe className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'dining', label: 'Dining', icon: <Utensils className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'fuel', label: 'Fuel Surcharge', icon: <Fuel className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'movies', label: 'Movies & Events', icon: <Film className="w-3.5 h-3.5" aria-hidden="true" /> },
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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl glass-panel text-xs text-zinc-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-zinc-400">Sort:</span>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as CardSortOption)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="float_desc" className="bg-[#0c0f16] text-white">Longest Float Runway</option>
              <option value="statement_asc" className="bg-[#0c0f16] text-white">Earliest Statement Cut</option>
              <option value="due_asc" className="bg-[#0c0f16] text-white">Payment Due Soonest</option>
              <option value="reward_desc" className="bg-[#0c0f16] text-white">Highest Base Reward %</option>
              <option value="name_asc" className="bg-[#0c0f16] text-white">Card Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Benefit Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
        {FILTER_PILLS.map(pill => (
          <button
            key={pill.id}
            onClick={() => setActiveFilter(pill.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === pill.id
                ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                : 'glass-pill text-zinc-400 hover:text-zinc-200'
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
