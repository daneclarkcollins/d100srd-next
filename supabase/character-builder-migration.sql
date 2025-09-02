-- SagaBorn Character Builder Database Migration
-- This migration adds support for the enhanced character builder features
-- Run this as a single transaction in Supabase SQL Editor

BEGIN;

-- Add the new starting_funds_amount field for storing numeric gold amount
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS starting_funds_amount INTEGER DEFAULT 0;

-- Ensure all existing character fields are present and properly typed
-- These may already exist, but this ensures compatibility

-- Core character identification
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS species VARCHAR(100),
ADD COLUMN IF NOT EXISTS biology VARCHAR(100),
ADD COLUMN IF NOT EXISTS culture VARCHAR(100),
ADD COLUMN IF NOT EXISTS heritage VARCHAR(100),
ADD COLUMN IF NOT EXISTS profession VARCHAR(100),
ADD COLUMN IF NOT EXISTS archetype VARCHAR(100);

-- Physical characteristics (now customizable)
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS height VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS weight VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS lifespan INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS speed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Core characteristics (7 stats)
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS strength INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS constitution INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS size INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intelligence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS acuity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dexterity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social INTEGER DEFAULT 0;

-- Derived statistics
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS effort INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stamina INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intellect INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spirit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS agility INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS charm INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hit_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spirit_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS damage_modifier VARCHAR(20) DEFAULT 'None',
ADD COLUMN IF NOT EXISTS experience_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS movement_speed INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS horror_resistance INTEGER DEFAULT 0;

-- Skills (stored as JSON object with skill names and percentages)
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '{}';

-- Special abilities and equipment
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS special_abilities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS starting_equipment JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS starting_funds TEXT DEFAULT '';

-- Character creation progress tracking
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS current_step VARCHAR(50) DEFAULT 'species',
ADD COLUMN IF NOT EXISTS creation_mode VARCHAR(20) DEFAULT 'normal';

-- Timestamps
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- User association (if not already present)
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);

-- Create an index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_characters_updated_at ON characters(updated_at);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the new fields
COMMENT ON COLUMN characters.starting_funds_amount IS 'Numeric amount of starting funds in gold pieces (e.g., 32)';
COMMENT ON COLUMN characters.starting_funds IS 'Descriptive text for starting funds (e.g., "32 gp (rolled 2 × 10 + 10)")';
COMMENT ON COLUMN characters.height IS 'Character height in format like "5'' 8''"';
COMMENT ON COLUMN characters.weight IS 'Character weight in format like "180 lb"';
COMMENT ON COLUMN characters.skills IS 'JSON object containing skill names as keys and percentages as values';
COMMENT ON COLUMN characters.special_abilities IS 'JSON array of special ability names';
COMMENT ON COLUMN characters.starting_equipment IS 'JSON array of starting equipment items';
COMMENT ON COLUMN characters.current_step IS 'Current step in character creation process';
COMMENT ON COLUMN characters.creation_mode IS 'Character creation mode: "normal" or "advanced"';

COMMIT;