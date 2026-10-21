import { useState, type FormEvent } from "react";

import type { Expense, ExpenseInput } from "../api";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "../categories";
import { todayIso } from "../format";

type Props = {
  expense: Expense | null;
  onSave: (input: ExpenseInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
};

export function ExpenseForm({ expense, onSave, onDelete, onClose }: Props) {
  const [amount, setAmount] = useState(expense ? expense.amount : "");
  const [category, setCategory] = useState<Category>(expense?.category ?? "alimentacao");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [date, setDate] = useState(expense?.date ?? todayIso());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = amount.replace(",", ".").trim();
    if (!(Number(normalized) > 0)) {
      setError("Indica um valor maior que zero.");
      return;
    }
    run(() =>
      onSave({ amount: normalized, category, description: description.trim() || null, date }),
    );
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form className="sheet" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <h2>{expense ? "Editar despesa" : "Nova despesa"}</h2>
        <label>
          Valor (€)
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label>
          Categoria
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Descrição
          <input
            value={description}
            maxLength={255}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Data
          <input
            type="date"
            value={date}
            max={todayIso()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          {onDelete && (
            <button
              type="button"
              className="danger"
              disabled={busy}
              onClick={() => window.confirm("Apagar esta despesa?") && run(onDelete)}
            >
              Apagar
            </button>
          )}
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" disabled={busy}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
