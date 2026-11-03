import React, { useState, useMemo } from 'react';
import type { CreditCard } from '../types/card';
import { calculateBillingCycle, formatDate } from '../utils/billingUtils';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle
} from 'lucide-react';

interface BillingCalendarProps {
  cards: CreditCard[];
  onSelectCard: (card: CreditCard) => void;
}

interface DayEvent {
  card: CreditCard;
  type: 'statement' | 'due' | 'optimal';
  label: string;
}

export const BillingCalendar: React.FC<BillingCalendarProps> = ({ cards, onSelectCard }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [today] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const eventsByDay = useMemo(() => {
    const map: { [day: number]: DayEvent[] } = {};

    cards.forEach(card => {
      const calc = calculateBillingCycle(card, currentDate);

      // 1. Statement day of this month
      const stmtDay = Math.min(card.statementDay, daysInMonth);
      if (!map[stmtDay]) map[stmtDay] = [];
      map[stmtDay].push({
        card,
        type: 'statement',
        label: `${card.bankName} statement cuts`,
      });

      // 2. Due date if it falls in this month
      if (calc.nextDueDate.getMonth() === month && calc.nextDueDate.getFullYear() === year) {
        const dueDay = calc.nextDueDate.getDate();
        if (!map[dueDay]) map[dueDay] = [];
        map[dueDay].push({
          card,
          type: 'due',
          label: `${card.bankName} bill DUE`,
        });
      }

      // 3. Optimal spending window (first 4 days after statement date)
      for (let offset = 1; offset <= 3; offset++) {
        const optDay = stmtDay + offset;
        if (optDay <= daysInMonth) {
          if (!map[optDay]) map[optDay] = [];
          map[optDay].push({
            card,
            type: 'optimal',
            label: `Max float on ${card.bankName}`,
          });
        }
      }
    });

    return map;
  }, [cards, currentDate, daysInMonth, month, year]);

  const upcomingEvents = useMemo(() => {
    return cards.flatMap(card => {
      const calc = calculateBillingCycle(card);
      return [
        {
          card,
          type: 'statement' as const,
          date: calc.nextStatementDate,
          daysAway: calc.daysUntilStatement,
          title: `${card.bankName} ${card.cardName} Statement Cuts`,
          desc: `Bill generated. Purchases made after this date enjoy maximum credit float.`,
        },
        {
          card,
          type: 'due' as const,
          date: calc.nextDueDate,
          daysAway: calc.daysUntilDue,
          title: `${card.bankName} ${card.cardName} Payment Due`,
          desc: `Pay bill before this date to prevent interest and late charges.`,
        },
      ];
    }).sort((a, b) => a.daysAway - b.daysAway).slice(0, 8);
  }, [cards]);

  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const currentDay = today.getDate();

  return (
    <section className="space-y-8" aria-label="Billing Calendar and Timeline">
      {/* Calendar Card in Frosted Glass */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl">
        {/* Calendar Navigation Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center border border-amber-400/30" aria-hidden="true">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{monthName}</h2>
              <p className="text-xs text-zinc-400">Statement generation & bill payment schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-xs font-semibold text-zinc-200 border border-white/[0.08] transition-colors min-h-[44px]"
              aria-label="Jump to current month"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.08] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-5 px-1" role="note" aria-label="Calendar legend">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
            <span>Statement Cut Date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" aria-hidden="true" />
            <span>Bill Due Date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span>Optimal Float Window</span>
          </div>
        </div>

        {/* Days of Week Header with responsive mobile abbreviations */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] sm:text-xs text-zinc-500 uppercase tracking-widest mb-2" aria-hidden="true">
          <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></div>
          <div><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></div>
          <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></div>
          <div><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></div>
          <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></div>
          <div><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></div>
          <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></div>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5" role="grid" aria-label={`Days of ${monthName}`}>
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-2xl bg-white/[0.01]" aria-hidden="true" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const isToday = isCurrentMonth && day === currentDay;
            const events = eventsByDay[day] || [];

            const statementEvents = events.filter(e => e.type === 'statement');
            const dueEvents = events.filter(e => e.type === 'due');
            const optimalEvents = events.filter(e => e.type === 'optimal');

            return (
              <div
                key={`day-${day}`}
                className={`h-16 sm:h-24 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border flex flex-col justify-between transition-all overflow-hidden ${
                  isToday
                    ? 'bg-amber-400/[0.08] border-amber-400/50 ring-1 ring-amber-400/30'
                    : events.length > 0
                    ? 'bg-white/[0.03] border-white/[0.08]'
                    : 'bg-white/[0.01] border-white/[0.04]'
                }`}
                role="gridcell"
                aria-label={`${day} ${monthName}, ${events.length} card events`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] sm:text-xs font-bold tabular-num ${isToday ? 'text-amber-300' : 'text-zinc-400'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-1 rounded">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Event Badges */}
                <div className="space-y-0.5 sm:space-y-1 overflow-y-auto no-scrollbar">
                  {statementEvents.map((ev, i) => (
                    <button
                      key={`stmt-${i}`}
                      onClick={() => onSelectCard(ev.card)}
                      className="w-full text-left truncate px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:opacity-80 block"
                      aria-label={`${ev.card.cardName} statement cut on ${day} ${monthName}`}
                    >
                      <span className="sm:hidden">Cut</span>
                      <span className="hidden sm:inline">{ev.card.cardName.split(' ')[0]} cut</span>
                    </button>
                  ))}

                  {dueEvents.map((ev, i) => (
                    <button
                      key={`due-${i}`}
                      onClick={() => onSelectCard(ev.card)}
                      className="w-full text-left truncate px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:opacity-80 block"
                      aria-label={`${ev.card.cardName} bill due on ${day} ${monthName}`}
                    >
                      <span className="sm:hidden">Due</span>
                      <span className="hidden sm:inline">{ev.card.cardName.split(' ')[0]} due</span>
                    </button>
                  ))}

                  {optimalEvents.length > 0 && statementEvents.length === 0 && (
                    <div
                      className="truncate px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      title="Optimal spending window"
                    >
                      <span className="sm:hidden">Float</span>
                      <span className="hidden sm:inline">Max Float</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Chronological Timeline */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <h3 className="text-base font-bold text-white">Upcoming Card Milestones & Deadlines</h3>
        </div>

        <div className="space-y-2.5">
          {upcomingEvents.map((ev, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                ev.type === 'due' && ev.daysAway <= 3
                  ? 'bg-rose-950/30 border-rose-500/30'
                  : ev.type === 'statement' && ev.daysAway <= 2
                  ? 'bg-amber-950/30 border-amber-500/30'
                  : 'bg-white/[0.03] border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    ev.type === 'due' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  }`}
                  aria-hidden="true"
                >
                  {ev.type === 'due' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>

                <div>
                  <div className="font-bold text-white text-sm">{ev.title}</div>
                  <p className="text-zinc-400 mt-0.5">{ev.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <div className="text-right">
                  <div className={`font-bold tabular-num ${
                    ev.daysAway === 0
                      ? 'text-rose-400'
                      : ev.daysAway <= 3
                      ? 'text-amber-400'
                      : 'text-zinc-200'
                  }`}>
                    {ev.daysAway === 0 ? 'Today!' : `in ${ev.daysAway} day${ev.daysAway > 1 ? 's' : ''}`}
                  </div>
                  <div className="text-[11px] text-zinc-500 tabular-num">{formatDate(ev.date)}</div>
                </div>

                <button
                  onClick={() => onSelectCard(ev.card)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 font-medium transition-colors min-h-[44px] min-w-[44px] border border-white/[0.08]"
                  aria-label={`View ${ev.card.cardName}`}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
