CREATE TABLE `charts` (
	`id` text NOT NULL,
	`play_style` integer NOT NULL,
	`difficulty` integer NOT NULL,
	`bpm` text NOT NULL,
	`level` integer NOT NULL,
	`notes` integer,
	`freezes` integer,
	`shocks` integer DEFAULT 0,
	`radar` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	PRIMARY KEY(`id`, `play_style`, `difficulty`),
	FOREIGN KEY (`id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_style_level` ON `charts` (`play_style`,`level`);--> statement-breakpoint
CREATE TABLE `scores` (
	`song_id` text NOT NULL,
	`play_style` integer NOT NULL,
	`difficulty` integer NOT NULL,
	`user_id` text NOT NULL,
	`normal_score` integer NOT NULL,
	`ex_score` integer,
	`max_combo` integer,
	`clear_lamp` integer NOT NULL,
	`rank` text NOT NULL,
	`flare_rank` integer NOT NULL,
	`flare_skill` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	PRIMARY KEY(`song_id`, `play_style`, `difficulty`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_kana` text NOT NULL,
	`name_index` integer GENERATED ALWAYS AS (CASE
      WHEN name_kana GLOB '[ぁ-おゔ]*' THEN 0
      WHEN name_kana GLOB '[か-ごゕ-ゖ]*' THEN 1
      WHEN name_kana GLOB '[さ-ぞ]*' THEN 2
      WHEN name_kana GLOB '[た-ど]*' THEN 3
      WHEN name_kana GLOB '[な-の]*' THEN 4
      WHEN name_kana GLOB '[は-ぽ]*' THEN 5
      WHEN name_kana GLOB '[ま-も]*' THEN 6
      WHEN name_kana GLOB '[ゃ-よ]*' THEN 7
      WHEN name_kana GLOB '[ら-ろ]*' THEN 8
      WHEN name_kana GLOB '[ゎ-ん]*' THEN 9
      WHEN name_kana GLOB '[aA]*' THEN 10
      WHEN name_kana GLOB '[bB]*' THEN 11
      WHEN name_kana GLOB '[cC]*' THEN 12
      WHEN name_kana GLOB '[dD]*' THEN 13
      WHEN name_kana GLOB '[eE]*' THEN 14
      WHEN name_kana GLOB '[fF]*' THEN 15
      WHEN name_kana GLOB '[gG]*' THEN 16
      WHEN name_kana GLOB '[hH]*' THEN 17
      WHEN name_kana GLOB '[iI]*' THEN 18
      WHEN name_kana GLOB '[jJ]*' THEN 19
      WHEN name_kana GLOB '[kK]*' THEN 20
      WHEN name_kana GLOB '[lL]*' THEN 21
      WHEN name_kana GLOB '[mM]*' THEN 22
      WHEN name_kana GLOB '[nN]*' THEN 23
      WHEN name_kana GLOB '[oO]*' THEN 24
      WHEN name_kana GLOB '[pP]*' THEN 25
      WHEN name_kana GLOB '[qQ]*' THEN 26
      WHEN name_kana GLOB '[rR]*' THEN 27
      WHEN name_kana GLOB '[sS]*' THEN 28
      WHEN name_kana GLOB '[tT]*' THEN 29
      WHEN name_kana GLOB '[uU]*' THEN 30
      WHEN name_kana GLOB '[vV]*' THEN 31
      WHEN name_kana GLOB '[wW]*' THEN 32
      WHEN name_kana GLOB '[xX]*' THEN 33
      WHEN name_kana GLOB '[yY]*' THEN 34
      WHEN name_kana GLOB '[zZ]*' THEN 35
      ELSE 36
    END) VIRTUAL NOT NULL,
	`artist` text NOT NULL,
	`bpm` text,
	`series` text NOT NULL,
	`series_category` text GENERATED ALWAYS AS (CASE
      WHEN series IN (
        'DDR 1st',
        'DDR 2ndMIX',
        'DDR 3rdMIX',
        'DDR 4thMIX',
        'DDR 5thMIX',
        'DDRMAX',
        'DDRMAX2',
        'DDR EXTREME',
        'DDR SuperNOVA',
        'DDR SuperNOVAA2',
        'DDR X',
        'DDR X2',
        'DDR X3 VS 2ndMIX'
      ) THEN 'CLASSIC'
      WHEN series IN ('DDR (2013)', 'DDR (2014)', 'DDR A') THEN 'WHITE'
      ELSE 'GOLD'
    END) VIRTUAL NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer DEFAULT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_name` ON `songs` (`name_index`,`name_kana`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`is_public` integer NOT NULL,
	`area` integer NOT NULL,
	`ddr_code` integer,
	`roles` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer DEFAULT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_provider` ON `users` (`provider`,`provider_id`);