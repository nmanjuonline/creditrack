import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { CreditCard } from './types/card';
import { getStorage, resetStorageCache } from './storage';
import { fetchCardBenefits } from './services/aiBenefitService';
import { getActiveAlerts, type AlertItem } from './services/notificationService';
import { CARD_CATALOG } from './data/cardCatalog';
import { CONFIG } from './config';

// Components
import { Navbar } from './components/Navbar';
import { SmartFloatBanner } from './components/SmartFloatBanner';
import { BenefitFilterBar, type BenefitQuickFilter, type CardSortOption } from './components/BenefitFilterBar';
import { CardList } from './components/CardList';
import { BillingCalendar } from './components/BillingCalendar';
import { CardModal } from './components/CardModal';
import { CardDetailModal } from './components/CardDetailModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [activeTab, setActiveTab] = useState<'cards' | 'calendar' | 'float'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<BenefitQuickFilter>('all');
  const [sortOption, setSortOption] = useState<CardSortOption>('float_desc');

  // Online / Offline State
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<CreditCard | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [refreshingCardId, setRefreshingCardId] = useState<string | null>(null);
  const [isTursoConnected, setIsTursoConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize and load cards using pluggable storage adapter
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const storage = getStorage();
      try {
        const loaded = await storage.cards.getAll();
        if (isMounted) {
          setCards(loaded);
          setIsTursoConnected(storage.name === 'turso');
        }
      } catch (e) {
        console.warn('Storage read failed, falling back to empty state:', e);
        if (isMounted) {
          setIsTursoConnected(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Cards Memo
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inBank = card.bankName.toLowerCase().includes(q);
        const inName = card.cardName.toLowerCase().includes(q);
        const inAlias = card.cardAlias?.toLowerCase().includes(q) || false;
        const inPerks = card.benefits.allPerks?.some(p => 
          p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.highlight?.toLowerCase().includes(q)
        ) || false;
        const inSummary = card.benefits.summaryPoints?.some(s => s.toLowerCase().includes(q)) || false;
        const inCashback = card.benefits.cashbackHighlights?.some(c => 
          c.category.toLowerCase().includes(q) || c.rate.toLowerCase().includes(q)
        ) || false;
        const inLounge = card.benefits.domesticLounge.details.toLowerCase().includes(q) || 
                         card.benefits.internationalLounge.details.toLowerCase().includes(q);

        if (!inBank && !inName && !inAlias && !inPerks && !inSummary && !inCashback && !inLounge) {
          return false;
        }
      }

      if (activeFilter === 'lounge') {
        return card.benefits.domesticLounge.available || card.benefits.internationalLounge.available;
      }
      if (activeFilter === 'cashback') {
        return (card.benefits.cashbackHighlights && card.benefits.cashbackHighlights.length > 0) || card.benefits.rewardRate.basePercent >= 1.5;
      }
      if (activeFilter === 'milestone') {
        return card.benefits.milestones && card.benefits.milestones.length > 0;
      }
      if (activeFilter === 'fuel') {
        return card.benefits.fuelSurchargeWaiver.available;
      }
      if (activeFilter === 'forex') {
        return card.benefits.forexMarkup.ratePercent <= 2.0;
      }
      if (activeFilter === 'upi') {
        return card.benefits.isRupayUPI || card.cardNetwork === 'rupay';
      }
      if (activeFilter === 'dining') {
        return card.benefits.allPerks?.some(p => p.category === 'dining') ||
               card.benefits.cashbackHighlights?.some(c => c.category.toLowerCase().includes('dining') || c.category.toLowerCase().includes('swiggy') || c.category.toLowerCase().includes('zomato'));
      }
      if (activeFilter === 'movies') {
        return card.benefits.allPerks?.some(p => p.category === 'movies') ||
               card.benefits.cashbackHighlights?.some(c => c.category.toLowerCase().includes('movie') || c.category.toLowerCase().includes('bookmyshow'));
      }

      return true;
    });
  }, [cards, searchQuery, activeFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  // Billing Alerts
  const alerts = useMemo<AlertItem[]>(() => {
    return getActiveAlerts(cards);
  }, [cards]);

  // Save Card (Add or Edit)
  const handleSaveCard = async (cardData: Partial<CreditCard>) => {
    const isEdit = Boolean(editingCard);
    const cardId = editingCard ? editingCard.id : `card_${Date.now()}`;

    // 1. Fetch latest benefits (AI or Catalog)
    const { benefits } = await fetchCardBenefits(
      cardData.bankName || '',
      cardData.cardName || '',
      true
    );

    const updatedCard: CreditCard = {
      id: cardId,
      bankName: cardData.bankName!,
      cardName: cardData.cardName!,
      cardNetwork: cardData.cardNetwork || 'visa',
      statementDay: cardData.statementDay || 15,
      dueDaysAfterStatement: cardData.dueDaysAfterStatement || CONFIG.LIMITS.DEFAULT_STATEMENT_GRACE_DAYS,
      specificDueDay: cardData.specificDueDay,
      cardAlias: cardData.cardAlias,
      creditLimit: cardData.creditLimit,
      cardColor: cardData.cardColor,
      notes: cardData.notes,
      isFavorite: editingCard?.isFavorite || false,
      benefits: benefits,
      lastBenefitsFetch: new Date().toISOString(),
      isAiFetched: true,
      createdAt: editingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newCards: CreditCard[];
    if (isEdit) {
      newCards = cards.map(c => c.id === cardId ? updatedCard : c);
    } else {
      newCards = [updatedCard, ...cards];
    }

    setCards(newCards);

    // Save via storage adapter
    const storage = getStorage();
    try {
      await storage.cards.save(updatedCard);
    } catch (e) {
      console.warn('Could not persist to primary storage:', e);
    }
  };

  // Delete Card
  const handleDeleteCard = async (id: string) => {
    const card = cards.find(c => c.id === id);
    if (!window.confirm(`Are you sure you want to remove ${card?.bankName} ${card?.cardName}?`)) {
      return;
    }

    const newCards = cards.filter(c => c.id !== id);
    setCards(newCards);

    const storage = getStorage();
    try {
      await storage.cards.delete(id);
    } catch (e) {
      console.warn('Could not delete from primary storage:', e);
    }
  };

  // Refresh Benefits for a specific card
  const handleRefreshBenefits = async (card: CreditCard) => {
    setRefreshingCardId(card.id);
    try {
      const { benefits, message } = await fetchCardBenefits(card.bankName, card.cardName, true);
      const updatedCard: CreditCard = {
        ...card,
        benefits,
        lastBenefitsFetch: new Date().toISOString(),
        isAiFetched: true,
        updatedAt: new Date().toISOString(),
      };

      const newCards = cards.map(c => c.id === card.id ? updatedCard : c);
      setCards(newCards);

      if (selectedCardForDetail?.id === card.id) {
        setSelectedCardForDetail(updatedCard);
      }

      const storage = getStorage();
      await storage.cards.save(updatedCard);
      if (message) console.log(message);
    } catch (err) {
      console.error('Failed refreshing benefits:', err);
    } finally {
      setRefreshingCardId(null);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (card: CreditCard) => {
    const updatedCard: CreditCard = {
      ...card,
      isFavorite: !card.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    const newCards = cards.map(c => c.id === card.id ? updatedCard : c);
    setCards(newCards);

    const storage = getStorage();
    await storage.cards.save(updatedCard);
  };

  // Load Sample Cards
  const handleLoadSampleCards = async () => {
    const sampleCards: CreditCard[] = CARD_CATALOG.slice(0, 7).map((item, idx) => ({
      id: `sample_${idx + 1}`,
      bankName: item.bankName,
      cardName: item.cardName,
      cardNetwork: item.network,
      statementDay: item.defaultStatementDay,
      dueDaysAfterStatement: item.defaultGraceDays,
      cardColor: item.suggestedColor,
      isFavorite: idx === 0,
      benefits: item.benefits,
      lastBenefitsFetch: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setCards(sampleCards);

    const storage = getStorage();
    await storage.cards.saveBatch(sampleCards);
  };

  // Sync with Turso
  const handleSyncWithTurso = async () => {
    resetStorageCache();
    const storage = getStorage();
    try {
      const remote = await storage.cards.getAll();
      if (remote.length > 0) {
        setCards(remote);
        setIsTursoConnected(true);
      } else if (cards.length > 0) {
        await storage.cards.saveBatch(cards);
        setIsTursoConnected(true);
      }
    } catch (err) {
      console.error('Turso sync error:', err);
      setIsTursoConnected(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onAddCard={() => {
          setEditingCard(null);
          setIsCardModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTursoConnected={isTursoConnected}
        alerts={alerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
      />

      {/* Main Landmark for Accessibility */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none" tabIndex={-1}>
        {/* VIEW 1: CARDS & BENEFIT SEARCH */}
        {activeTab === 'cards' && (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-400 gap-3" role="status" aria-live="polite">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span className="text-sm font-medium">Loading your credit cards...</span>
              </div>
            ) : (
              <>
                {cards.length > 0 && (
                  <SmartFloatBanner
                    cards={cards}
                    onSelectCard={(c) => setSelectedCardForDetail(c)}
                  />
                )}

                <BenefitFilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  totalCardsCount={cards.length}
                  filteredCount={filteredCards.length}
                />

                <CardList
                  cards={filteredCards}
                  totalCardsCount={cards.length}
                  searchQuery={searchQuery}
                  activeFilter={activeFilter}
                  sortOption={sortOption}
                  onClearFilters={handleClearFilters}
                  onAddCard={() => {
                    setEditingCard(null);
                    setIsCardModalOpen(true);
                  }}
                  onLoadSamples={handleLoadSampleCards}
                  onViewBenefits={(c) => setSelectedCardForDetail(c)}
                  onEditCard={(c) => {
                    setEditingCard(c);
                    setIsCardModalOpen(true);
                  }}
                  onDeleteCard={handleDeleteCard}
                  onRefreshBenefits={handleRefreshBenefits}
                  onToggleFavorite={handleToggleFavorite}
                  refreshingCardId={refreshingCardId}
                />
              </>
            )}
          </div>
        )}

        {/* VIEW 2: SMART FLOAT MAXIMIZER STANDALONE */}
        {activeTab === 'float' && (
          <div className="space-y-6">
            <SmartFloatBanner
              cards={cards}
              onSelectCard={(c) => setSelectedCardForDetail(c)}
            />

            <div className="glass-panel rounded-3xl p-6 shadow-xl" role="region" aria-label="Float Optimization Explainer">
              <h3 className="font-bold text-white text-base mb-2">How Does Float Optimization Work?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Credit card issuers provide a grace period (typically 18–25 days) after your statement generation date before your bill is due.
                When you make a purchase <strong>immediately following your statement cut date</strong>, you receive almost an entire month before that purchase is even billed, plus the full grace period — giving you <strong>45 to 52 days of completely interest-free money!</strong>
              </p>
            </div>
          </div>
        )}

        {/* VIEW 3: BILLING CALENDAR */}
        {activeTab === 'calendar' && (
          <BillingCalendar
            cards={cards}
            onSelectCard={(c) => setSelectedCardForDetail(c)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12 bg-slate-950/60 backdrop-blur-xl text-xs text-slate-400 text-center" role="contentinfo">
        <p>CrediTrack PWA • 100% Private (No card numbers or CVVs stored) • Turso Edge Sync • AI Benefits Engine</p>
      </footer>

      {/* Add / Edit Card Modal */}
      <CardModal
        key={isCardModalOpen ? (editingCard ? editingCard.id : 'new-card') : 'closed-card-modal'}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
      />

      {/* Card Benefits Detail Modal */}
      <CardDetailModal
        card={selectedCardForDetail}
        isOpen={Boolean(selectedCardForDetail)}
        onClose={() => setSelectedCardForDetail(null)}
        onRefreshBenefits={handleRefreshBenefits}
        isRefreshing={refreshingCardId === selectedCardForDetail?.id}
      />

      {/* Settings Modal */}
      <SettingsModal
        key={isSettingsOpen ? 'open-settings-modal' : 'closed-settings-modal'}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cards={cards}
        onImportCards={(imported) => {
          setCards(imported);
          const storage = getStorage();
          storage.cards.saveBatch(imported);
        }}
        onLoadSampleCards={handleLoadSampleCards}
        onSyncWithTurso={handleSyncWithTurso}
        isTursoConnected={isTursoConnected}
      />
    </div>
  );
};

export default App;
