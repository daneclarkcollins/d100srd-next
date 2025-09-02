-- Fix current_step column type to match application data
ALTER TABLE characters 
ALTER COLUMN current_step TYPE VARCHAR(50);