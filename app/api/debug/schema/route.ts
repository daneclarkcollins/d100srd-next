import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const results: any = {
      tables: {},
      constraints: []
    }

    // Check characters table
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, user_id')
        .limit(1)
      
      results.tables.characters = {
        exists: !error,
        error: error?.message,
        sampleCount: data?.length || 0
      }
    } catch (e: any) {
      results.tables.characters = { exists: false, error: e.message }
    }

    // Check profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      results.tables.profiles = {
        exists: !error,
        error: error?.message,
        sampleCount: data?.length || 0,
        structure: data?.[0] ? Object.keys(data[0]) : []
      }
    } catch (e: any) {
      results.tables.profiles = { exists: false, error: e.message }
    }

    // Check character_profiles table
    try {
      const { data, error } = await supabase
        .from('character_profiles')
        .select('*')
        .limit(1)
      
      results.tables.character_profiles = {
        exists: !error,
        error: error?.message,
        sampleCount: data?.length || 0,
        structure: data?.[0] ? Object.keys(data[0]) : []
      }
    } catch (e: any) {
      results.tables.character_profiles = { exists: false, error: e.message }
    }

    // Try to get constraint information
    try {
      const { data: constraints } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, table_name, constraint_type')
        .in('table_name', ['profiles', 'character_profiles'])
        
      results.constraints = constraints || []
    } catch (e: any) {
      results.constraintError = e.message
    }

    return Response.json(results, { status: 200 })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}