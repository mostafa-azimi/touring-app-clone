-- Add instruction guide storage to tours table
ALTER TABLE public.tours 
ADD COLUMN instruction_guide TEXT,
ADD COLUMN instruction_guide_generated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for clarity
COMMENT ON COLUMN public.tours.instruction_guide IS 'Stored instruction guide for the finalized tour';
COMMENT ON COLUMN public.tours.instruction_guide_generated_at IS 'Timestamp when instruction guide was generated';
