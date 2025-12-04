import { useMemo, useState } from "react";

export default function Finder({ data = [], CardType, sort, filter, placeholder = "Buscar..." }) {
  const [searchValue, setSearch] = useState("");

  const content = useMemo(() => {
    if (!Array.isArray(data)) return null;

    let processed = [...data];

    if (typeof filter === "function") processed = filter(processed);
    if (typeof sort === "function") processed = sort(processed);

    const q = searchValue.trim().toLowerCase();
    if (q !== "") {
      processed = processed.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
      );
    }

    return processed.map((c, i) => (
      <CardType key={c.id ?? i} info={c} />
    ));
  }, [searchValue, data, CardType, filter, sort]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4 mb-6">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-white border border-gray-300/20 rounded-md shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            placeholder={placeholder}
            aria-label="Buscar"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSearch("")}
              className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div>
          {content}
        </div>
      </div>
    </div>
  );
}
