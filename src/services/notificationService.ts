import type { CreditCard } from '../types/card';
import { calculateBillingCycle } from '../utils/billingUtils';

export interface AlertItem {
  id: string;
  cardId: string;
  cardName: string;
  bankName: string;
  type: 'statement_soon' | 'due_soon' | 'optimal_window';
  title: string;
  message: string;
  dueDate?: Date;
  urgency: 'high' | 'medium' | 'info';
}

/**
 * Checks all cards and returns active billing alerts
 */
export function getActiveAlerts(cards: CreditCard[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const card of cards) {
    const calc = calculateBillingCycle(card);

    // 1. Bill Payment Due Soon (High Urgency)
    if (calc.daysUntilDue >= 0 && calc.daysUntilDue <= 3) {
      alerts.push({
        id: `due-${card.id}-${calc.daysUntilDue}`,
        cardId: card.id,
        cardName: card.cardName,
        bankName: card.bankName,
        type: 'due_soon',
        title: calc.daysUntilDue === 0 ? 'Bill Due Today' : `Bill Due in ${calc.daysUntilDue} day${calc.daysUntilDue > 1 ? 's' : ''}`,
        message: `Payment deadline for ${card.bankName} ${card.cardName} is on ${calc.nextDueDate.toLocaleDateString()}. Pay today to avoid interest charges!`,
        dueDate: calc.nextDueDate,
        urgency: 'high',
      });
    }

    // 2. Statement Cut Soon (Medium Urgency - hold major purchases!)
    if (calc.daysUntilStatement >= 0 && calc.daysUntilStatement <= 2) {
      alerts.push({
        id: `statement-${card.id}-${calc.daysUntilStatement}`,
        cardId: card.id,
        cardName: card.cardName,
        bankName: card.bankName,
        type: 'statement_soon',
        title: calc.daysUntilStatement === 0 ? 'Statement Cuts Today' : `Statement in ${calc.daysUntilStatement} day${calc.daysUntilStatement > 1 ? 's' : ''}`,
        message: `${card.bankName} ${card.cardName} bill is generating soon. Delay major purchases by a day or two to get up to 50 days of interest-free float!`,
        urgency: 'medium',
      });
    }

    // 3. Optimal Spend Window (Info - Great float period available!)
    if (calc.isOptimalSpendWindow && calc.floatDaysIfSpentToday >= 45) {
      alerts.push({
        id: `optimal-${card.id}`,
        cardId: card.id,
        cardName: card.cardName,
        bankName: card.bankName,
        type: 'optimal_window',
        title: `Optimal Float: ${calc.floatDaysIfSpentToday} Days Free`,
        message: `${card.bankName} ${card.cardName} statement just generated. Purchases made now enjoy maximum interest-free runway until ${calc.nextDueDate.toLocaleDateString()}!`,
        urgency: 'info',
      });
    }
  }

  return alerts;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Sends a local notification if permission is granted
 */
export function sendLocalNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options,
      });
    }
  } catch (e) {
    console.error('Failed to dispatch notification:', e);
  }
}
