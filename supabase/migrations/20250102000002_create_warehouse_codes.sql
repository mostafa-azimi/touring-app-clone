-- Create warehouse_codes table to store airport codes for ShipHero warehouses
CREATE TABLE IF NOT EXISTS warehouse_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shiphero_warehouse_id TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on shiphero_warehouse_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_warehouse_codes_shiphero_id ON warehouse_codes(shiphero_warehouse_id);

-- Add RLS policy (disable for now since we disabled RLS for dev)
-- ALTER TABLE warehouse_codes ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE warehouse_codes IS 'Stores airport codes (like JFK, LAX) for ShipHero warehouses';
COMMENT ON COLUMN warehouse_codes.shiphero_warehouse_id IS 'Base64 encoded ShipHero warehouse ID (e.g., V2FyZWhvdXNlOjExOTM0Mw==)';
COMMENT ON COLUMN warehouse_codes.code IS 'Airport code like JFK, LAX, etc.';
