import React, { useState, useEffect } from 'react';
import { 
  CreditCard as CardIcon, 
  Plus, 
  Settings, 
  Bell, 
  Cloud, 
  CloudOff, 
  Download, 
  Calendar as CalendarIcon, 
  Sparkles,
  LayoutGrid,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { AlertItem } from '../services/notificationService';
import { CONFIG } from '../config';

interface NavbarProps {
  onAddCard: () => void;
  onOpenSettings: () => void;
  isTursoConnected: boolean;
  alerts: AlertItem[];
  activeTab: 'cards' | 'calendar' | 'float';
  setActiveTab: (tab: 'cards' | 'calendar' | 'float') => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAddCard,
  onOpenSettings,
  isTursoConnected,
  alerts,
  activeTab,
  setActiveTab,
  isOnline,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const highUrgencyCount = alerts.filter(a => a.urgency === 'high').length;

  return (
    <>
    <header className="sticky top-0 z-40 bg-[#08090d]/75 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand in Luxury Gold/Obsidian */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/40"
              aria-hidden="true"
            >
              <CardIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">{CONFIG.APP.NAME}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 backdrop-blur-md">PWA</span>
                
                {/* Live Online/Offline Status */}
                <span 
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                    isOnline 
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}
                  title={isOnline ? 'Internet connection active' : 'Offline mode: local cache active'}
                  role="status"
                  aria-live="polite"
                >
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Billing cycle & benefits intelligence</p>
            </div>
          </div>

          {/* iOS Segmented Control Navigation */}
          <nav className="hidden md:flex items-center bg-black/40 backdrop-blur-2xl p-1 rounded-full border border-white/[0.08]" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeTab === 'cards'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-200 shadow-sm border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'cards' ? 'page' : undefined}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cards & Perks</span>
            </button>
            <button
              onClick={() => setActiveTab('float')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeTab === 'float'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-200 shadow-sm border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'float' ? 'page' : undefined}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Best Card Today</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/20 text-amber-200 shadow-sm border border-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'calendar' ? 'page' : undefined}
            >
              <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Billing Calendar</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Install PWA Button */}
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 border border-white/10 text-xs font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
                aria-label="Install CrediTrack App on your device"
              >
                <Download className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {/* Turso Cloud Sync Status */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md transition-all min-h-[44px] ${
                isTursoConnected
                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/25 hover:bg-emerald-900/40'
                  : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-zinc-200'
              }`}
              aria-label={isTursoConnected ? 'Turso Cloud Sync Active' : 'Local Storage Mode - Click to configure Turso'}
            >
              {isTursoConnected ? (
                <>
                  <Cloud className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span className="hidden sm:inline">Turso Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span className="hidden sm:inline">Local Cache</span>
                </>
              )}
            </button>

            {/* Notification Center Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] backdrop-blur-md relative transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Billing cycle reminders: ${alerts.length} active`}
                aria-expanded={showNotificationMenu}
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {alerts.length > 0 && (
                  <span className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-slate-950 tabular-num ${
                    highUrgencyCount > 0 ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                  }`}>
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationMenu && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-3xl p-4 z-50 shadow-2xl"
                  role="region"
                  aria-label="Billing Reminders List"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" aria-hidden="true" />
                      <span className="font-semibold text-sm text-white">Billing Reminders</span>
                    </div>
                    <span className="text-xs text-zinc-400 tabular-num">{alerts.length} active</span>
                  </div>

                  <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-4">
                        All clear! No pending bill due dates or statements in the next 3 days.
                      </p>
                    ) : (
                      alerts.map(alert => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-2xl border text-xs backdrop-blur-sm ${
                            alert.urgency === 'high'
                              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                              : alert.urgency === 'medium'
                              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                              : 'bg-white/[0.04] border-white/[0.08] text-zinc-300'
                          }`}
                        >
                          <div className="font-semibold text-white mb-0.5">{alert.title}</div>
                          <p className="text-zinc-300 leading-relaxed">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Settings"
              title="Database & AI Settings"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Add Card Button (Elegant Champagne Gold) */}
            <button
              onClick={onAddCard}
              className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 min-h-[44px]"
              aria-label="Add a new credit card"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

      </div>
    </header>

    {/* iOS-Style Bottom Tab Bar for Mobile Thumb Ergonomics */}
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#08090d]/90 backdrop-blur-2xl border-t border-white/[0.08] pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.6)]" 
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around px-3 pt-2 pb-1">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all active:scale-95 min-h-[48px] ${
            activeTab === 'cards' ? 'text-amber-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-current={activeTab === 'cards' ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'cards' ? 'bg-amber-400/15' : ''}`}>
            <LayoutGrid className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('float')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all active:scale-95 min-h-[48px] ${
            activeTab === 'float' ? 'text-amber-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-current={activeTab === 'float' ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'float' ? 'bg-amber-400/15' : ''}`}>
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">Best Card</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all active:scale-95 min-h-[48px] ${
            activeTab === 'calendar' ? 'text-amber-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-current={activeTab === 'calendar' ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'calendar' ? 'bg-amber-400/15' : ''}`}>
            <CalendarIcon className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">Calendar</span>
        </button>
      </div>
    </nav>
  </>
  );
};
