-- =============================================================================
-- SagaBorn D100 Character System Database Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES TABLE
-- Extends auth.users with additional profile information
-- =============================================================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comment to profiles table
COMMENT ON TABLE profiles IS 'User profiles that extend the auth.users table with additional information';
COMMENT ON COLUMN profiles.id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN profiles.username IS 'Optional unique username for display';
COMMENT ON COLUMN profiles.email IS 'User email address, required';

-- =============================================================================
-- CHARACTERS TABLE
-- Complete SagaBorn character data structure
-- =============================================================================

CREATE TABLE characters (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Character identity and background
    species TEXT,
    biology TEXT,
    culture TEXT,
    heritage TEXT,
    profession TEXT,
    archetype TEXT,
    
    -- Physical characteristics
    age INTEGER,
    lifespan INTEGER DEFAULT 65,
    height TEXT DEFAULT '5'' 8"',
    weight TEXT DEFAULT '180 lb',
    speed INTEGER DEFAULT 30,
    
    -- Core characteristics (SagaBorn D100 stats)
    str INTEGER DEFAULT 0,  -- Strength
    con INTEGER DEFAULT 0,  -- Constitution
    siz INTEGER DEFAULT 0,  -- Size
    int INTEGER DEFAULT 0,  -- Intelligence
    acu INTEGER DEFAULT 0,  -- Acumen
    dex INTEGER DEFAULT 0,  -- Dexterity
    soc INTEGER DEFAULT 0,  -- Social Standing
    
    -- Current status (derived from characteristics)
    current_hp INTEGER,     -- Current Hit Points
    current_sp INTEGER,     -- Current Sanity Points
    
    -- Character progression and abilities (stored as JSON for flexibility)
    skills JSONB DEFAULT '{}' NOT NULL,
    special_abilities JSONB DEFAULT '[]' NOT NULL,
    equipment JSONB DEFAULT '[]' NOT NULL,
    
    -- Additional notes and metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add comments to characters table
COMMENT ON TABLE characters IS 'Complete SagaBorn D100 character data including stats, skills, and equipment';
COMMENT ON COLUMN characters.user_id IS 'Foreign key to profiles table - identifies character owner';
COMMENT ON COLUMN characters.is_active IS 'Indicates if this is the user''s currently active character';
COMMENT ON COLUMN characters.species IS 'Character species (Human, Terian, etc.)';
COMMENT ON COLUMN characters.biology IS 'Biological heritage for Terian characters';
COMMENT ON COLUMN characters.culture IS 'Cultural background';
COMMENT ON COLUMN characters.heritage IS 'Additional heritage traits';
COMMENT ON COLUMN characters.profession IS 'Character profession/class';
COMMENT ON COLUMN characters.archetype IS 'Character archetype specialization';
COMMENT ON COLUMN characters.str IS 'Strength characteristic (0-100)';
COMMENT ON COLUMN characters.con IS 'Constitution characteristic (0-100)';
COMMENT ON COLUMN characters.siz IS 'Size characteristic (0-100)';
COMMENT ON COLUMN characters.int IS 'Intelligence characteristic (0-100)';
COMMENT ON COLUMN characters.acu IS 'Acumen characteristic (0-100)';
COMMENT ON COLUMN characters.dex IS 'Dexterity characteristic (0-100)';
COMMENT ON COLUMN characters.soc IS 'Social Standing characteristic (0-100)';
COMMENT ON COLUMN characters.current_hp IS 'Current Hit Points';
COMMENT ON COLUMN characters.current_sp IS 'Current Sanity Points';
COMMENT ON COLUMN characters.skills IS 'Character skills as JSON object {skill_name: skill_value}';
COMMENT ON COLUMN characters.special_abilities IS 'Special abilities and talents as JSON array';
COMMENT ON COLUMN characters.equipment IS 'Character equipment and inventory as JSON array';

-- =============================================================================
-- INDEXES
-- Performance optimization for common queries
-- =============================================================================

-- Index for finding characters by user
CREATE INDEX idx_characters_user_id ON characters(user_id);

-- Index for finding active characters
CREATE INDEX idx_characters_is_active ON characters(is_active);

-- Index for character name searches
CREATE INDEX idx_characters_name ON characters(name);

-- Index for species-based queries
CREATE INDEX idx_characters_species ON characters(species);

-- Composite index for user's active character (common query pattern)
CREATE INDEX idx_characters_user_active ON characters(user_id, is_active);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Data access control policies
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can read all profiles (for social features like character sharing)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Characters RLS Policies
-- Users can view only their own characters
CREATE POLICY "Users can view own characters" ON characters
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert only their own characters
CREATE POLICY "Users can insert own characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update only their own characters
CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own characters
CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS
-- Automated database functions
-- =============================================================================

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Apply updated_at trigger to characters table  
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- CONSTRAINTS AND VALIDATIONS
-- Business logic enforcement
-- =============================================================================

-- Ensure only one active character per user
CREATE UNIQUE INDEX idx_one_active_character_per_user 
ON characters(user_id) 
WHERE is_active = true;

-- Add constraint comments
COMMENT ON INDEX idx_one_active_character_per_user IS 'Ensures each user can have only one active character at a time';

-- Validate characteristic ranges (SagaBorn uses 0-100 scale)
ALTER TABLE characters ADD CONSTRAINT chk_str_range CHECK (str >= 0 AND str <= 100);
ALTER TABLE characters ADD CONSTRAINT chk_con_range CHECK (con >= 0 AND con <= 100);
ALTER TABLE characters ADD CONSTRAINT chk_siz_range CHECK (siz >= 0 AND siz <= 100);
ALTER TABLE characters ADD CONSTRAINT chk_int_range CHECK (int >= 0 AND int <= 100);
ALTER TABLE characters ADD CONSTRAINT chk_acu_range CHECK (acu >= 0 AND acu <= 100);
ALTER TABLE characters ADD CONSTRAINT chk_dex_range CHECK (dex >= 0 AND dex <= 100);
ALTER TABLE characters ADD CONSTRAINT chk_soc_range CHECK (soc >= 0 AND soc <= 100);

-- Validate age is positive
ALTER TABLE characters ADD CONSTRAINT chk_age_positive CHECK (age IS NULL OR age > 0);

-- Validate lifespan is positive
ALTER TABLE characters ADD CONSTRAINT chk_lifespan_positive CHECK (lifespan > 0);

-- Validate speed is positive
ALTER TABLE characters ADD CONSTRAINT chk_speed_positive CHECK (speed > 0);

-- Validate HP and SP are non-negative if set
ALTER TABLE characters ADD CONSTRAINT chk_current_hp_positive CHECK (current_hp IS NULL OR current_hp >= 0);
ALTER TABLE characters ADD CONSTRAINT chk_current_sp_positive CHECK (current_sp IS NULL OR current_sp >= 0);

-- =============================================================================
-- COMPLETION
-- =============================================================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'SagaBorn D100 Character System schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, characters';
    RAISE NOTICE 'Indexes created for performance optimization';
    RAISE NOTICE 'Row Level Security policies enabled';
    RAISE NOTICE 'Triggers created for automated profile creation and timestamp updates';
END $$;