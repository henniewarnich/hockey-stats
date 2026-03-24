-- Step 1: Check for orphan auth users without profiles
SELECT au.id, au.email, au.created_at 
FROM auth.users au 
LEFT JOIN public.profiles p ON p.id = au.id 
WHERE p.id IS NULL;

-- Step 2: Check for profiles with empty usernames (from failed trigger)
SELECT id, email, username FROM profiles WHERE username = '' OR username IS NULL;

-- Step 3: Fix empty usernames (make them unique using email prefix)
UPDATE profiles 
SET username = LOWER(SPLIT_PART(email, '@', 1)) || '.' || SUBSTR(id::text, 1, 4)
WHERE username = '' OR username IS NULL;

-- Step 4: Replace trigger to handle empty/duplicate usernames gracefully
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), 
                         LOWER(SPLIT_PART(NEW.email, '@', 1)) || '.' || SUBSTR(NEW.id::text, 1, 4));
  
  -- If username already taken, append random suffix
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || SUBSTR(md5(random()::text), 1, 3);
  END LOOP;

  INSERT INTO public.profiles (id, email, firstname, lastname, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
