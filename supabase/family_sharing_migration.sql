-- Family Sharing Migration
-- Run this in Supabase SQL Editor AFTER the original migration.sql

-- 1. Add family_id to families table
ALTER TABLE families ADD COLUMN family_id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE families ADD CONSTRAINT families_family_id_key UNIQUE(family_id);

-- 2. Add family_id to schedules table (nullable initially for backfill)
ALTER TABLE schedules ADD COLUMN family_id uuid;

-- 3. Backfill schedules.family_id from families
UPDATE schedules s SET family_id = f.family_id
FROM families f WHERE f.user_id = s.user_id;

-- 4. Create family_members junction table
CREATE TABLE family_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)  -- a user can only belong to one family
);

-- 5. Backfill: migrate existing users into family_members as owners
INSERT INTO family_members (family_id, user_id, role)
SELECT family_id, user_id, 'owner' FROM families;

-- 6. Create family_invites table
CREATE TABLE family_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL
);

-- 7. Change schedules constraints: family_id NOT NULL, unique on family_id instead of user_id
-- For any schedules without a family_id (shouldn't exist after backfill, but safety), delete them
DELETE FROM schedules WHERE family_id IS NULL;
ALTER TABLE schedules ALTER COLUMN family_id SET NOT NULL;
ALTER TABLE schedules DROP CONSTRAINT schedules_user_id_key;
ALTER TABLE schedules ADD CONSTRAINT schedules_family_id_key UNIQUE(family_id);

-- 8. Drop old unique constraint on families.user_id (user_id stays as column but not unique)
ALTER TABLE families DROP CONSTRAINT families_user_id_key;

-- 9. RLS for family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own membership"
  ON family_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read co-members"
  ON family_members FOR SELECT
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Members can insert into own family"
  ON family_members FOR INSERT
  WITH CHECK (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Owners can delete members"
  ON family_members FOR DELETE
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid() AND fm.role = 'owner'));

-- 10. RLS for family_invites
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read invites for own family"
  ON family_invites FOR SELECT
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Members can create invites for own family"
  ON family_invites FOR INSERT
  WITH CHECK (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Members can update invites for own family"
  ON family_invites FOR UPDATE
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

-- 11. Update families RLS: access by family membership
DROP POLICY IF EXISTS "Users can read own family" ON families;
DROP POLICY IF EXISTS "Users can insert own family" ON families;
DROP POLICY IF EXISTS "Users can update own family" ON families;
DROP POLICY IF EXISTS "Users can delete own family" ON families;

CREATE POLICY "Members can read family"
  ON families FOR SELECT
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Anyone can insert family"
  ON families FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update family"
  ON families FOR UPDATE
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

-- 12. Update schedules RLS: access by family membership
DROP POLICY IF EXISTS "Users can read own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;

CREATE POLICY "Members can read schedule"
  ON schedules FOR SELECT
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Members can insert schedule"
  ON schedules FOR INSERT
  WITH CHECK (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Members can update schedule"
  ON schedules FOR UPDATE
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));

CREATE POLICY "Members can delete schedule"
  ON schedules FOR DELETE
  USING (family_id IN (SELECT fm.family_id FROM family_members fm WHERE fm.user_id = auth.uid()));
