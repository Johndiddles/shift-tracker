import {
  addDays,
  differenceInDays,
  differenceInMinutes,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { AppSettings, ShiftEntry } from "../store/useShiftStore";

/**
 * Calculate the number of hours worked between two timestamps.
 * Assumes startTime and endTime are ISO strings. If endTime is "before" startTime
 * but they are on the same date structurally, it implies it crosses midnight.
 */
export function calculateShiftHours(
  startTimeISO: string,
  endTimeISO: string,
): number {
  let start = parseISO(startTimeISO);
  let end = parseISO(endTimeISO);

  // Check if we need to add a day to end time (crossed midnight)
  if (end < start) {
    end = addDays(end, 1);
  }

  const minutes = differenceInMinutes(end, start);
  return minutes / 60.0;
}

/**
 * Get the start and end dates of the pay period containing the target date,
 * based on the anchor date and period length.
 */
export function getCurrentPayPeriodBounds(
  anchorDate: Date,
  lengthDays: number,
  targetDate: Date = new Date(),
): { start: Date; end: Date } {
  // Truncate times for day difference
  const anchor = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate(),
  );
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  const daysDiff = differenceInDays(target, anchor);

  // Calculate how many full periods have passed since anchor
  // If target is before anchor, this handles negative periods correctly
  const periodsPassed = Math.floor(daysDiff / lengthDays);

  const currentPeriodStart = addDays(anchor, periodsPassed * lengthDays);
  // Period end is lengthDays - 1 after start
  const currentPeriodEnd = addDays(currentPeriodStart, lengthDays - 1);

  return { start: currentPeriodStart, end: currentPeriodEnd };
}

export interface WeekSummary {
  weekStart: Date;
  weekEnd: Date;
  shifts: ShiftEntry[];
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  publicHolidayHours: number;
}

export interface PeriodSummary {
  totalShifts: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  publicHolidayHours: number;
  estimatedRegularPay: number;
  estimatedOvertimePay: number;
  estimatedPublicHolidayPay: number;
  estimatedTotalPay: number;
  weeks: WeekSummary[];
}

/**
 * Process a list of shifts to calculate regular and overtime hours
 * taking into account weekly boundaries. Overtime is > 40 hrs / week.
 */
export function calculatePeriodSummary(
  shifts: ShiftEntry[],
  periodStart: Date,
  periodEnd: Date,
  settings: AppSettings,
  publicHolidays: string[],
): PeriodSummary {
  // Filter shifts that fall within the period
  const periodShifts = shifts.filter((s) => {
    const d = parseISO(s.date);
    return isWithinInterval(d, { start: periodStart, end: periodEnd });
  });

  // Group shifts by week
  const weekMap = new Map<string, ShiftEntry[]>();

  periodShifts.forEach((s) => {
    const d = parseISO(s.date);
    const wStart = startOfWeek(d, { weekStartsOn: settings.weekStartDay });
    const key = wStart.toISOString();
    if (!weekMap.has(key)) {
      weekMap.set(key, []);
    }
    weekMap.get(key)!.push(s);
  });

  const weeks: WeekSummary[] = [];
  let totalPeriodHours = 0;
  let totalPeriodRegular = 0;
  let totalPeriodOvertime = 0;
  let totalPeriodPublicHoliday = 0;

  weekMap.forEach((weekShifts, weekStartISO) => {
    const wStart = parseISO(weekStartISO);
    const wEnd = endOfWeek(wStart, { weekStartsOn: settings.weekStartDay });

    const weekTotalHours = weekShifts.reduce(
      (acc, shift) => acc + shift.hoursWorked,
      0,
    );

    // Calculate public holiday hours separately if the setting is enabled
    let weekPublicHolidayHours = 0;
    if (settings.doublePayForPublicHolidays) {
      weekShifts.forEach((shift) => {
        let start = parseISO(shift.startTime);
        let end = parseISO(shift.endTime);
        const baseDate = parseISO(shift.date);

        start.setFullYear(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
        );
        end.setFullYear(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
        );

        if (end < start) end = addDays(end, 1);

        let current = new Date(start);
        while (current < end) {
          const nextMidnight = new Date(current);
          nextMidnight.setHours(24, 0, 0, 0);

          const segmentEnd = end < nextMidnight ? end : nextMidnight;
          const mins = differenceInMinutes(segmentEnd, current);
          const dateStr = format(current, "yyyy-MM-dd");

          if (publicHolidays.includes(dateStr)) {
            weekPublicHolidayHours += mins / 60.0;
          }

          current = nextMidnight;
        }
      });
    }

    // Normal hours (excluding public holiday hours to prevent double-dipping)
    const normalHours = Math.max(0, weekTotalHours - weekPublicHolidayHours);

    const regularHours = Math.min(normalHours, 40);
    const overtimeHours = Math.max(0, normalHours - 40);

    weeks.push({
      weekStart: wStart,
      weekEnd: wEnd,
      shifts: weekShifts,
      totalHours: weekTotalHours,
      regularHours,
      overtimeHours,
      publicHolidayHours: weekPublicHolidayHours,
    });

    totalPeriodHours += weekTotalHours;
    totalPeriodRegular += regularHours;
    totalPeriodOvertime += overtimeHours;
    totalPeriodPublicHoliday += weekPublicHolidayHours;
  });

  // Sort weeks chronologically
  weeks.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

  const estimatedRegularPay = totalPeriodRegular * settings.regularHourlyRate;
  const estimatedOvertimePay =
    totalPeriodOvertime * settings.overtimeHourlyRate;
  const estimatedPublicHolidayPay =
    totalPeriodPublicHoliday * (settings.regularHourlyRate * 2);

  return {
    totalShifts: periodShifts.length,
    totalHours: totalPeriodHours,
    regularHours: totalPeriodRegular,
    overtimeHours: totalPeriodOvertime,
    publicHolidayHours: totalPeriodPublicHoliday,
    estimatedRegularPay,
    estimatedOvertimePay,
    estimatedPublicHolidayPay,
    estimatedTotalPay:
      estimatedRegularPay + estimatedOvertimePay + estimatedPublicHolidayPay,
    weeks,
  };
}

