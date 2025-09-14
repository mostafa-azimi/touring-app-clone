-- Fix warehouse codes for existing warehouses
-- Update the warehouse that should be LAX
UPDATE public.warehouses 
SET code = 'LAX' 
WHERE name = 'Touring App Convenience' AND (code IS NULL OR code = '' OR code = 'Touring App');

-- Update any other warehouses that might need proper codes
UPDATE public.warehouses 
SET code = 'ATL' 
WHERE name = 'Convenience Counter' AND (code IS NULL OR code = '' OR code != 'ATL');

-- Add a comment
COMMENT ON COLUMN public.warehouses.code IS 'Three-letter airport code for the warehouse location';
