import { format, parseISO } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppSettings, ShiftEntry } from "../store/useShiftStore";
import { PeriodSummary } from "../utils/calculations";

interface ReportViewProps {
  shifts: ShiftEntry[];
  summary: PeriodSummary;
  periodStart: Date;
  periodEnd: Date;
  settings: AppSettings;
}

export const ReportView = React.forwardRef<View, ReportViewProps>(
  ({ shifts, summary, periodStart, periodEnd, settings }, ref) => {
    const formatTime = (iso: string) => format(parseISO(iso), "h:mm a");
    const formatDate = (iso: string) => format(parseISO(iso), "MMM d, yyyy");

    const sortedShifts = [...shifts].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    );

    return (
      <View
        ref={ref}
        style={styles.container}
        collapsable={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pay Period Summary</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>Employee:</Text>
            <Text style={styles.headerValue}>
              {settings.employeeName || "Unknown Employee"}
            </Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>Period:</Text>
            <Text style={styles.headerValue}>
              {format(periodStart, "MMM d, yyyy")} -{" "}
              {format(periodEnd, "MMM d, yyyy")}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Hours</Text>
              <Text style={styles.summaryValue}>
                {summary.totalHours.toFixed(2)} hrs
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Regular Hours</Text>
              <Text style={styles.summaryValue}>
                {summary.regularHours.toFixed(2)} hrs
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Overtime Hours</Text>
              <Text style={styles.summaryValue}>
                {summary.overtimeHours.toFixed(2)} hrs
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Holiday Hours</Text>
              <Text style={styles.summaryValue}>
                {summary.publicHolidayHours.toFixed(2)} hrs
              </Text>
            </View>
          </View>

          <View style={[styles.summaryGrid, { marginTop: 15 }]}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Estimated Regular Pay</Text>
              <Text style={styles.summaryValue}>
                ${summary.estimatedRegularPay.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Estimated Overtime Pay</Text>
              <Text style={styles.summaryValue}>
                ${summary.estimatedOvertimePay.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Estimated Holiday Pay</Text>
              <Text style={styles.summaryValue}>
                ${summary.estimatedPublicHolidayPay.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Estimated Total Pay</Text>
              <Text style={[styles.summaryValue, { color: "#047857" }]}>
                ${summary.estimatedTotalPay.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Shift Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Shift</Text>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Time</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Hours</Text>
          </View>
          {sortedShifts.map((s, idx) => (
            <View
              key={s.id || idx}
              style={[
                styles.tableRow,
                idx === sortedShifts.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {formatDate(s.date)}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{s.shiftType}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {formatTime(s.startTime)} - {formatTime(s.endTime)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {s.hoursWorked.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: 800,
    backgroundColor: "#ffffff",
    padding: 32,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  headerLabel: {
    fontWeight: "bold",
    color: "#374151",
    width: 100,
    fontSize: 16,
  },
  headerValue: {
    color: "#374151",
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: "#f3f4f6",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableCell: {
    color: "#374151",
    fontSize: 14,
  },
});
