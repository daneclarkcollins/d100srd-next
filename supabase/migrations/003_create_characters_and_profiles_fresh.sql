-- Fresh database setup for SagaBorn D100 SRD
-- Drop existing tables if they exist (careful - this removes all data!)
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create characters table
CREATE TABLE characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50),
    biology VARCHAR(50),
    culture VARCHAR(50), 
    heritage VARCHAR(50),
    profession VARCHAR(50),
    archetype VARCHAR(50),
    age INTEGER,
    characteristics JSONB NOT NULL DEFAULT '{"STR":0,"CON":0,"SIZ":0,"INT":0,"ACU":0,"DEX":0,"SOC":0}',
    derived_stats JSONB NOT NULL DEFAULT '{"effort":0,"stamina":0,"intellect":0,"spirit":0,"agility":0,"charm":0,"hitPoints":0,"spiritPoints":0,"damageModifier":"None","experienceBonus":0,"movementSpeed":25,"horrorResistance":0}',
    skills JSONB DEFAULT '{}',
    lifespan VARCHAR(50),
    height VARCHAR(50),
    weight VARCHAR(50),
    speed INTEGER,
    special_abilities TEXT[],
    starting_equipment TEXT[],
    starting_funds VARCHAR(50),
    starting_funds_amount INTEGER,
    current_step INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table for character status tracking
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    current_hp INTEGER DEFAULT 0,
    current_sp INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for characters table
CREATE POLICY "Users can view own characters" ON characters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for profiles table
CREATE POLICY "Users can view own character profiles" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own character profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own character profiles" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own character profiles" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_is_active ON characters(user_id, is_active);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_character_id ON profiles(character_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_characters_updated_at 
    BEFORE UPDATE ON characters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();