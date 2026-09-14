CREATE TABLE `signal_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`metric_id` text NOT NULL,
	`value` real NOT NULL,
	`observed_at` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_signal_user_metric_date` ON `signal_records` (`user_id`,`metric_id`,`observed_at`);--> statement-breakpoint
CREATE TABLE `skin_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`observed_at` text NOT NULL,
	`area` text NOT NULL,
	`feeling` text NOT NULL,
	`routine` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`photo_key` text NOT NULL,
	`analysis` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_skin_user_date` ON `skin_records` (`user_id`,`observed_at`);