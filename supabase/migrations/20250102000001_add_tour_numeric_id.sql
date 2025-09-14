-- Add 6-digit numeric tour ID for internal tracking and order tagging (only if tours table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tours') THEN
        -- Add the column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tours' AND column_name = 'tour_numeric_id') THEN
            ALTER TABLE public.tours ADD COLUMN tour_numeric_id INTEGER UNIQUE;
        END IF;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_tours_numeric_id ON public.tours(tour_numeric_id);
        
        -- Add comment to document this field
        COMMENT ON COLUMN public.tours.tour_numeric_id IS '6-digit numeric ID for internal tracking and order tagging (not exposed in UI)';
    END IF;
END $$;
