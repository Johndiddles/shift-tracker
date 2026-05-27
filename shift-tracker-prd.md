# Product Requirements Document

## ShiftTrack — Employee Shift Tracking Mobile Application

---

**Document Version:** 1.0
**Date:** May 25, 2026
**Author:** Senior Project Manager
**Status:** Draft — Pending Management & Engineering Review
**Distribution:** Management, Senior Mobile App Engineer

---

## 1. Executive Summary

Employees across the organization work across three daily rotating shifts and currently rely solely on the organization's central attendance sheet to validate their paychecks. When discrepancies arise between actual hours worked and hours reflected in a paycheck, employees have no independent record to support reconciliation. ShiftTrack is a mobile application that empowers each employee to personally log, track, and review their own shift history — including regular and overtime hours — and generate pay period summaries for reconciliation purposes.

---

## 2. Problem Statement

The organization operates three daily shifts:

| Shift     | Start Time | End Time           |
| --------- | ---------- | ------------------ |
| Morning   | 7:00 AM    | 3:00 PM            |
| Afternoon | 3:00 PM    | 11:00 PM           |
| Night     | 11:00 PM   | 7:00 AM (next day) |

Paychecks are processed every two weeks by the accounting department based on centrally maintained attendance sheets. Employees have reported discrepancies between actual shifts worked and shifts captured in their paychecks, with no personal records to substantiate their claims during reconciliation.

**Core pain points:**

- No employee-owned record of shifts worked
- No visibility into regular vs. overtime hours for the pay period
- No way to calculate expected pay independently before receiving a paycheck
- No exportable record to use during dispute resolution with HR or accounting

---

## 3. Goals and Objectives

**Primary Goals:**

1. Give every employee a simple, reliable way to log shifts they worked.
2. Enable employees to view a breakdown of hours worked (regular vs. overtime) for any pay period.
3. Provide an estimated pay calculation to help employees anticipate and verify their paychecks.
4. Allow employees to export shift records for a defined date range for reconciliation.

**Secondary Goals:**

1. Allow customization of shift schedules, pay rates, and pay period boundaries to accommodate variations across roles or departments.
2. Provide a foundation that can be extended to support additional payroll features in future versions.

**Out of Scope (v1.0):**

- Integration with the organization's payroll or HR systems
- Manager or admin dashboards
- Multi-employee views
- Real-time sync or cloud backup
- Push notification reminders to log shifts

---

## 4. Target Users

**Primary User:** Individual employees working rotating shifts within the organization.

**User Profile:**

- Works one or more of the three defined daily shifts per day
- May not be technically proficient; needs a simple, intuitive interface
- Uses a personal smartphone (iOS or Android)
- Wants to verify pay period totals before or after receiving a paycheck
- May work overtime and wants to know exactly how much to expect

---

## 5. Functional Requirements

### 5.1 Shift Logging

| ID    | Requirement                                                                                                                      | Priority    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| FR-01 | The user shall be able to add a new shift entry by selecting a date, a shift type (Morning / Afternoon / Night), and confirming. | Must Have   |
| FR-02 | Each shift entry shall display the date, shift name, start time, end time, and total hours worked.                               | Must Have   |
| FR-03 | The user shall be able to edit any previously logged shift entry.                                                                | Must Have   |
| FR-04 | The user shall be able to delete any previously logged shift entry.                                                              | Must Have   |
| FR-05 | The system shall prevent duplicate shift entries for the same date and shift type.                                               | Must Have   |
| FR-06 | The system shall support logging multiple shifts on the same date (e.g., a double shift).                                        | Should Have |

### 5.2 Shift History & Period View

| ID    | Requirement                                                                                                        | Priority  |
| ----- | ------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-07 | The user shall be able to view all logged shifts in a scrollable list sorted by date.                              | Must Have |
| FR-08 | The user shall be able to filter the shift list by a custom date range.                                            | Must Have |
| FR-09 | The user shall be able to view shifts filtered by the current or any historical pay period.                        | Must Have |
| FR-10 | The shift list shall clearly indicate which shifts fell within regular hours and which contributed overtime hours. | Must Have |

### 5.3 Pay Period Summary & Calculations

| ID    | Requirement                                                                                                                                                                             | Priority    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| FR-11 | The system shall calculate total hours worked for a selected period.                                                                                                                    | Must Have   |
| FR-12 | The system shall calculate regular hours (up to 40 hrs/week) and overtime hours (all hours beyond 40 hrs/week) for a selected period, applying weekly overtime rules across the period. | Must Have   |
| FR-13 | The summary screen shall display: total shifts, total hours, regular hours, overtime hours, estimated regular pay, estimated overtime pay, and estimated total pay.                     | Must Have   |
| FR-14 | Overtime shall be calculated on a weekly basis (Sunday–Saturday or user-configured start day), not a flat per-period calculation.                                                       | Must Have   |
| FR-15 | The user shall be able to view a per-week breakdown within a selected pay period.                                                                                                       | Should Have |

