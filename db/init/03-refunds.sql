-- Refunds app: refund requests with a single-approver decision.
CREATE SCHEMA refunds;

CREATE TABLE refunds.refund_requests (
    id         serial PRIMARY KEY,
    customer   text NOT NULL,
    amount     numeric(10, 2) NOT NULL CHECK (amount > 0),
    reason     text NOT NULL,
    status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'denied')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ~30 rows, mixed statuses
INSERT INTO refunds.refund_requests (customer, amount, reason, status, created_at) VALUES
    ('Acme Corp',          249.99, 'Duplicate charge',            'pending',  now() - interval '32 days'),
    ('Globex Inc',          89.50, 'Item never arrived',          'approved', now() - interval '31 days'),
    ('Initech',            420.00, 'Service outage',              'pending',  now() - interval '30 days'),
    ('Umbrella Co',         59.99, 'Changed mind',                'denied',   now() - interval '29 days'),
    ('Stark Industries',  1299.00, 'Wrong item shipped',          'approved', now() - interval '28 days'),
    ('Wayne Enterprises',   175.25, 'Billing error',              'pending',  now() - interval '27 days'),
    ('Hooli',               38.75, 'Item defective',              'approved', now() - interval '26 days'),
    ('Pied Piper',         510.00, 'Subscription renewed early',  'pending',  now() - interval '25 days'),
    ('Massive Dynamic',     92.40, 'Duplicate charge',            'denied',   now() - interval '24 days'),
    ('Cyberdyne Systems',  760.00, 'Order cancelled late',        'pending',  now() - interval '23 days'),
    ('Aperture Labs',       45.00, 'Item never arrived',          'approved', now() - interval '22 days'),
    ('Tyrell Corp',        199.99, 'Quality not as described',    'pending',  now() - interval '21 days'),
    ('Oscorp',              82.10, 'Changed mind',                'approved', now() - interval '20 days'),
    ('Wonka Industries',   640.75, 'Wrong item shipped',          'pending',  now() - interval '19 days'),
    ('Soylent Corp',       129.99, 'Service outage',              'denied',   now() - interval '18 days'),
    ('Gringotts Bank',     315.50, 'Billing error',               'pending',  now() - interval '17 days'),
    ('Weasley Goods',       24.99, 'Item defective',              'approved', now() - interval '16 days'),
    ('Duff Beer',          555.00, 'Duplicate charge',            'pending',  now() - interval '15 days'),
    ('Krusty Co',           71.20, 'Order cancelled late',        'denied',   now() - interval '14 days'),
    ('Nakatomi Trading',   890.00, 'Item never arrived',          'approved', now() - interval '13 days'),
    ('Nakatomi Trading',   120.00, 'Changed mind',                'pending',  now() - interval '12 days'),
    ('Oceanic Airlines',   430.60, 'Service outage',              'pending',  now() - interval '11 days'),
    ('Dharma Initiative',   55.99, 'Quality not as described',    'denied',   now() - interval '10 days'),
    ('Bluth Company',      205.75, 'Billing error',               'approved', now() - interval '9 days'),
    ('Gekko & Co',         999.99, 'Wrong item shipped',          'pending',  now() - interval '8 days'),
    ('Prestige Worldwide',  48.30, 'Item defective',              'pending',  now() - interval '7 days'),
    ('Vandelay Industries',160.00, 'Duplicate charge',            'approved', now() - interval '6 days'),
    ('Very Big Corp',      275.45, 'Subscription renewed early',  'pending',  now() - interval '5 days'),
    ('Spacely Sprockets',   33.80, 'Changed mind',                'pending',  now() - interval '4 days'),
    ('Acme Corp',          149.99, 'Item never arrived',          'pending',  now() - interval '3 days');
