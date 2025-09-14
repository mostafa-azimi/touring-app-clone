-- Create tenant configuration table for customizable settings
CREATE TABLE IF NOT EXISTS public.tenant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shiphero_vendor_id TEXT,
  shop_name TEXT DEFAULT 'Tour Orders',
  company_name TEXT DEFAULT 'Tour Company',
  default_fulfillment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenant_config_id ON public.tenant_config(id);

-- Add comment
COMMENT ON TABLE public.tenant_config IS 'Stores tenant-specific configuration settings';
COMMENT ON COLUMN public.tenant_config.shiphero_vendor_id IS 'ShipHero vendor ID for purchase orders';
COMMENT ON COLUMN public.tenant_config.shop_name IS 'Shop name used in order creation';
COMMENT ON COLUMN public.tenant_config.company_name IS 'Company name used in billing/shipping addresses';
COMMENT ON COLUMN public.tenant_config.default_fulfillment_status IS 'Default fulfillment status for orders';
