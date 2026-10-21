export type Profile = { name: string | null; phone_number: string };

export type Session = { accessToken: string; expiresAt: string; user: Profile };

const KEY = "finance-bot.session";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Sem armazenamento (ex.: navegação privada): a sessão dura só enquanto a página estiver aberta.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignorado
  }
}
