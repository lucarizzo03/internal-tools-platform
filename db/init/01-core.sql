-- Core platform schema: users, roles, permissions, audit log.
-- Loaded automatically by postgres's /docker-entrypoint-initdb.d on first boot.

CREATE SCHEMA core;

CREATE TABLE core.users (
    id    serial PRIMARY KEY,
    name  text UNIQUE NOT NULL,
    email text UNIQUE NOT NULL
);

CREATE TABLE core.roles (
    id   serial PRIMARY KEY,
    name text UNIQUE NOT NULL
);

CREATE TABLE core.permissions (
    id  serial PRIMARY KEY,
    key text UNIQUE NOT NULL
);

CREATE TABLE core.user_roles (
    user_id int NOT NULL REFERENCES core.users (id),
    role_id int NOT NULL REFERENCES core.roles (id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE core.role_permissions (
    role_id       int NOT NULL REFERENCES core.roles (id),
    permission_id int NOT NULL REFERENCES core.permissions (id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE core.audit_log (
    id         bigserial PRIMARY KEY,
    user_id    int REFERENCES core.users (id),
    app        text NOT NULL,
    action     text NOT NULL,
    target     text NOT NULL,
    detail     jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Read model for the audit page: joins user names, extracts allowed/denied.
CREATE VIEW core.v_audit_log AS
SELECT al.id,
       u.name                                     AS user_name,
       al.app,
       al.action,
       al.target,
       (al.detail ->> 'allowed')::boolean         AS allowed,
       al.created_at
FROM core.audit_log al
LEFT JOIN core.users u ON u.id = al.user_id;

-- Permissions
INSERT INTO core.permissions (key) VALUES
    ('flags.write'),
    ('refunds.approve');

-- Roles
INSERT INTO core.roles (name) VALUES
    ('flag-operator'),
    ('refund-operator'),
    ('admin');

-- Users
INSERT INTO core.users (name, email) VALUES
    ('flag-ops',   'flag-ops@example.com'),
    ('refund-ops', 'refund-ops@example.com'),
    ('admin',      'admin@example.com');

-- Grants: flag-ops -> flags.write, refund-ops -> refunds.approve, admin -> both
INSERT INTO core.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM core.users u
JOIN core.roles r ON r.name = 'flag-operator'
WHERE u.name = 'flag-ops';

INSERT INTO core.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM core.users u
JOIN core.roles r ON r.name = 'refund-operator'
WHERE u.name = 'refund-ops';

INSERT INTO core.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM core.users u
JOIN core.roles r ON r.name = 'admin'
WHERE u.name = 'admin';

INSERT INTO core.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM core.roles r
JOIN core.permissions p ON p.key = 'flags.write'
WHERE r.name IN ('flag-operator', 'admin');

INSERT INTO core.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM core.roles r
JOIN core.permissions p ON p.key = 'refunds.approve'
WHERE r.name IN ('refund-operator', 'admin');
