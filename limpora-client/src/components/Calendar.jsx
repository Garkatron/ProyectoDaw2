import React, { useState } from 'react';

export default function Calendar() {
  const [current, setCurrent] = useState(new Date());

  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const weekdays = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  function changeMonth(offset) {
    setCurrent(new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function changeCurrentDay(day) {
    setCurrent(day.date);
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-300/20 shadow-sm">
<header className="flex flex-wrap items-center justify-between gap-3 mb-4">
  <h2 className="text-gray-800 text-lg sm:text-xl font-semibold w-full sm:w-auto text-center sm:text-left">
    {months[current.getMonth()]} {current.getFullYear()}
  </h2>

  <div className="flex gap-2 mx-auto sm:mx-0">
    <button
      onClick={() => changeMonth(-1)}
      className="px-2 py-1 sm:px-3 sm:py-2 bg-white border border-gray-300/20 rounded-md text-gray-700 shadow-sm hover:bg-gray-100 transition"
    >
      ‹
    </button>
    <button
      onClick={() => changeMonth(1)}
      className="px-2 py-1 sm:px-3 sm:py-2 bg-white border border-gray-300/20 rounded-md text-gray-700 shadow-sm hover:bg-gray-100 transition"
    >
      ›
    </button>
  </div>
</header>


      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
        {weekdays.map((w) => (
          <div key={w} className="text-[10px] sm:text-xs text-gray-700/80 font-medium">
            {w}
          </div>
        ))}
      </div>

      <CalendarDays day={current} changeCurrentDay={changeCurrentDay} />
    </div>
  );
}

function CalendarDays({ day, changeCurrentDay }) {
  const year = day.getFullYear();
  const month = day.getMonth();

  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    days.push({
      date: d,
      number: d.getDate(),
      currentMonth: d.getMonth() === month,
      selected: d.toDateString() === day.toDateString(),
      key: d.toISOString()
    });
  }

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {days.map((d) => (
        <button
          key={d.key}
          onClick={() => changeCurrentDay(d)}
          className={
            `min-w-0 p-2 sm:p-3 rounded-md text-[11px] sm:text-sm flex items-center justify-center border ` +
            (d.selected
              ? 'bg-white border-gray-300 shadow-md text-gray-800'
              : d.currentMonth
              ? 'bg-white border border-gray-300/20 text-gray-700 hover:bg-gray-100'
              : 'bg-gray-50 border border-transparent text-gray-500 hover:bg-gray-100')
          }
        >
          <span className={d.selected ? 'font-semibold' : 'font-normal'}>
            {d.number}
          </span>
        </button>
      ))}
    </div>
  );
}
