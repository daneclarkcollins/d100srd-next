-- Check for existing triggers that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check for functions that might be related to user creation
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND (routine_name ILIKE '%user%' OR routine_name ILIKE '%profile%')
ORDER BY routine_name;

-- Check for any existing policies on auth.users (if accessible)
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' OR tablename ILIKE '%profile%' OR tablename ILIKE '%character%';

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;