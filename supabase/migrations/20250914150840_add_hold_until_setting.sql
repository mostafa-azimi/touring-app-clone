-- Add enable_hold_until column to tenant_config table
ALTER TABLE public.tenant_config
ADD COLUMN IF NOT EXISTS enable_hold_until BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.tenant_config.enable_hold_until IS 'Controls whether orders are created with hold until status to prevent immediate fulfillment';
