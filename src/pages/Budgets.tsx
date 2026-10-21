import { useCallback, useState } from "react";

import { api, type Budget } from "../api";
import { BudgetBar } from "../components/BudgetBar";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "../categories";
import { formatMoney } from "../format";
import { useLoad } from "../useLoad";

export function Budgets({ onSessionExpired }: { onSessionExpired: () => void }) {
  const load = useCallback(() => api.budgets(), []);
  const { data, error, reload } = useLoad(load, onSessionExpired);
  const [editing, setEditing] = useState<Category | null>(null);
  const [value, setValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const byCategory = new Map<Category, Budget>((data ?? []).map((b) => [b.category, b]));

  function startEditing(category: Category) {
    setEditing(category);
    setFormError(null);
    setValue(byCategory.get(category)?.monthly_limit ?? "");
  }

  async function save(category: Category) {
    const normalized = value.replace(",", ".").trim();
    if (!(Number(normalized) > 0)) {
      setFormError("Indica um valor maior que zero.");
      return;
    }
    try {
      await api.setBudget(category, normalized);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Ocorreu um erro.");
    }
  }

  async function remove(category: Category) {
    if (!window.confirm(`Remover o orçamento de ${CATEGORY_LABELS[category]}?`)) return;
    await api.deleteBudget(category);
    reload();
  }

  return (
    <section>
      <p className="muted intro">
        Define quanto queres gastar por mês em cada categoria. O bot avisa-te aos 80% e quando
        ultrapassares.
      </p>
      {error && <p className="error">{error}</p>}
      <div className="card">
        {CATEGORIES.map((category) => {
          const budget = byCategory.get(category);
          return (
            <div key={category} className="budget-row">
              {editing === category ? (
                <form
                  className="inline-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    save(category);
                  }}
                >
                  <strong>{CATEGORY_LABELS[category]}</strong>
                  <input
                    inputMode="decimal"
                    placeholder="Limite mensal (€)"
                    value={value}
                    autoFocus
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <button type="submit">Guardar</button>
                  <button type="button" className="secondary" onClick={() => setEditing(null)}>
                    Cancelar
                  </button>
                  {formError && <p className="error">{formError}</p>}
                </form>
              ) : budget ? (
                <>
                  <BudgetBar budget={budget} />
                  <div className="row-actions">
                    <button type="button" className="link" onClick={() => startEditing(category)}>
                      Alterar ({formatMoney(budget.monthly_limit)})
                    </button>
                    <button
                      type="button"
                      className="link danger-text"
                      onClick={() => remove(category)}
                    >
                      Remover
                    </button>
                  </div>
                </>
              ) : (
                <div className="budget-empty">
                  <span>{CATEGORY_LABELS[category]}</span>
                  <button type="button" className="link" onClick={() => startEditing(category)}>
                    Definir orçamento
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
