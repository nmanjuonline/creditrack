import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Database, 
  AlertCircle, 
  Download, 
  Upload, 
  Bell, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  getStoredTursoConfig, 
  saveTursoConfig, 
  testTursoConnection 
} from '../services/tursoService';
import { getStoredGeminiKey, saveStoredGeminiKey } from '../services/aiBenefitService';
import { requestNotificationPermission, sendLocalNotification } from '../services/notificationService';
import type { CreditCard } from '../types/card';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  onImportCards: (cards: CreditCard[]) => void;
  onLoadSampleCards: () => void;
  onSyncWithTurso: () => Promise<void>;
  isTursoConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  cards,
  onImportCards,
  onLoadSampleCards,
  onSyncWithTurso,
  isTursoConnected,
}) => {
  const [tursoUrl, setTursoUrl] = useState(() => getStoredTursoConfig().databaseUrl);
  const [tursoToken, setTursoToken] = useState(() => getStoredTursoConfig().authToken);
  const [geminiKey, setGeminiKey] = useState(() => getStoredGeminiKey());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(() => 
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

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

  if (!isOpen) return null;

  const handleTestTurso = async () => {
    if (!tursoUrl || !tursoToken) {
      setTestResult({ success: false, message: 'Please enter both Database URL and Auth Token.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testTursoConnection(tursoUrl, tursoToken);
      setTestResult(res);
      if (res.success) {
        saveTursoConfig({
          databaseUrl: tursoUrl.trim(),
          authToken: tursoToken.trim(),
          autoSync: true,
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAll = async () => {
    saveTursoConfig({
      databaseUrl: tursoUrl.trim(),
      authToken: tursoToken.trim(),
      autoSync: Boolean(tursoUrl && tursoToken),
    });
    saveStoredGeminiKey(geminiKey);

    if (tursoUrl && tursoToken) {
      setIsSyncing(true);
      try {
        await onSyncWithTurso();
      } finally {
        setIsSyncing(false);
      }
    }
    onClose();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `creditrack_cards_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportCards(parsed);
            alert(`Successfully imported ${parsed.length} cards!`);
          } else {
            alert('Invalid backup file format.');
          }
        } catch {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
    if (granted) {
      sendLocalNotification('CrediTrack Alerts Enabled', {
        body: 'You will receive reminders before statement generation and due dates.',
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 my-8 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs tracking-wider uppercase mb-1">
            <Database className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Settings & Sync</span>
          </div>
          <h2 id="settings-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight">Configuration</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your Turso cloud database, Gemini AI live benefit fetcher, and offline backups.
          </p>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: TURSO DATABASE */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="font-bold text-sm text-white">Turso Database (libSQL)</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                isTursoConnected
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                  : 'bg-white/[0.06] text-zinc-400'
              }`}>
                {isTursoConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Connect to your Turso serverless SQLite database to sync cards between your mobile and desktop devices.
            </p>

            <div>
              <label htmlFor="turso-url-input" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Turso Database URL
              </label>
              <input
                id="turso-url-input"
                type="text"
                value={tursoUrl}
                onChange={e => setTursoUrl(e.target.value)}
                placeholder="libsql://your-db-org.turso.io"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="turso-token-input" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Turso Auth Token
              </label>
              <input
                id="turso-token-input"
                type="password"
                value={tursoToken}
                onChange={e => setTursoToken(e.target.value)}
                placeholder="eyJh..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-mono min-h-[44px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestTurso}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-zinc-200 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* SECTION 2: GEMINI AI FETCHER */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span className="font-bold text-sm text-white">Gemini AI Benefits Fetcher</span>
            </div>

            <p className="text-xs text-zinc-300">
              When configured, the app uses <strong>Gemini 3.8 Flash</strong> with live search to fetch up-to-the-minute lounge rules, devaluations, and reward rates whenever you add or refresh cards.
            </p>

            <div>
              <label htmlFor="gemini-key-input" className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Gemini API Key
              </label>
              <input
                id="gemini-key-input"
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-zinc-500 focus:outline-none font-mono min-h-[44px]"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                If omitted, CrediTrack uses the built-in curated catalog for 30+ top Indian & Amex credit cards.
              </p>
            </div>
          </div>

          {/* SECTION 3: PWA NOTIFICATIONS */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2.5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="font-bold text-sm text-white">Browser & PWA Notifications</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                notificationStatus === 'granted' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-white/[0.06] text-zinc-400'
              }`}>
                {notificationStatus === 'granted' ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-zinc-300">
              Get timely notifications before your statement cuts and before bill payment due dates.
            </p>

            {notificationStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition-all min-h-[44px] border border-white/10"
              >
                Enable Notifications
              </button>
            )}
          </div>

          {/* SECTION 4: BACKUP & PRESETS */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 backdrop-blur-md">
            <span className="font-bold text-sm text-white block">Data Backup & Demo Presets</span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-zinc-200 transition-colors min-h-[44px]"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export Cards (.json)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-zinc-200 transition-colors cursor-pointer min-h-[44px]">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={onLoadSampleCards}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-medium transition-colors min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Load Sample Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-medium transition-colors min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSyncing}
            className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 min-h-[44px]"
          >
            {isSyncing ? 'Syncing...' : 'Save & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
