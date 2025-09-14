-- Add workflow_configs field to tours table to store workflow configurations with quantities
-- This field will store JSON data containing workflow-specific configurations including SKU quantities

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tours') THEN
        -- Add the column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tours' AND column_name = 'workflow_configs') THEN
            ALTER TABLE public.tours ADD COLUMN workflow_configs JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.tours.workflow_configs IS 'JSON object containing workflow configurations including SKU quantities for each workflow (e.g., {"standard_receiving": {"orderCount": 5, "selectedSkus": [], "skuQuantities": {"SKU123": 10}}})';
        
        -- Create an index on workflow_configs for better query performance
        CREATE INDEX IF NOT EXISTS idx_tours_workflow_configs ON public.tours USING GIN (workflow_configs);
    END IF;
END $$;
