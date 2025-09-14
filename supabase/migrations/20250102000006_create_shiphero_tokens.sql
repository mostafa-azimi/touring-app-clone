-- Create table to store ShipHero access tokens
CREATE TABLE IF NOT EXISTS public.shiphero_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_shiphero_tokens_updated_at 
    BEFORE UPDATE ON public.shiphero_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for development (can be enabled later for production security)
ALTER TABLE public.shiphero_tokens DISABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE public.shiphero_tokens IS 'Stores ShipHero API access tokens with expiration tracking';
COMMENT ON COLUMN public.shiphero_tokens.access_token IS 'Current ShipHero access token';
COMMENT ON COLUMN public.shiphero_tokens.refresh_token IS 'ShipHero refresh token for getting new access tokens';
COMMENT ON COLUMN public.shiphero_tokens.expires_at IS 'When the current access token expires';
