-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    species TEXT,
    biology TEXT,
    culture TEXT,
    heritage TEXT,
    profession TEXT,
    archetype TEXT,
    age INTEGER,
    characteristics JSONB NOT NULL DEFAULT '{"STR":0,"CON":0,"SIZ":0,"INT":0,"ACU":0,"DEX":0,"SOC":0}',
    derived_stats JSONB NOT NULL DEFAULT '{"effort":0,"stamina":0,"intellect":0,"spirit":0,"agility":0,"charm":0,"hitPoints":0,"spiritPoints":0,"damageModifier":"None","experienceBonus":0,"movementSpeed":25,"horrorResistance":0}',
    skills JSONB NOT NULL DEFAULT '{}',
    lifespan INTEGER NOT NULL DEFAULT 0,
    height TEXT NOT NULL DEFAULT '',
    weight TEXT NOT NULL DEFAULT '',
    speed INTEGER NOT NULL DEFAULT 0,
    special_abilities TEXT[] NOT NULL DEFAULT '{}',
    starting_equipment TEXT[] NOT NULL DEFAULT '{}',
    starting_funds TEXT NOT NULL DEFAULT '',
    starting_funds_amount INTEGER NOT NULL DEFAULT 0,
    current_step TEXT NOT NULL DEFAULT 'species',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own characters
CREATE POLICY "Users can view own characters" ON characters
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own characters
CREATE POLICY "Users can insert own characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own characters
CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own characters
CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_updated_at ON characters(updated_at);
CREATE INDEX idx_characters_is_active ON characters(user_id, is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();