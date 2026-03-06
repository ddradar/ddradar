ALTER TABLE `charts` ADD `created_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `charts` ADD `updated_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `scores` ADD `created_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `scores` ADD `updated_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `songs` ADD `created_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `songs` ADD `updated_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `created_by` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_by` text DEFAULT 'system' NOT NULL;