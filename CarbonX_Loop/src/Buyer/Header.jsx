import React from "react";

export default function Header({
  isDark,
  toggleTheme,
  currentPage,
  searchTerm,
  setSearchTerm,
  onNavigate,
}) {
  const pageTitles = {
    portfolio: {
      title: "Portfolio",
      subtitle: "Your carbon offset investments",
    },
    wallet: {
      title: "Wallet",
      subtitle: "Manage your CarbonX wallet",
    },
    impact: {
      title: "Impact",
      subtitle: "Track your environmental contribution",
    },
    account: { title: "Account", subtitle: "Manage your profile and settings" },
  };
  const current = pageTitles[currentPage];

  return (
    <>
      {/* Status bar spacer */}
      <div className="h-12 w-full bg-[#f6f8f7] dark:bg-[#102218] sticky top-0 z-30 transition-colors" />

      <header className="px-5 pb-4 sticky top-12 z-30 bg-[#f6f8f7] dark:bg-[#102218] transition-colors">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/applogo.png"
              alt="carbonX logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              {currentPage === "marketplace" ? (
                <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
                  carbon<span className="Xchange">X</span>
                </h1>
              ) : (
                <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
                  {current?.title}
                </h1>
              )}
              <p className="text-[#718b7c] text-sm font-medium">
                {currentPage === "marketplace"
                  ? "1,248 verified projects available"
                  : current?.subtitle}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="w-10 h-10 rounded-full bg-[#e3e8e5] dark:bg-[#1a2b21] flex items-center justify-center transition-transform hover:scale-110 text-[#2d4235] dark:text-[#c7d1cc]"
            >
              <span className="material-icons-round">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#13ec6d] cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
              onClick={() => onNavigate && onNavigate("account")}
            >
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArKV8a549OMrfyMdPgnH0ggXLpR0B3FmpKlAOGDvPehQX5mPTeXFtG2t59Adh5Qjg7OUFN5UYdl4muV99NR4nTwsCOq5OWhetbmiFFW76dP3dRNYA7RfovSngt1xk4wE8DIjOH_lDtDIRB6OP-sO-BRzYaVIyguH-UyzRaRDwM3hX-L7Fk5VhUiqF9hC951V9fo-XfqFzhvqwuCM_FdId7iX_jm9jWL8xg9KaRhbRxJgSa6zjMEFhtYZd_GNo7tjIbJqiPHHxOJ__e"
                alt="Profile avatar"
              />
            </div>
          </div>
        </div>

        {/* Search bar — only on marketplace */}
        {currentPage === "marketplace" && (
          <div className="relative group" id="search-container">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-[#9db0a5] group-focus-within:text-[#13ec6d] transition-colors pointer-events-none">
              search
            </span>
            <input
              id="search-input"
              type="text"
              placeholder="Search carbon projects"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#1a2b21] border-none rounded-xl py-4 pl-12 pr-4 shadow-sm ring-1 ring-[#e3e8e5] dark:ring-[#2d4235] focus:ring-2 focus:ring-[#13ec6d] outline-none transition-all placeholder:text-[#9db0a5] font-[Manrope] text-[#0c1510] dark:text-[#f0f4f2]"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9db0a5] group-focus-within:text-[#13ec6d] transition-colors pointer-events-none">
              ⚙ Filters
            </button>
          </div>
        )}
      </header>
    </>
  );
}
