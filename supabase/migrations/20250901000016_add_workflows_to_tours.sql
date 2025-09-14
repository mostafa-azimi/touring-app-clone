-- Add workflows field to tours table to store selected finalization workflows

ALTER TABLE public.tours 
  ADD COLUMN IF NOT EXISTS selected_workflows TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN public.tours.selected_workflows IS 'Array of workflow options selected for tour finalization (e.g., receive_to_light, pack_to_light, standard_receiving, bulk_shipping, single_item_batch, multi_item_batch)';
