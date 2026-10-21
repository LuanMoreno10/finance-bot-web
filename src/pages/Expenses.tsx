import { useCallback, useState } from "react";

import { api, type Expense } from "../api";
import { ExpenseForm } from "../components/ExpenseForm";
import { MonthPicker } from "../components/MonthPicker";
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS, type Category } from "../categories";
import { currentMonth, formatDate, formatMoney, monthBounds } from "../format";
import { useLoad } from "../useLoad";

export function Expenses({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [month, setMonth] = useState(currentMonth);
  const [category, setCategory] = useState<Category | "">("");
  const [editing, setEditing] = useState<Expense | "new" | null>(null);

  const load = useCallback(() => {
    const { from, to } = monthBounds(month);
    return api.expenses({ from, to, category });
  }, [month, category]);
  const { data, error, loading, reload } = useLoad(load, onSessionExpired);

  const expenses = data ?? [];
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <section>
      <MonthPicker value={month} onChange={setMonth} />
      <div className="toolbar">
        <select value={category} onChange={(e) => setCategory(e.target.value as Category | "")}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setEditing("new")}>
          + Adicionar
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="card">
        <div className="card-head">
          <h2>
            {expenses.length} {expenses.length === 1 ? "despesa" : "despesas"}
          </h2>
          <strong>{formatMoney(total)}</strong>
        </div>
        {expenses.length === 0 && (
          <p className="muted">{loading ? "A carregar…" : "Sem despesas."}</p>
        )}
        <ul className="expenses">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <button type="button" onClick={() => setEditing(expense)}>
                <span className="dot" style={{ background: CATEGORY_COLORS[expense.category] }} />
                <span className="expense-text">
                  <strong>{expense.description || CATEGORY_LABELS[expense.category]}</strong>
                  <small>
                    {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
                  </small>
                </span>
                <strong>{formatMoney(expense.amount)}</strong>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <ExpenseForm
          expense={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            if (editing === "new") await api.createExpense(input);
            else await api.updateExpense(editing.id, input);
            reload();
          }}
          onDelete={
            editing === "new"
              ? undefined
              : async () => {
                  await api.deleteExpense(editing.id);
                  reload();
                }
          }
        />
      )}
    </section>
  );
}
