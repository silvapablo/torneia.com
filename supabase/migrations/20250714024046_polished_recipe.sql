/*
  # Fix RLS policies for profiles table

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create simple, non-recursive policies
    - Use auth.uid() instead of complex subqueries
    - Ensure policies don't reference the same table they're protecting

  2. New Policies
    - Users can read their own profile using direct auth.uid() comparison
    - Users can update their own profile using direct auth.uid() comparison
    - Simple and efficient without recursion risks
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert access for own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);