export function generatePDFHtml(
  shifts: ShiftEntry[],
  summary: PeriodSummary,
  periodStart: Date,
  periodEnd: Date,
  settings: AppSettings,
  publicHolidays: string[],
): string {
  const formatTime = (iso: string) => format(parseISO(iso), "h:mm a");
  const formatDate = (iso: string) => format(parseISO(iso), "MMM d, yyyy");

  // Sort shifts chronologically
  const sortedShifts = [...shifts].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
  );

  const shiftRows = sortedShifts
    .map(
      (s) => `
    <tr>
      <td>${formatDate(s.date)}</td>
      <td>${s.shiftType}</td>
      <td>${formatTime(s.startTime)} - ${formatTime(s.endTime)}</td>
      <td>${s.hoursWorked.toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <html>
      <head>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e3a8a; }
          .header { margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .summary-grid { display: flex; flex-wrap: wrap; gap: 20px; }
          .summary-item { flex: 1; min-width: 120px; }
          .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .summary-value { font-size: 18px; font-weight: bold; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; font-weight: 600; color: #374151; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Pay Period Summary</h1>
          <p><strong>Employee:</strong> ${settings.employeeName || "Unknown Employee"}</p>
          <p><strong>Period:</strong> ${format(periodStart, "MMM d, yyyy")} - ${format(
            periodEnd,
            "MMM d, yyyy",
          )}</p>
        </div>

        <div class="summary-card">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Hours</div>
              <div class="summary-value">${summary.totalHours.toFixed(2)} hrs</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Regular Hours</div>
              <div class="summary-value">${summary.regularHours.toFixed(2)} hrs</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Overtime Hours</div>
              <div class="summary-value">${summary.overtimeHours.toFixed(2)} hrs</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Holiday Hours</div>
              <div class="summary-value">${summary.publicHolidayHours.toFixed(2)} hrs</div>
            </div>
          </div>
          <div class="summary-grid" style="margin-top: 15px;">
            <div class="summary-item">
              <div class="summary-label">Estimated Regular Pay</div>
              <div class="summary-value">$${summary.estimatedRegularPay.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Estimated Overtime Pay</div>
              <div class="summary-value">$${summary.estimatedOvertimePay.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Estimated Holiday Pay</div>
              <div class="summary-value">$${summary.estimatedPublicHolidayPay.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Estimated Total Pay</div>
              <div class="summary-value" style="color: #047857;">$${summary.estimatedTotalPay.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <h2>Shift Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Time</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            ${shiftRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}
