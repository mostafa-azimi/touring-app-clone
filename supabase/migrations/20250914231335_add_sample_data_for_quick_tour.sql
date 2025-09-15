-- Add sample data for Quick Tour Creator functionality

-- Insert sample team members (hosts) if they don't exist
INSERT INTO public.team_members (id, name, first_name, last_name, email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'John Smith', 'John', 'Smith', 'john.smith@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'Sarah Johnson', 'Sarah', 'Johnson', 'sarah.johnson@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'Mike Davis', 'Mike', 'Davis', 'mike.davis@example.com')
ON CONFLICT (email) DO NOTHING;

-- Insert tenant config if it doesn't exist
INSERT INTO public.tenant_config (id, shiphero_vendor_id, shop_name, company_name, default_fulfillment_status)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'default-vendor', 'ShipHero Tour Demo', 'Tour Company', 'pending')
ON CONFLICT (id) DO UPDATE SET
  shop_name = EXCLUDED.shop_name,
  company_name = EXCLUDED.company_name;

-- Add comments
COMMENT ON TABLE public.team_members IS 'Team members who can host tours (also used as hosts table)';
