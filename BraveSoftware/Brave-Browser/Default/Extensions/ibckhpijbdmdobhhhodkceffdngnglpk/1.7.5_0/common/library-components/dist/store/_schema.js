import { entitySchema } from '../../../../node_modules/@rocicorp/rails/out/index.js';
import mod from '../../../../node_modules/zod/lib/index.mjs.js';

const articleSchema = entitySchema.extend({
  url: mod.string(),
  title: mod.nullable(mod.string()),
  word_count: mod.number(),
  publication_date: mod.nullable(mod.string()),
  time_added: mod.number(),
  time_updated: mod.optional(mod.number()),
  reading_progress: mod.number(),
  is_favorite: mod.boolean(),
  is_queued: mod.optional(mod.boolean()),
  is_temporary: mod.optional(mod.boolean()),
  is_new: mod.optional(mod.boolean()),
  topic_id: mod.nullable(mod.string()),
  queue_sort_position: mod.optional(mod.number()),
  recency_sort_position: mod.optional(mod.number()),
  topic_sort_position: mod.optional(mod.number()),
  domain_sort_position: mod.optional(mod.number()),
  favorites_sort_position: mod.optional(mod.nullable(mod.number())),
  annotation_count: mod.optional(mod.number()),
  description: mod.optional(mod.string()),
  pocket_id: mod.optional(mod.string()) // remote id if synced with Pocket

}); // *** Topic ***

const topicSchema = entitySchema.extend({
  name: mod.string(),
  emoji: mod.nullable(mod.string()),
  group_id: mod.nullable(mod.string())
}); // *** ArticleText ***

const articleTextSchema = entitySchema.extend({
  title: mod.nullable(mod.string()),
  paragraphs: mod.array(mod.string())
}); // *** ArticleLink ***

const articleLinkSchema = entitySchema.extend({
  source: mod.string(),
  target: mod.string(),
  type: mod.enum(["sim"]),
  score: mod.optional(mod.number())
}); // *** Annotation ***

const annotationSchema = entitySchema.extend({
  article_id: mod.string(),
  quote_text: mod.optional(mod.string()),
  quote_html_selector: mod.optional(mod.any()),
  created_at: mod.number(),
  updated_at: mod.optional(mod.number()),
  text: mod.optional(mod.string()),
  tags: mod.optional(mod.array(mod.string())),
  is_favorite: mod.optional(mod.boolean()),
  ai_created: mod.optional(mod.boolean()),
  ai_score: mod.optional(mod.number()),
  h_id: mod.optional(mod.string()) // remote id if synced with hypothesis

}); // *** PartialSyncState ***

const PARTIAL_SYNC_STATE_KEY = "control/partialSync";
const partialSyncStateSchema = mod.union([mod.object({
  // full-text entries may lag behind article version
  minVersion: mod.number(),
  maxVersion: mod.number(),
  endKey: mod.string()
}), mod.literal("PARTIAL_SYNC_COMPLETE")]); // *** Setting ***

mod.object({
  tutorial_stage: mod.optional(mod.number()),
  seen_settings_version: mod.optional(mod.number()),
  seen_highlights_version: mod.optional(mod.number())
});

mod.object({
  id: mod.string(),
  name: mod.optional(mod.string()),
  accountEnabled: mod.optional(mod.boolean()),
  signinProvider: mod.optional(mod.enum(["email", "google", "github"])),
  email: mod.optional(mod.string()),
  aiEnabled: mod.optional(mod.boolean()),
  stripeId: mod.optional(mod.string())
}); // *** FeedSubscription ***

const feedSubscriptionSchema = entitySchema.extend({
  // id equal to rss_url
  rss_url: mod.string(),
  link: mod.string(),
  domain: mod.string(),
  title: mod.optional(mod.string()),
  description: mod.optional(mod.string()),
  author: mod.optional(mod.string()),
  post_frequency: mod.optional(mod.object({
    count: mod.number(),
    per_week: mod.optional(mod.number()),
    period: mod.enum(["day", "week", "month", "year"])
  })),
  time_added: mod.number(),
  is_subscribed: mod.optional(mod.boolean()),
  last_fetched: mod.optional(mod.number())
}); // *** SyncState ***

const syncStateSchema = mod.object({
  id: mod.enum(["pocket", "hypothesis"]),
  username: mod.optional(mod.string()),
  api_token: mod.string(),
  is_syncing: mod.optional(mod.boolean()),
  last_download: mod.optional(mod.number()),
  last_upload: mod.optional(mod.number()) // unix milliseconds

});

export { PARTIAL_SYNC_STATE_KEY, annotationSchema, articleLinkSchema, articleSchema, articleTextSchema, feedSubscriptionSchema, partialSyncStateSchema, syncStateSchema, topicSchema };
