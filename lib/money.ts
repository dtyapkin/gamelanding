import "server-only";

/**
 * Деньги в приложении хранятся ТОЛЬКО как целое число копеек ("integer").
 *
 * Почему нельзя хранить рубли как дробное число (300.5):
 *   0.1 + 0.2 !== 0.3 в JavaScript, и такие ошибки округления рано или поздно
 *   приводят к расхождениям между суммой в базе и суммой в платёжной системе.
 *
 * Правило: в базе и в логике — копейки (целое число).
 *            В YooKassa — строка вида "300.00".
 *            На экране — отформатированные рубли.
 */

/** Сколько копеек в одном рубле. */
export const KOPECKS_PER_RUBLE = 100;

/**
 * Рубли (как в прайсе) -> копейки (как в базе).
 * Округляем, чтобы 19.99 * 100 не дало 1998.9999999999998.
 */
export function rublesToKopecks(rubles: number): number {
  return Math.round(rubles * KOPECKS_PER_RUBLE);
}

/** Копейки -> рубли для отображения. */
export function kopecksToRubles(kopecks: number): number {
  return kopecks / KOPECKS_PER_RUBLE;
}

/**
 * Копейки -> строка для API YooKassa: строго две цифры после запятой.
 * ЮKassa отклоняет запрос, если сумма передана как "300" или "300.5".
 */
export function kopecksToAmountValue(kopecks: number): string {
  return (kopecks / KOPECKS_PER_RUBLE).toFixed(2);
}

/**
 * Копейки -> строка для SQL/PostgREST: "300.00".
 * Тот же формат, что и у YooKassa, поэтому суммы можно сравнивать строкой.
 */
export function kopecksToNumericString(kopecks: number): string {
  return kopecksToAmountValue(kopecks);
}

/**
 * Сумма, фактически оплаченная по платежу (amount.value из ЮKassa), -> копейки.
 * Возвращает null, если строка не разобралась — это важно: мы не должны
 * считать оплату успешной, если не смогли распарсить сумму.
 */
export function amountValueToKopecks(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * KOPECKS_PER_RUBLE);
}

/** Копейки -> "300 ₽" для интерфейса. */
export function formatKopecks(kopecks: number): string {
  return `${kopecksToRubles(kopecks).toLocaleString("ru-RU", {
    minimumFractionDigits: kopecks % KOPECKS_PER_RUBLE === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} ₽`;
}