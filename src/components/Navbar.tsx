import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard as CardIcon, 
  Plus, 
  Settings, 
  Bell, 
  Cloud, 
  CloudOff, 
  Download, 
  Calendar as CalendarIcon, 
  LayoutGrid,
  WifiOff,
  X
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

  // Dismiss notification center on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowNotificationMenu(false);
    }
  }, []);

  useEffect(() => {
    if (!showNotificationMenu) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNotificationMenu, handleKeyDown]);

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
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-400 shadow-sm"
              aria-hidden="true"
            >
              <CardIcon className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-white tracking-tight">{CONFIG.APP.NAME}</span>
              
              {/* Only show indicator if offline — clean, unobtrusive Apple convention */}
              {!isOnline && (
                <span 
                  className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 backdrop-blur-md"
                  title="Offline mode: local cache active"
                  role="status"
                  aria-live="polite"
                >
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              )}
            </div>
          </div>

          {/* Segmented Control Navigation */}
          <nav className="hidden md:flex items-center bg-zinc-950/80 p-1 rounded-xl border border-white/[0.08]" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'cards'
                  ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'cards' ? 'page' : undefined}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cards & Perks</span>
            </button>
            <button
              onClick={() => setActiveTab('float')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'float'
                  ? 'bg-zinc-800 text-amber-300 border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'float' ? 'page' : undefined}
            >
              <CardIcon className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Best Card Today</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              aria-current={activeTab === 'calendar' ? 'page' : undefined}
            >
              <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Billing Calendar</span>
            </button>
          </nav>

          {/* Right Action Controls: Clean Apple Navigation */}
          <div className="flex items-center gap-2">
            {/* Install PWA Button: desktop only to preserve mobile clarity */}
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 border border-white/10 text-xs font-semibold rounded-full shadow-md transition-all"
                aria-label="Install CrediTrack App on your device"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Install</span>
              </button>
            )}

            {/* Turso Cloud Sync Status: desktop only to keep mobile header clean */}
            <button
              onClick={onOpenSettings}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
                isTursoConnected
                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/25 hover:bg-emerald-900/40'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
              }`}
              aria-label={isTursoConnected ? 'Turso Cloud Sync Active' : 'Local Storage Mode - Click to configure Turso'}
            >
              {isTursoConnected ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Turso Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Local Cache</span>
                </>
              )}
            </button>

            {/* Notification Center Bell */}
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.10] active:scale-95 text-slate-300 border border-white/[0.08] backdrop-blur-md relative transition-all flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label={`Billing cycle reminders: ${alerts.length} active`}
              aria-expanded={showNotificationMenu}
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {alerts.length > 0 && (
                <span className={`absolute top-0 right-0 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-slate-950 tabular-num ${
                  highUrgencyCount > 0 ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                }`}>
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.10] active:scale-95 text-slate-300 border border-white/[0.08] backdrop-blur-md transition-all flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Open Settings"
              title="Database & AI Settings"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Add Card Button (Elegant Champagne Gold) */}
            <button
              onClick={onAddCard}
              className="btn-gold flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 min-h-[44px]"
              aria-label="Add a new credit card"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add Card</span>
            </button>
          </div>
        </div>

      </div>
    </header>

    {/* Apple-Style Notification Center Popover (Rendered outside header to avoid backdrop-filter coordinate clipping) */}
    {showNotificationMenu && (
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end pt-18 sm:pt-20 px-4 sm:px-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-reminders-title"
      >
        {/* Backdrop for click-outside dismissal */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200" 
          onClick={() => setShowNotificationMenu(false)}
          aria-hidden="true"
        />

        {/* Dialog Card */}
        <div 
          className="relative w-full max-w-md sm:max-w-sm glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 z-10 animate-in fade-in slide-in-from-top-3 duration-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h2 id="billing-reminders-title" className="font-bold text-sm text-white">Billing Reminders</h2>
                <span className="text-[11px] text-slate-400 tabular-num">{alerts.length} active alert{alerts.length === 1 ? '' : 's'}</span>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationMenu(false)}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors min-h-[32px] min-w-[32px]"
              aria-label="Close billing reminders"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3.5 max-h-[60vh] sm:max-h-80 overflow-y-auto space-y-2.5 no-scrollbar pr-0.5">
            {alerts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-300 font-medium">All clear!</p>
                <p className="text-[11px] text-slate-500 mt-1">No payment deadlines or statements in the next 3 days.</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border text-xs backdrop-blur-sm transition-colors ${
                    alert.urgency === 'high'
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-200 shadow-sm shadow-rose-950/20'
                      : alert.urgency === 'medium'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-200 shadow-sm shadow-amber-950/20'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-white tracking-tight">{alert.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      alert.urgency === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : alert.urgency === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {alert.urgency === 'high' ? 'Urgent' : alert.urgency === 'medium' ? 'Soon' : 'Info'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed break-words text-[11.5px]">{alert.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Bottom action to view calendar */}
          {alerts.length > 0 && (
            <div className="pt-3 mt-3 border-t border-white/[0.08] flex items-center justify-end">
              <button
                onClick={() => {
                  setShowNotificationMenu(false);
                  setActiveTab('calendar');
                }}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-amber-400/10 min-h-[36px]"
              >
                <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>View Full Billing Calendar &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )}

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
            <CardIcon className="w-5 h-5" aria-hidden="true" />
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
