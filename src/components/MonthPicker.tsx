import { currentMonth, monthLabel, shiftMonth, type YearMonth } from "../format";

type Props = { value: YearMonth; onChange: (value: YearMonth) => void };

export function MonthPicker({ value, onChange }: Props) {
  const now = currentMonth();
  const isCurrent = value.year === now.year && value.month === now.month;
  return (
    <div className="month-picker">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftMonth(value, -1))}
      >
        ‹
      </button>
      <span>{monthLabel(value)}</span>
      <button
        type="button"
        aria-label="Mês seguinte"
        disabled={isCurrent}
        onClick={() => onChange(shiftMonth(value, 1))}
      >
        ›
      </button>
    </div>
  );
}
