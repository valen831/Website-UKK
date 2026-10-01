"use client";

import { useState, useMemo } from "react";
import { isDateBooked, cn } from "@/lib/utils";

interface DateRangePickerProps {
  bookedDates: string[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function DateRangePicker({
  bookedDates,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectingEnd, setSelectingEnd] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth]);

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function handleDayClick(date: Date) {
    const dateStr = date.toISOString().slice(0, 10);

    if (!selectingEnd || !startDate) {
      onStartDateChange(dateStr);
      onEndDateChange("");
      setSelectingEnd(true);
    } else {
      if (dateStr < startDate) {
        onStartDateChange(dateStr);
        onEndDateChange("");
      } else {
        onEndDateChange(dateStr);
        setSelectingEnd(false);
      }
    }
  }

  function isDayInRange(date: Date): boolean {
    if (!startDate || !endDate) return false;
    const dateStr = date.toISOString().slice(0, 10);
    return dateStr >= startDate && dateStr <= endDate;
  }

  function isDayStart(date: Date): boolean {
    return date.toISOString().slice(0, 10) === startDate;
  }

  function isDayEnd(date: Date): boolean {
    return date.toISOString().slice(0, 10) === endDate;
  }

  const canGoPrev =
    currentYear > today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h3 className="font-semibold text-secondary text-sm">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-9" />;
          }

          const isPast = date < today;
          const booked = isDateBooked(date, bookedDates);
          const disabled = isPast || booked;
          const inRange = isDayInRange(date);
          const isStart = isDayStart(date);
          const isEnd = isDayEnd(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              disabled={disabled}
              className={cn(
                "calendar-day h-9 rounded-lg text-xs font-medium transition-all",
                disabled && "text-gray-300 cursor-not-allowed",
                booked && "bg-red-50 text-red-300 line-through",
                !disabled && !inRange && "hover:bg-primary/10 text-gray-700",
                inRange && !isStart && !isEnd && "bg-primary/10 text-primary",
                (isStart || isEnd) && "bg-primary text-white hover:bg-primary-dark"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-primary rounded" />
          <span>Dipilih</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded" />
          <span>Terisi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-primary/10 rounded" />
          <span>Rentang</span>
        </div>
      </div>

      {/* Selection info */}
      {selectingEnd && startDate && !endDate && (
        <p className="mt-3 text-xs text-primary font-medium text-center">
          Pilih tanggal pengembalian
        </p>
      )}
    </div>
  );
}
