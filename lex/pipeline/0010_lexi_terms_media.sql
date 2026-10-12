-- 0010_lexi_terms_media.sql
-- LEX media stack: scene-spec handoff fields on lexi_terms.
-- Location: M:\code\vidismart\lex\pipeline\0010_lexi_terms_media.sql
--
-- APPLY (Directus does NOT auto-run .sql migrations; apply manually via psql):
--   psql -U vidismart -d vidismart -v ON_ERROR_STOP=1 -f 0010_lexi_terms_media.sql
-- On 192.168.4.40 the file lives at /opt/vidismart/repo/database/migrations/ (needs sudo to copy).
-- After apply: Directus restart + redis FLUSHALL (same procedure as 0009).
-- Depends on: 0009_lexi_terms.sql (creates lexi_terms).
--
-- Directus v11 notes:
--   - directus_fields has NO `type` or `meta` columns; use interface/options/display/note.
--   - No unique constraint on (collection, field) -> ON CONFLICT arbiter is invalid;
--     idempotency is done via WHERE NOT EXISTS inside one transaction.

BEGIN;

-- 1) Columns. NOT NULL + DEFAULT is safe on existing rows (no table rewrite of data values).
ALTER TABLE lexi_terms
  ADD COLUMN IF NOT EXISTS scene_spec   jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lexi_terms' AND column_name='quality') THEN
    ALTER TABLE lexi_terms ADD COLUMN quality text NOT NULL DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lexi_terms' AND column_name='video_status') THEN
    ALTER TABLE lexi_terms ADD COLUMN video_status text NOT NULL DEFAULT 'none';
  END IF;
END $$;

-- 2) CHECK constraints applied separately (ADD COLUMN IF NOT EXISTS skips inline CHECKs
--    when the column already exists, so re-runs would leave the table unconstrained).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lexi_terms_quality_check') THEN
    ALTER TABLE lexi_terms ADD CONSTRAINT lexi_terms_quality_check
      CHECK (quality IN ('draft', 'standard', 'premium'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lexi_terms_video_status_check') THEN
    ALTER TABLE lexi_terms ADD CONSTRAINT lexi_terms_video_status_check
      CHECK (video_status IN ('none', 'drafting', 'pending_approval', 'approved',
                              'queued', 'rendering', 'finishing',
                              'published', 'rejected'));
  END IF;
END $$;

COMMENT ON COLUMN lexi_terms.scene_spec IS
  'LEX scene spec v1 (schemas/lexi-scene-spec-v1): locked draft from LTX Desktop (4090) delegated to H3 local (Miami B70). Orchestrator holds only this + job status.';
COMMENT ON COLUMN lexi_terms.quality IS
  'draft = LTX-only; standard = H3 default; premium = H3 max settings + ESRGAN/DAT upscale to 1080p.';
COMMENT ON COLUMN lexi_terms.video_status IS
  'Agentic workflow state: none -> drafting -> pending_approval -> approved -> queued -> rendering -> finishing -> published; rejected loops back to drafting.';

CREATE INDEX IF NOT EXISTS idx_lexi_terms_video_status_actionable
  ON lexi_terms (video_status)
  WHERE video_status IN ('approved', 'queued', 'rendering');

CREATE INDEX IF NOT EXISTS idx_lexi_terms_scene_spec_gin
  ON lexi_terms USING gin (scene_spec jsonb_path_ops);

-- 3) Directus studio metadata (v11 real columns; idempotent, no arbiter needed).
--    UI metadata only - does NOT widen public read (0009 published-only rule unchanged).
INSERT INTO directus_fields (collection, field, interface, options, display, note, hidden, sort, width)
SELECT 'lexi_terms', f.field, f.interface, f.options::json, f.display, f.note, false,
       ROW_NUMBER() OVER (ORDER BY f.ord) + 100, 'half'
FROM (VALUES
  ('scene_spec',   'input-code',       '{"note": "Scene spec v1 JSON (LTX draft -> H3 delegate)."}', 'raw'),
  ('quality',      'select-dropdown',  '{"choices": ["draft", "standard", "premium"]}', 'labels'),
  ('video_status', 'select-dropdown',  '{"choices": ["none", "drafting", "pending_approval", "approved", "queued", "rendering", "finishing", "published", "rejected"]}', 'labels')
) AS f(field, interface, options, display)
WHERE NOT EXISTS (
  SELECT 1 FROM directus_fields df
  WHERE df.collection = 'lexi_terms' AND df.field = f.field
);

COMMIT;
