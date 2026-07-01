-- Usuarios de prueba en Supabase Auth (ejecutar una sola vez)
-- Passwords: Demo1234! (demo + rival), Admin1234! (admin)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DemoPlayer
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token, is_super_admin
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'demo@proleague.io',
  crypt('Demo1234!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nickname":"DemoPlayer"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000011',
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  jsonb_build_object(
    'sub', 'a0000000-0000-4000-8000-000000000001',
    'email', 'demo@proleague.io',
    'email_verified', true
  ),
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- ProLeague_Admin
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token, is_super_admin
) VALUES (
  'a0000000-0000-4000-8000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@proleague.io',
  crypt('Admin1234!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nickname":"ProLeague_Admin"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000012',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000002',
  jsonb_build_object(
    'sub', 'a0000000-0000-4000-8000-000000000002',
    'email', 'admin@proleague.io',
    'email_verified', true
  ),
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;

-- RivalFC
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token, is_super_admin
) VALUES (
  'a0000000-0000-4000-8000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'rival@proleague.io',
  crypt('Demo1234!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nickname":"RivalFC"}'::jsonb,
  NOW(), NOW(), '', '', '', '', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-4000-8000-000000000013',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000003',
  jsonb_build_object(
    'sub', 'a0000000-0000-4000-8000-000000000003',
    'email', 'rival@proleague.io',
    'email_verified', true
  ),
  'email', NOW(), NOW(), NOW()
) ON CONFLICT DO NOTHING;
