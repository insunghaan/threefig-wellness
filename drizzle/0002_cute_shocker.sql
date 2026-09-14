ALTER TABLE `waitlist_signups` ADD `delivered_at` text;--> statement-breakpoint
CREATE INDEX `idx_waitlist_delivery_created` ON `waitlist_signups` (`delivered_at`,`created_at`);