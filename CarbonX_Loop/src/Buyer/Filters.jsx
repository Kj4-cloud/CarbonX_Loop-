import React from "react";

const FILTERS = [
  { key: "all", label: "All Projects", icon: "category" },
  { key: "reforestation", label: "Reforestation", icon: "park" },
  { key: "renewable", label: "Renewable Energy", icon: "wb_sunny" },
  { key: "agriculture", label: "Agriculture", icon: "agriculture" },
];

export default function Filters({ activeFilter, setActiveFilter }) {
  return (
    <section className="mb-6">
      <div className="flex items-center px-5 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#9db0a5]">
          Filters
        </h2>
      </div>

      <div className="flex overflow-x-auto px-5 gap-3 hide-scrollbar">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              data-filter={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all cursor-pointer
                ${
                  isActive
                    ? "bg-[#13ec6d] text-[#0c1510] font-bold border border-[#13ec6d]"
                    : "bg-white dark:bg-[#1a2b21] text-[#2d4235] dark:text-[#c7d1cc] border border-[#e3e8e5] dark:border-[#2d4235] font-semibold hover:border-[#13ec6d] hover:text-[#13ec6d]"
                }`}
            >
              <span
                className="material-icons-round"
                style={{ fontSize: "1.125rem" }}
              >
                {f.icon}
              </span>
              {f.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
