#!/usr/bin/env node

// Script to check current database schema and identify issues
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure you have:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('🔍 Checking database schema...\n')

  try {
    // Check what tables exist
    console.log('📋 Existing tables:')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list')
      .catch(async () => {
        // Fallback: try to query known tables
        const knownTables = ['characters', 'profiles', 'character_profiles', 'users']
        const results = []
        
        for (const table of knownTables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .limit(0)
            
            if (!error) {
              results.push({ table_name: table, exists: true })
            }
          } catch (e) {
            results.push({ table_name: table, exists: false, error: e.message })
          }
        }
        return { data: results }
      })

    if (tables && tables.length) {
      tables.forEach(table => {
        console.log(`  ✅ ${table.table_name || table}`)
      })
    } else {
      console.log('  ❌ Could not retrieve table list')
    }

    console.log('\n🔍 Checking specific tables...\n')

    // Check characters table
    console.log('1️⃣ Characters table:')
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, user_id')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Table exists with ${data ? data.length : 0} sample records`)
      }
    } catch (e) {
      console.log(`  ❌ Exception: ${e.message}`)
    }

    // Check profiles table
    console.log('\n2️⃣ Profiles table:')
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Table exists with ${data ? data.length : 0} sample records`)
        if (data && data.length > 0) {
          console.log('  📝 Sample structure:', Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log(`  ❌ Exception: ${e.message}`)
    }

    // Check character_profiles table
    console.log('\n3️⃣ Character_profiles table:')
    try {
      const { data, error } = await supabase
        .from('character_profiles')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Table exists with ${data ? data.length : 0} sample records`)
        if (data && data.length > 0) {
          console.log('  📝 Sample structure:', Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log(`  ❌ Exception: ${e.message}`)
    }

    // Check constraints
    console.log('\n🔒 Checking constraints...')
    try {
      const { data: constraints, error: constraintsError } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, table_name, constraint_type')
        .in('table_name', ['profiles', 'character_profiles'])

      if (constraints && constraints.length) {
        constraints.forEach(constraint => {
          console.log(`  🔗 ${constraint.table_name}.${constraint.constraint_name} (${constraint.constraint_type})`)
        })
      } else {
        console.log('  ℹ️ No constraints found or unable to query')
      }
    } catch (e) {
      console.log(`  ❌ Could not check constraints: ${e.message}`)
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error.message)
  }
}

// Run the check
checkSchema()
  .then(() => {
    console.log('\n✅ Schema check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Schema check failed:', error)
    process.exit(1)
  })