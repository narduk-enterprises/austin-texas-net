-- Content Pipeline: config + run history tables
-- Stores AI content generation configuration and execution logs

CREATE TABLE `content_pipeline_topics` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category_slug` text NOT NULL,
  `category_label` text NOT NULL,
  `topic_key` text NOT NULL,
  `topic_label` text NOT NULL,
  `content_type` text NOT NULL,
  `spot_file` text NOT NULL,
  `max_spots` integer NOT NULL DEFAULT 10,
  `search_queries` text NOT NULL DEFAULT '[]',
  `body_system_prompt` text,
  `faq_system_prompt` text,
  `enabled` integer NOT NULL DEFAULT 1,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE UNIQUE INDEX `content_pipeline_topics_category_topic_unique`
  ON `content_pipeline_topics` (`category_slug`, `topic_key`);

CREATE TABLE `content_pipeline_runs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category_slug` text NOT NULL,
  `topic_key` text,
  `status` text NOT NULL DEFAULT 'pending',
  `spots_generated` integer DEFAULT 0,
  `tokens_used` integer DEFAULT 0,
  `output_preview` text,
  `error` text,
  `started_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `completed_at` text
);

CREATE INDEX `content_pipeline_runs_category_idx`
  ON `content_pipeline_runs` (`category_slug`);
CREATE INDEX `content_pipeline_runs_status_idx`
  ON `content_pipeline_runs` (`status`);
