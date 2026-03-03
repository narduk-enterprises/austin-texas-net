CREATE TABLE `bluebonnet_observations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `inat_id` integer NOT NULL,
  `lat` real NOT NULL,
  `lng` real NOT NULL,
  `observed_on` text NOT NULL,
  `photo_url` text,
  `observer` text NOT NULL,
  `place` text NOT NULL,
  `url` text NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE UNIQUE INDEX `bluebonnet_observations_inat_id_unique` ON `bluebonnet_observations` (`inat_id`);
CREATE INDEX `bluebonnet_observations_observed_on_idx` ON `bluebonnet_observations` (`observed_on`);
