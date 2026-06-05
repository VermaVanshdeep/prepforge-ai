/**
 * Formats a percentage value for the dashboard.
 * If value is null, undefined, or strictly NaN, it returns "N/A".
 * Positive values get a "+" prefix.
 * Negative values get a "-" prefix.
 * All numeric values get a "%" suffix.
 * 
 * @example
 * formatPercentage(12) // "+12%"
 * formatPercentage(-5) // "-5%"
 * formatPercentage(0) // "0%"
 * formatPercentage(null) // "N/A"
 * formatPercentage(undefined) // "N/A"
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  // Ensure it's a number and round it
  const numValue = Math.round(Number(value));

  if (numValue > 0) {
    return `+${numValue}%`;
  }
  
  return `${numValue}%`;
}
