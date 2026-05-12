import React from 'react';
import { Clock, MapPin, User, Coffee, Utensils } from 'lucide-react';

interface TimeSlot {
  time: string;
  type: 'lecture' | 'lab' | 'training' | 'break';
  subject?: string;
  faculty?: string;
  room?: string;
  label?: string;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

const TIMETABLE_DATA: DaySchedule[] = [
  {
    day: 'Monday',
    slots: [
      { time: '9:30 - 10:30', type: 'lecture', subject: 'DCN', faculty: 'PMC', room: '104' },
      { time: '10:30 - 11:30', type: 'lecture', subject: 'AJ', faculty: 'SB', room: '104' },
      { time: '11:30 - 11:45', type: 'break', label: 'RECESS' },
      { time: '11:45 - 1:45', type: 'training', subject: 'TRAINING', room: '102' },
      { time: '1:45 - 2:30', type: 'break', label: 'LUNCH BREAK' },
      { time: '2:30 - 3:30', type: 'lecture', subject: 'AI-1', faculty: 'SB', room: '103' },
      { time: '3:30 - 4:30', type: 'lecture', subject: 'AJ', faculty: 'SB', room: '103' },
    ]
  },
  {
    day: 'Tuesday',
    slots: [
      { time: '9:30 - 11:30', type: 'lab', subject: 'AJ LAB', faculty: 'SB', room: '103' },
      { time: '11:30 - 11:45', type: 'break', label: 'RECESS' },
      { time: '11:45 - 1:45', type: 'training', subject: 'TRAINING', room: '102' },
      { time: '1:45 - 2:30', type: 'break', label: 'LUNCH BREAK' },
      { time: '2:30 - 4:30', type: 'training', subject: 'TRAINING', room: '103' },
    ]
  },
  {
    day: 'Wednesday',
    slots: [
      { time: '9:30 - 10:30', type: 'lecture', subject: 'AI-1', faculty: 'SB', room: '103' },
      { time: '10:30 - 11:30', type: 'lecture', subject: 'CG', faculty: 'HD', room: '103' },
      { time: '11:30 - 11:45', type: 'break', label: 'RECESS' },
      { time: '11:45 - 1:45', type: 'training', subject: 'TRAINING', room: '103' },
      { time: '1:45 - 2:30', type: 'break', label: 'LUNCH BREAK' },
      { time: '2:30 - 3:30', type: 'lecture', subject: 'DCN', faculty: 'PMC', room: '103' },
    ]
  },
  {
    day: 'Thursday',
    slots: [
      { time: '9:30 - 11:30', type: 'lab', subject: 'CG LAB', faculty: 'PMC', room: '103' },
      { time: '11:30 - 11:45', type: 'break', label: 'RECESS' },
      { time: '11:45 - 12:45', type: 'lecture', subject: 'AJ', faculty: 'SB', room: '103' },
      { time: '12:45 - 1:45', type: 'lecture', subject: 'CG', faculty: 'HD', room: '103' },
      { time: '1:45 - 2:30', type: 'break', label: 'LUNCH BREAK' },
      { time: '2:30 - 4:30', type: 'training', subject: 'TRAINING', room: '103' },
    ]
  },
  {
    day: 'Friday',
    slots: [
      { time: '9:30 - 11:30', type: 'lab', subject: 'AI-1 LAB', faculty: 'SB', room: '103' },
      { time: '11:30 - 11:45', type: 'break', label: 'RECESS' },
      { time: '11:45 - 1:45', type: 'training', subject: 'TRAINING', room: '103' },
      { time: '1:45 - 2:30', type: 'break', label: 'LUNCH BREAK' },
      { time: '2:30 - 3:30', type: 'lecture', subject: 'CG', faculty: 'HD', room: '104' },
      { time: '3:30 - 4:30', type: 'lecture', subject: 'DCN', faculty: 'PMC', room: '104' },
    ]
  }
];

const SlotCard: React.FC<{ slot: TimeSlot }> = ({ slot }) => {
  const isLab = slot.type === 'lab';
  const isTraining = slot.type === 'training';
  const isBreak = slot.type === 'break';
  
  if (isBreak) {
    return (
      <div className="p-3 rounded-xl border border-yellow-100 dark:border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5 flex items-center justify-between group transition-all shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
            {slot.label === 'RECESS' ? <Coffee size={14} className="text-yellow-600" /> : <Utensils size={14} className="text-yellow-600" />}
          </div>
          <div>
            <div className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider">{slot.label}</div>
            <div className="text-[9px] text-yellow-600/60 font-medium">{slot.time}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl border transition-all duration-300 hover:shadow-md group shrink-0 ${
      isLab 
        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/40' 
        : isTraining
        ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/40'
        : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock size={12} className="opacity-40" />
        <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">{slot.time}</span>
      </div>
      <div className="font-bold text-sm mb-1 group-hover:text-[#4F46E5] transition-colors">{slot.subject}</div>
      <div className="flex items-center gap-3 mt-2">
        {slot.faculty && (
          <div className="flex items-center gap-1 opacity-60">
            <User size={10} />
            <span className="text-[10px] font-medium">{slot.faculty}</span>
          </div>
        )}
        {slot.room && (
          <div className="flex items-center gap-1 opacity-60">
            <MapPin size={10} />
            <span className="text-[10px] font-medium">Room {slot.room}</span>
          </div>
        )}
      </div>
      {isLab && (
        <div className="mt-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tighter">Laboratory Session</div>
      )}
      {isTraining && (
        <div className="mt-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-tighter">Training Period</div>
      )}
    </div>
  );
};

export default function WeeklyTimetable() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="grid grid-cols-5 gap-4 pb-8">
        {TIMETABLE_DATA.map((dayData) => (
          <div key={dayData.day} className="flex flex-col gap-4">
            <div className="text-center py-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5]">{dayData.day}</span>
            </div>
            
            <div className="flex-1 space-y-4 pr-1">
              {dayData.slots.map((slot, idx) => (
                <SlotCard key={`${dayData.day}-${idx}`} slot={slot} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend / Footer */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-6 justify-center shrink-0">
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-purple-500/20 border border-purple-500/40"></div>
            <span>LAB SESSIONS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500/40"></div>
            <span>TRAINING</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-500/20 border border-gray-200 dark:border-white/10"></div>
            <span>LECTURES</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-yellow-500/20 border border-yellow-500/40"></div>
            <span>BREAKS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
