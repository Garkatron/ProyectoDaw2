import React, { useState } from "react";

/**
 * Calendar Component
 * 
 * @param {Object} props
 * @param {Array} props.markedDates - Array de objetos { date: Date|string, color: string, status?: string }
 * @param {Function} props.onDateClick - Callback (date: Date) => void cuando se hace click en un día
 * @param {Date} props.selectedDate - Fecha seleccionada externamente (opcional)
 */
export default function Calendar({ 
  markedDates = [], 
  onDateClick,
  selectedDate 
}) {
  const [current, setCurrent] = useState(new Date());

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  function changeMonth(offset) {
    setCurrent(new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function handleDayClick(day) {
    if (onDateClick) {
      onDateClick(day.date);
    }
    setCurrent(day.date);
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-xl border border-gray-200/60 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-gray-800 text-lg sm:text-xl font-semibold w-full sm:w-auto text-center sm:text-left">
          {months[current.getMonth()]} {current.getFullYear()}
        </h2>

        <div className="flex gap-2 mx-auto sm:mx-0">
          <button
            onClick={() => changeMonth(-1)}
            className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center font-medium"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center font-medium"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-3">
        {weekdays.map((w) => (
          <div
            key={w}
            className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wide"
          >
            {w}
          </div>
        ))}
      </div>

      <CalendarDays
        day={current}
        selectedDate={selectedDate}
        markedDates={markedDates}
        onDayClick={handleDayClick}
      />
    </div>
  );
}

function CalendarDays({ day, selectedDate, markedDates, onDayClick }) {
  const year = day.getFullYear();
  const month = day.getMonth();

  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const normalizedMarks = markedDates.map((m) => ({
    date: typeof m.date === "string" ? new Date(m.date) : m.date,
    color: m.color || "bg-blue-100",
    status: m.status,
  }));

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const mark = normalizedMarks.find(
      (m) =>
        m.date.getDate() === d.getDate() &&
        m.date.getMonth() === d.getMonth() &&
        m.date.getFullYear() === d.getFullYear()
    );

    const isSelected = selectedDate
      ? d.toDateString() === selectedDate.toDateString()
      : d.toDateString() === day.toDateString();

    days.push({
      date: d,
      number: d.getDate(),
      currentMonth: d.getMonth() === month,
      selected: isSelected,
      mark,
      key: d.toISOString(),
    });
  }

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {days.map((d) => {
        let baseClasses =
          "min-w-0 h-9 sm:h-11 rounded-lg text-xs sm:text-sm flex flex-col items-center justify-center border transition-all relative overflow-hidden";

        let stateClasses = "";
        if (d.selected) {
          stateClasses = "bg-gray-800 border-gray-800 text-white shadow-md font-semibold";
        } else if (d.mark) {
          const statusColors = {
            Completed: "bg-green-50 border-green-300 text-green-700",
            Pending: "bg-amber-50 border-amber-300 text-amber-700",
            "In Process": "bg-blue-50 border-blue-300 text-blue-700",
          };
          stateClasses =
            statusColors[d.mark.status] ||
            `${d.mark.color} border-gray-300 text-gray-800`;
        } else if (d.currentMonth) {
          stateClasses =
            "bg-white border-gray-200/60 text-gray-700 hover:bg-gray-50 hover:border-gray-300";
        } else {
          stateClasses =
            "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100";
        }

        return (
          <button
            key={d.key}
            onClick={() => onDayClick(d)}
            className={`${baseClasses} ${stateClasses}`}
            disabled={!d.currentMonth}
          >
            <span className={d.selected ? "font-bold" : "font-normal"}>
              {d.number}
            </span>

            {d.mark && !d.selected && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-60" />
            )}
          </button>
        );
      })}
    </div>
  );
}