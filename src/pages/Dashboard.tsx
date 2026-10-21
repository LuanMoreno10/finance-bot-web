import { useCallback, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../api";
import { BudgetBar } from "../components/BudgetBar";
import { MonthPicker } from "../components/MonthPicker";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../categories";
import { currentMonth, formatMoney, MONTH_NAMES } from "../format";
import { navigate } from "../router";
import { useLoad } from "../useLoad";

export function Dashboard({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [month, setMonth] = useState(currentMonth);
  const loadSummary = useCallback(() => api.summary(month.year, month.month), [month]);
  const loadHistory = useCallback(() => api.history(6), []);
  const summary = useLoad(loadSummary, onSessionExpired);
  const history = useLoad(loadHistory, onSessionExpired);

  const data = summary.data;
  const total = Number(data?.total ?? 0);
  const previous = Number(data?.previous_month_total ?? 0);
  const change = previous > 0 ? Math.round(((total - previous) / previous) * 100) : null;
  const slices = (data?.by_category ?? [])
    .map((item) => ({ ...item, value: Number(item.total) }))
    .sort((a, b) => b.value - a.value);

  return (
    <section>
      <MonthPicker value={month} onChange={setMonth} />
      {summary.error && <p className="error">{summary.error}</p>}

      <div className="kpis">
        <div className="card">
          <small>Total gasto</small>
          <strong className="big">{formatMoney(total)}</strong>
          {change !== null && (
            <small className={change > 0 ? "up" : "down"}>
              {change > 0 ? "▲" : "▼"} {Math.abs(change)}% vs. mês anterior
            </small>
          )}
        </div>
        <div className="card">
          <small>Média diária</small>
          <strong className="big">{formatMoney(data?.daily_average ?? 0)}</strong>
        </div>
      </div>

      <div className="card">
        <h2>Por categoria</h2>
        {slices.length === 0 ? (
          <p className="muted">{summary.loading ? "A carregar…" : "Sem despesas neste mês."}</p>
        ) : (
          <div className="split">
            <div className="chart-donut">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="category"
                    innerRadius="58%"
                    outerRadius="95%"
                    paddingAngle={slices.length > 1 ? 2 : 0}
                  >
                    {slices.map((slice) => (
                      <Cell
                        key={slice.category}
                        fill={CATEGORY_COLORS[slice.category]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    labelFormatter={() => ""}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="legend">
              {slices.map((slice) => (
                <li key={slice.category}>
                  <span className="dot" style={{ background: CATEGORY_COLORS[slice.category] }} />
                  <span>{CATEGORY_LABELS[slice.category]}</span>
                  <strong>{formatMoney(slice.value)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Orçamentos</h2>
          <button type="button" className="link" onClick={() => navigate("/orcamentos")}>
            Gerir
          </button>
        </div>
        {(data?.budgets ?? []).length === 0 ? (
          <p className="muted">Ainda não definiste orçamentos.</p>
        ) : (
          data!.budgets.map((budget) => <BudgetBar key={budget.category} budget={budget} />)
        )}
      </div>

      <div className="card">
        <h2>Últimos 6 meses</h2>
        <div className="chart-bars">
          <ResponsiveContainer>
            <BarChart
              data={(history.data ?? []).map((item) => ({
                label: MONTH_NAMES[item.month - 1].slice(0, 3),
                total: Number(item.total),
              }))}
            >
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(value) => formatMoney(Number(value))}
                cursor={{ fill: "var(--hover)" }}
              />
              <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
