-- Fix RLS infinite recursion on family_members
-- The original policies queried family_members FROM WITHIN family_members RLS policies,
-- causing "infinite recursion detected in policy for relation family_members".
-- Fix: use a SECURITY DEFINER function to bypass RLS for the family_id lookup.

-- Step 1: Create helper function (bypasses RLS)
CREATE OR REPLACE FUNCTION get_my_family_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM family_members WHERE user_id = auth.uid() LIMIT 1
$$;

-- Step 2: Fix family_members policies
DROP POLICY IF EXISTS "Users can read co-members" ON family_members;
DROP POLICY IF EXISTS "Members can insert into own family" ON family_members;
DROP POLICY IF EXISTS "Owners can delete members" ON family_members;

CREATE POLICY "Users can read co-members"
  ON family_members FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "Members can insert into own family"
  ON family_members FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Owners can delete members"
  ON family_members FOR DELETE
  USING (family_id = get_my_family_id()
    AND EXISTS (SELECT 1 FROM family_members WHERE user_id = auth.uid() AND role = 'owner' AND family_id = get_my_family_id()));

-- Step 3: Fix family_invites policies
DROP POLICY IF EXISTS "Members can read invites for own family" ON family_invites;
DROP POLICY IF EXISTS "Members can create invites for own family" ON family_invites;
DROP POLICY IF EXISTS "Members can update invites for own family" ON family_invites;

CREATE POLICY "Members can read invites for own family"
  ON family_invites FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "Members can create invites for own family"
  ON family_invites FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Members can update invites for own family"
  ON family_invites FOR UPDATE
  USING (family_id = get_my_family_id());

-- Step 4: Fix families policies
DROP POLICY IF EXISTS "Members can read family" ON families;
DROP POLICY IF EXISTS "Members can update family" ON families;

CREATE POLICY "Members can read family"
  ON families FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "Members can update family"
  ON families FOR UPDATE
  USING (family_id = get_my_family_id());

-- Step 5: Fix schedules policies
DROP POLICY IF EXISTS "Members can read schedule" ON schedules;
DROP POLICY IF EXISTS "Members can insert schedule" ON schedules;
DROP POLICY IF EXISTS "Members can update schedule" ON schedules;
DROP POLICY IF EXISTS "Members can delete schedule" ON schedules;

CREATE POLICY "Members can read schedule"
  ON schedules FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "Members can insert schedule"
  ON schedules FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "Members can update schedule"
  ON schedules FOR UPDATE
  USING (family_id = get_my_family_id());

CREATE POLICY "Members can delete schedule"
  ON schedules FOR DELETE
  USING (family_id = get_my_family_id());
