-- Create character_status table for tracking current HP/SP
CREATE TABLE IF NOT EXISTS character_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_hp INTEGER NOT NULL DEFAULT 0,
    current_sp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one status record per character per user
    UNIQUE(character_id, user_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE character_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own character status
CREATE POLICY "Users can view own character status" ON character_status
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own character status
CREATE POLICY "Users can insert own character status" ON character_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own character status
CREATE POLICY "Users can update own character status" ON character_status
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own character status
CREATE POLICY "Users can delete own character status" ON character_status
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_character_status_character_id ON character_status(character_id);
CREATE INDEX idx_character_status_user_id ON character_status(user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_character_status_updated_at
    BEFORE UPDATE ON character_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();