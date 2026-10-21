import type { Budget } from "../api";
import { CATEGORY_LABELS } from "../categories";
import { formatMoney } from "../format";

export function budgetState(percent: number): "ok" | "warning" | "over" {
  if (percent > 100) return "over";
  if (percent >= 80) return "warning";
  return "ok";
}

export function BudgetBar({ budget }: { budget: Budget }) {
  const state = budgetState(budget.percent);
  const remaining = Number(budget.remaining);
  return (
    <div className="budget">
      <div className="budget-head">
        <strong>{CATEGORY_LABELS[budget.category]}</strong>
        <span>
          {formatMoney(budget.spent)} de {formatMoney(budget.monthly_limit)}
        </span>
      </div>
      <div className={`bar bar-${state}`} role="progressbar" aria-valuenow={budget.percent}>
        <div style={{ width: `${Math.min(budget.percent, 100)}%` }} />
      </div>
      <small className={`budget-note note-${state}`}>
        {budget.percent}% ·{" "}
        {remaining >= 0
          ? `restam ${formatMoney(remaining)}`
          : `passaste ${formatMoney(-remaining)}`}
      </small>
    </div>
  );
}
