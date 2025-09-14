-- Remove swag items concept entirely
-- Products will come from ShipHero inventory API only

-- Drop the allocations table first (has foreign key dependencies)
DROP TABLE IF EXISTS public.tour_swag_allocations CASCADE;

-- Drop the main swag_items table
DROP TABLE IF EXISTS public.swag_items CASCADE;

-- Drop any related indexes
DROP INDEX IF EXISTS uq_swag_items_sku;
