-- Add selected_skus field to tours table to store selected SKUs for tour finalization

ALTER TABLE public.tours 
  ADD COLUMN IF NOT EXISTS selected_skus TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN public.tours.selected_skus IS 'Array of SKU strings selected for this tour to use in order creation';