### 5.4 Export

| ID    | Requirement                                                                                                                                                                                                     | Priority    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| FR-16 | The user shall be able to export their shift log for a selected date range.                                                                                                                                     | Must Have   |
| FR-17 | The export shall be available in PDF format.                                                                                                                                                                    | Must Have   |
| FR-18 | The export shall be available in CSV format.                                                                                                                                                                    | Should Have |
| FR-19 | The exported file shall include: employee name (entered at setup), date range, each shift entry (date, shift, start time, end time, hours), regular hours total, overtime hours total, and estimated total pay. | Must Have   |
| FR-20 | The user shall be able to share the exported file via the native device share sheet (email, messaging apps, cloud storage, etc.).                                                                               | Must Have   |

### 5.5 Settings & Customization

| ID    | Requirement                                                                                                               | Priority     |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | ------------ |
| FR-21 | The user shall be able to view and edit the default start time for each of the three shift types.                         | Must Have    |
| FR-22 | The user shall be able to view and edit the duration (in hours) for each shift type.                                      | Must Have    |
| FR-23 | The user shall be able to set their regular hourly pay rate.                                                              | Must Have    |
| FR-24 | The user shall be able to set their overtime hourly pay rate.                                                             | Must Have    |
| FR-25 | The user shall be able to configure the pay period length (e.g., bi-weekly) and the start date of the current pay period. | Must Have    |
| FR-26 | The user shall be able to enter their name, which will appear on exported reports.                                        | Should Have  |
| FR-27 | The user shall be able to reset all settings to default values.                                                           | Nice to Have |

---

## 6. Non-Functional Requirements

| ID     | Requirement                                                                                              | Category       |
| ------ | -------------------------------------------------------------------------------------------------------- | -------------- |
| NFR-01 | The app shall be available on iOS (v15+) and Android (v10+).                                             | Platform       |
| NFR-02 | All shift data shall be stored locally on the user's device. No account or internet connection required. | Data & Privacy |
| NFR-03 | The app shall load and render the shift list within 1 second for up to 365 entries.                      | Performance    |
| NFR-04 | The UI shall be usable with one hand on a standard smartphone screen.                                    | Usability      |
| NFR-05 | The app shall not require user registration or login for core functionality.                             | Accessibility  |
| NFR-06 | All calculations (overtime, pay estimates) shall be accurate to two decimal places.                      | Accuracy       |
| NFR-07 | The app shall support both light and dark mode, following the device system setting.                     | UI             |
| NFR-08 | The app shall be available in English. Additional languages may be added in future versions.             | Localization   |

---

## 7. User Stories

**Epic 1: Shift Logging**

- As an employee, I want to log a shift I worked by selecting the date and shift type, so that I have a personal record of my attendance.
- As an employee, I want to edit a shift I logged incorrectly, so that my records stay accurate.
- As an employee, I want to delete a shift entry, so that I can remove mistakes or accidental duplicates.

**Epic 2: Viewing & Reviewing Shifts**

- As an employee, I want to view all my logged shifts for the current pay period, so I can monitor my hours in real time.
- As an employee, I want to see which of my hours are regular and which are overtime, so I know what to expect on my paycheck.

**Epic 3: Pay Summary**

- As an employee, I want to see a pay summary for the current pay period — broken down by regular and overtime pay — so I can anticipate my paycheck.
- As an employee, I want to view a per-week breakdown within a pay period, so I can understand exactly where my overtime hours accumulated.

**Epic 4: Export & Reconciliation**

- As an employee, I want to export my shift history as a PDF for a specific date range, so I can bring it to HR or accounting during a paycheck dispute.
- As an employee, I want to share the exported file via email directly from the app, so I can send it to my supervisor quickly.

**Epic 5: Settings**

- As an employee, I want to set my regular and overtime hourly rates, so the app reflects my actual compensation.
- As an employee, I want to customize the start time and duration of each shift, so the app matches my organization's actual shift schedule.
- As an employee, I want to set my pay period start date, so the app aligns with my organization's actual pay periods.

---

## 8. Screens & Navigation

### 8.1 Screen Inventory

| Screen                 | Description                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home / Shift List**  | Lists all logged shifts, filterable by date range or pay period. Shows a summary ribbon (total hours, overtime hours) for the selected period. |
| **Add / Edit Shift**   | Date picker + shift type selector (Morning / Afternoon / Night). Auto-fills start/end times from settings. Allows manual override.             |
| **Pay Period Summary** | Displays full breakdown: total hours, regular hours, overtime hours, estimated regular pay, overtime pay, total pay. Option to export.         |
| **Export**             | Date range selector + format selector (PDF / CSV). Preview and share.                                                                          |
| **Settings**           | Shift defaults (start time, duration per shift), pay rates (regular, overtime), pay period configuration, employee name.                       |

### 8.2 Navigation Structure

```
Bottom Navigation Bar
├── Shifts (Home)          → Shift List → Add/Edit Shift
├── Summary                → Pay Period Summary → Export
└── Settings               → Settings Screen
```

