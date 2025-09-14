-- Add sample data for Quick Tour Creator functionality

-- Insert sample team members (hosts) if they don't exist
INSERT INTO public.team_members (id, first_name, last_name, email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John', 'Smith', 'john.smith@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'Sarah', 'Johnson', 'sarah.johnson@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'Mike', 'Davis', 'mike.davis@example.com')
ON CONFLICT (email) DO NOTHING;

-- Insert tenant config if it doesn't exist
INSERT INTO public.tenant_config (id, shiphero_vendor_id, shop_name, company_name, default_fulfillment_status, enable_hold_until)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'default-vendor', 'ShipHero Tour Demo', 'Tour Company', 'pending', false)
ON CONFLICT (id) DO UPDATE SET
  shop_name = EXCLUDED.shop_name,
  company_name = EXCLUDED.company_name,
  enable_hold_until = COALESCE(public.tenant_config.enable_hold_until, EXCLUDED.enable_hold_until);

-- Add comments
COMMENT ON TABLE public.team_members IS 'Team members who can host tours (also used as hosts table)';
