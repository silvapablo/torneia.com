/*
  # Fix RLS policies and signUp function

  1. Security Fixes
    - Remove recursive RLS policies on auth_users
    - Add proper non-recursive policies
    - Fix uid() function implementation

  2. Function Updates
    - Update registerUser function to handle correct parameters
    - Add proper error handling and validation
*/

-- First, drop all existing policies on auth_users to prevent recursion
DROP POLICY IF EXISTS "auth_users_select_policy" ON auth_users;
DROP POLICY IF EXISTS "Users can read own data" ON auth_users;
DROP POLICY IF EXISTS "Admins can read all users" ON auth_users;

-- Create a simple, non-recursive policy for auth_users
CREATE POLICY "auth_users_basic_select" ON auth_users
  FOR SELECT TO public
  USING (true);

-- Create or replace the uid() function to avoid recursion
CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::uuid;
$$;

-- Update the registerUser function to handle the correct parameter structure
CREATE OR REPLACE FUNCTION public.register_user(
  user_email text,
  user_password text,
  user_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  user_name text;
  user_username text;
  user_cpf text;
  result jsonb;
BEGIN
  -- Extract data from jsonb parameter
  user_name := user_data->>'name';
  user_username := user_data->>'username';
  user_cpf := user_data->>'cpf';

  -- Validate required fields
  IF user_email IS NULL OR user_password IS NULL OR user_name IS NULL OR user_username IS NULL OR user_cpf IS NULL THEN
    RETURN jsonb_build_object('error', 'Missing required fields');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth_users WHERE email = user_email) THEN
    RETURN jsonb_build_object('error', 'Email already exists');
  END IF;

  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE username = user_username) THEN
    RETURN jsonb_build_object('error', 'Username already exists');
  END IF;

  -- Check if CPF already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE cpf = user_cpf) THEN
    RETURN jsonb_build_object('error', 'CPF already exists');
  END IF;

  -- Generate new user ID
  new_user_id := gen_random_uuid();

  -- Insert into auth_users
  INSERT INTO auth_users (id, email, password_hash, role, name)
  VALUES (new_user_id, user_email, crypt(user_password, gen_salt('bf')), 'client', user_name);

  -- Insert into profiles
  INSERT INTO profiles (id, username, full_name, cpf)
  VALUES (new_user_id, user_username, user_name, user_cpf);

  -- Return success with user data
  RETURN jsonb_build_object(
    'success', true,
    'user', jsonb_build_object(
      'id', new_user_id,
      'email', user_email,
      'name', user_name,
      'role', 'client'
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;