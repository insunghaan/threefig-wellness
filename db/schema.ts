import { sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";

export const signalRecords = sqliteTable(
  "signal_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    metricId: text("metric_id").notNull(),
    value: real("value").notNull(),
    observedAt: text("observed_at").notNull(),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("idx_signal_user_metric_date").on(t.userId, t.metricId, t.observedAt),
  ],
);

export const skinRecords = sqliteTable(
  "skin_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    observedAt: text("observed_at").notNull(),
    area: text("area").notNull(),
    feeling: text("feeling").notNull(),
    routine: text("routine").notNull(),
    note: text("note").notNull().default(""),
    photoKey: text("photo_key").notNull(),
    analysis: text("analysis").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("idx_skin_user_date").on(t.userId, t.observedAt)],
);

export const waitlistSignups = sqliteTable("waitlist_signups", {
  email: text("email").primaryKey(),
  source: text("source").notNull().default("landing"),
  consentVersion: text("consent_version").notNull().default("2026-09-10"),
  createdAt: text("created_at").notNull(),
  deliveredAt: text("delivered_at"),
}, (t) => [index("idx_waitlist_delivery_created").on(t.deliveredAt, t.createdAt)]);
