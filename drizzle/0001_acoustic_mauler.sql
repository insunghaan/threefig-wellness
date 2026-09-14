CREATE TABLE `waitlist_signups` (
	`email` text PRIMARY KEY NOT NULL,
	`source` text DEFAULT 'landing' NOT NULL,
	`consent_version` text DEFAULT '2026-09-10' NOT NULL,
	`created_at` text NOT NULL
);
