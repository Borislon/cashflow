import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Начало", end: true },
  { to: "/expenses", label: "Разходи" },
  { to: "/analytics", label: "Анализ" },
  { to: "/family", label: "Семейство" },
  { to: "/profile", label: "Профил" },
];

const AppShell = () => {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-slate-50 text-slate-900">
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white">
        <ul className="mx-auto flex max-w-lg justify-between px-2 py-2">
          {navItems.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "block rounded-lg px-1 py-2 text-center text-xs font-medium",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AppShell;
