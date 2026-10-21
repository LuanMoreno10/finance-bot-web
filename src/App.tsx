import { useCallback, useState } from "react";

import { api } from "./api";
import { Budgets } from "./pages/Budgets";
import { Dashboard } from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import { Login } from "./pages/Login";
import { navigate, useRoute } from "./router";
import { clearSession, loadSession, type Session } from "./session";

const TABS = [
  { path: "/", label: "Resumo" },
  { path: "/despesas", label: "Despesas" },
  { path: "/orcamentos", label: "Orçamentos" },
];

export function App() {
  const route = useRoute();
  const [session, setSession] = useState<Session | null>(loadSession);
  const expire = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  if (route.path === "/login" || !session) {
    return <Login token={route.params.get("token")} onLogin={setSession} />;
  }

  async function logout() {
    await api.logout().catch(() => undefined);
    expire();
    navigate("/login");
  }

  const firstName = session.user.name?.split(" ")[0];
  return (
    <div className="app">
      <header>
        <div>
          <small className="muted">Olá{firstName ? `, ${firstName}` : ""}</small>
          <h1>{TABS.find((tab) => tab.path === route.path)?.label ?? "Resumo"}</h1>
        </div>
        <button type="button" className="link" onClick={logout}>
          Sair
        </button>
      </header>
      <main>
        {route.path === "/despesas" ? (
          <Expenses onSessionExpired={expire} />
        ) : route.path === "/orcamentos" ? (
          <Budgets onSessionExpired={expire} />
        ) : (
          <Dashboard onSessionExpired={expire} />
        )}
      </main>
      <nav>
        {TABS.map((tab) => (
          <a
            key={tab.path}
            href={`#${tab.path}`}
            className={route.path === tab.path ? "active" : ""}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
