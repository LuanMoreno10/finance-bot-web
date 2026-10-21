import type { Category } from "./categories";
import { clearSession, loadSession, type Profile, type Session } from "./session";

const API_URL = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");

export type Expense = {
  id: number;
  amount: string;
  category: Category;
  description: string | null;
  date: string;
  created_at: string;
};

export type ExpenseInput = {
  amount: string;
  category: Category;
  description: string | null;
  date: string;
};

export type Budget = {
  category: Category;
  monthly_limit: string;
  spent: string;
  remaining: string;
  percent: number;
};

export type Summary = {
  year: number;
  month: number;
  total: string;
  daily_average: string;
  previous_month_total: string;
  by_category: { category: Category; total: string }[];
  budgets: Budget[];
};

export type MonthTotal = { year: number; month: number; total: string };

export class SessionExpiredError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = loadSession();
  const headers = new Headers(options.headers);
  if (session) headers.set("Authorization", `Bearer ${session.accessToken}`);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401) {
    clearSession();
    throw new SessionExpiredError("A sessão expirou.");
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message = typeof detail?.detail === "string" ? detail.detail : "Ocorreu um erro.";
    throw new Error(message);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export async function exchangeLoginToken(token: string): Promise<Session> {
  const response = await fetch(`${API_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error("Este link é inválido, já foi usado ou expirou. Pede um novo ao bot.");
  }
  const body = (await response.json()) as {
    access_token: string;
    expires_at: string;
    user: Profile;
  };
  return { accessToken: body.access_token, expiresAt: body.expires_at, user: body.user };
}

export const api = {
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  summary: (year: number, month: number) =>
    request<Summary>(`/me/summary?year=${year}&month=${month}`),
  history: (months = 6) => request<MonthTotal[]>(`/me/history?months=${months}`),
  expenses: (params: { from?: string; to?: string; category?: Category | "" }) => {
    const query = new URLSearchParams({ limit: "500" });
    if (params.from) query.set("date_from", params.from);
    if (params.to) query.set("date_to", params.to);
    if (params.category) query.set("category", params.category);
    return request<Expense[]>(`/me/expenses?${query}`);
  },
  createExpense: (input: ExpenseInput) =>
    request<Expense>("/me/expenses", { method: "POST", body: JSON.stringify(input) }),
  updateExpense: (id: number, input: Partial<ExpenseInput>) =>
    request<Expense>(`/me/expenses/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteExpense: (id: number) => request<void>(`/me/expenses/${id}`, { method: "DELETE" }),
  budgets: () => request<Budget[]>("/me/budgets"),
  setBudget: (category: Category, monthlyLimit: string) =>
    request<Budget>(`/me/budgets/${category}`, {
      method: "PUT",
      body: JSON.stringify({ monthly_limit: monthlyLimit }),
    }),
  deleteBudget: (category: Category) =>
    request<void>(`/me/budgets/${category}`, { method: "DELETE" }),
};