---

## 9. Data Model

### Shift Entry

```
ShiftEntry {
  id:           UUID
  date:         Date
  shiftType:    Enum [MORNING, AFTERNOON, NIGHT, CUSTOM]
  startTime:    Time
  endTime:      Time
  hoursWorked:  Float  (calculated)
  notes:        String (optional)
  createdAt:    DateTime
  updatedAt:    DateTime
}
```

### Settings

```
AppSettings {
  employeeName:           String
  morningShiftStart:      Time    (default: 07:00)
  morningShiftDuration:   Float   (default: 8.0 hrs)
  afternoonShiftStart:    Time    (default: 15:00)
  afternoonShiftDuration: Float   (default: 8.0 hrs)
  nightShiftStart:        Time    (default: 23:00)
  nightShiftDuration:     Float   (default: 8.0 hrs)
  regularHourlyRate:      Float
  overtimeHourlyRate:     Float
  payPeriodLengthDays:    Int     (default: 14)
  payPeriodStartDate:     Date
  weekStartDay:           Enum    (default: SUNDAY)
}
```

---

## 10. Business Rules

1. **Overtime Threshold:** Any hours worked beyond 40 hours in a single calendar week are classified as overtime. Overtime is calculated per week, not per pay period.
2. **Week Boundary:** The default week starts on Sunday. This shall be configurable in settings.
3. **Shift Duration:** If a shift crosses midnight (e.g., the Night shift: 11 PM – 7 AM), the date of the shift entry shall be the date on which the shift started.
4. **Default Shift Times:** The three default shifts are Morning (7 AM, 8 hrs), Afternoon (3 PM, 8 hrs), and Night (11 PM, 8 hrs). All three are fully configurable.
5. **Pay Estimates Disclaimer:** All pay calculations are estimates based on hours logged and user-entered rates. The app is not connected to payroll systems and does not account for deductions, taxes, or bonuses.
6. **Data Ownership:** All data resides on-device. The user is responsible for their own data backups.

---

## 11. Assumptions & Dependencies

**Assumptions:**

- Employees have personal iOS or Android smartphones.
- Employees will manually log their shifts — the app does not auto-detect clock-in/clock-out.
- A bi-weekly pay period is the standard, though it is configurable.
- The app is a personal tool; it does not need to sync with any organizational system in v1.0.

**Dependencies:**

- React Native or Flutter (cross-platform mobile framework — engineering team's discretion)
- Local storage: SQLite or equivalent embedded database
- PDF generation library for export functionality
- Device native share sheet for file sharing

---

## 12. Success Metrics

| Metric                                      | Target                                              |
| ------------------------------------------- | --------------------------------------------------- |
| Shift entry completion rate                 | > 90% of started entries are saved                  |
| Export usage                                | > 50% of users export at least once per pay period  |
| Calculation accuracy                        | Zero reported incorrect overtime/pay calculations   |
| App load time                               | < 1 second on mid-range devices                     |
| User-reported helpfulness in reconciliation | > 80% positive in post-launch survey (if conducted) |

---

## 13. Risks & Mitigations

| Risk                                                           | Likelihood | Impact | Mitigation                                                                                     |
| -------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| Users forget to log shifts in real time                        | High       | Medium | Consider optional end-of-day local notification reminder (v1.1 feature)                        |
| Incorrect pay rate configuration leads to misleading estimates | Medium     | Medium | Display prominent disclaimer on summary screen; prompt user to configure rates at first launch |
| Night shift crossing midnight causes date confusion            | Medium     | High   | Clearly document the date-assignment rule (shift start date); validate in QA                   |
| Data loss if phone is lost or reset                            | High       | High   | Add export-as-backup CTA; consider optional iCloud/Google Drive backup in v1.1                 |
| Overtime rule misunderstood (per period vs. per week)          | Medium     | Medium | Label and explain overtime calculation method clearly in-app                                   |

---

## 14. Release Phases

### Phase 1 — MVP (v1.0)

All Must Have requirements. Core shift logging, pay period summary, PDF export, and basic settings.
**Estimated Timeline:** 6–8 weeks (engineering estimate required)

### Phase 2 — Enhanced (v1.1)

Should Have requirements + optional local reminder notifications, per-week breakdown in summary, CSV export, iCloud/Google Drive backup.
**Estimated Timeline:** 3–4 weeks post v1.0

### Phase 3 — Future Considerations (v2.0)

- Optional cloud sync / multi-device support
- Organizational integration (read-only attendance verification)
- Manager view for team shift summaries

---

## 15. Approval & Sign-Off

| Role                       | Name | Signature | Date |
| -------------------------- | ---- | --------- | ---- |
| Project Manager            |      |           |      |
| Senior Mobile App Engineer |      |           |      |
| Department Manager         |      |           |      |
| HR / Payroll Stakeholder   |      |           |      |

---

_This document is version 1.0 and is subject to revision following stakeholder review. All changes will be tracked in subsequent versions._
