-- Flags app: feature flags with per-environment rollout.
CREATE SCHEMA flags;

CREATE TABLE flags.feature_flags (
    id             serial PRIMARY KEY,
    name           text NOT NULL,
    environment    text NOT NULL CHECK (environment IN ('dev', 'staging', 'prod')),
    rollout_percent int NOT NULL DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
    enabled        boolean NOT NULL DEFAULT false,
    updated_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (name, environment)
);

-- ~30 rows across dev/staging/prod
INSERT INTO flags.feature_flags (name, environment, rollout_percent, enabled) VALUES
    ('new-checkout-flow',       'dev',     100, true),
    ('new-checkout-flow',       'staging',  50, true),
    ('new-checkout-flow',       'prod',     10, true),
    ('dark-mode',               'dev',     100, true),
    ('dark-mode',               'staging', 100, true),
    ('dark-mode',               'prod',      0, false),
    ('recommendation-engine',   'dev',      80, true),
    ('recommendation-engine',   'staging',  25, true),
    ('recommendation-engine',   'prod',      0, false),
    ('sso-login',               'dev',     100, true),
    ('sso-login',               'staging',  75, true),
    ('sso-login',               'prod',      5, true),
    ('batch-email-sender',      'dev',     100, false),
    ('batch-email-sender',      'staging',  40, true),
    ('batch-email-sender',      'prod',     20, true),
    ('new-dashboard-v2',        'dev',      90, true),
    ('new-dashboard-v2',        'staging',  60, true),
    ('new-dashboard-v2',        'prod',     30, true),
    ('api-rate-limits',         'dev',     100, true),
    ('api-rate-limits',         'staging', 100, true),
    ('api-rate-limits',         'prod',    100, true),
    ('inventory-sync',          'dev',      50, true),
    ('inventory-sync',          'staging',  50, false),
    ('inventory-sync',          'prod',      0, false),
    ('one-click-reorder',       'dev',      70, true),
    ('one-click-reorder',       'staging',  15, true),
    ('one-click-reorder',       'prod',      0, false),
    ('fraud-scoring-v3',        'dev',     100, true),
    ('fraud-scoring-v3',        'staging',  80, true),
    ('fraud-scoring-v3',        'prod',     45, true);
