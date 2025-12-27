import React, { useState } from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { getRelativeTime } from '../utils';

const Calendar: React.FC = () => {
  const { data } = useLifeOS();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderCalendar = () => {
    const days = [];
    const emptyCells = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="h-32 bg-bg-tertiary/20 rounded-lg"></div>);
    
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = new Date(year, month, day).toDateString();
      const isToday = new Date().toDateString() === dateStr;

      // Find events for this day
      const daysTasks = data.tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dateStr);
      const daysGoals = data.goals.filter(g => g.deadline && new Date(g.deadline).toDateString() === dateStr);

      return (
        <div key={day} className={`h-32 glass-card rounded-lg p-2 flex flex-col hover:border-accent transition-colors overflow-hidden ${isToday ? 'border-accent bg-accent/5' : 'border-border'}`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-accent text-white' : 'text-gray-400'}`}>{day}</span>
            {daysTasks.length + daysGoals.length > 0 && <span className="text-xs text-gray-500">{daysTasks.length + daysGoals.length} events</span>}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1">
             {daysGoals.map(g => (
                <div key={g.id} className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded truncate border-l-2 border-purple-500">
                    🎯 {g.title}
                </div>
             ))}
             {daysTasks.map(t => (
                <div key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate border-l-2 ${t.completed ? 'bg-green-500/10 text-green-500 border-green-500 line-through opacity-60' : 'bg-bg-tertiary text-gray-300 border-gray-500'}`}>
                    {t.title}
                </div>
             ))}
          </div>
        </div>
      );
    });

    return [...emptyCells, ...dayCells];
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{monthNames[month]} {year}</h2>
            <div className="flex gap-1">
                <button onClick={prevMonth} className="p-2 hover:bg-bg-tertiary rounded-lg"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm hover:bg-bg-tertiary rounded-lg border border-border">Today</button>
                <button onClick={nextMonth} className="p-2 hover:bg-bg-tertiary rounded-lg"><ChevronRight size={20} /></button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-2 text-center text-gray-400 text-sm uppercase tracking-wider font-semibold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-4 flex-1 overflow-y-auto pb-4">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default Calendar;