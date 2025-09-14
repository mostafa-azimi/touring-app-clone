-- Create base tables for touring app

-- 1. Create warehouses table
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create team_members table (hosts)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create swag_items table
CREATE TABLE IF NOT EXISTS public.swag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create tours table
CREATE TABLE IF NOT EXISTS public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create tour_participants table
CREATE TABLE IF NOT EXISTS public.tour_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create tour_swag_allocations table
CREATE TABLE IF NOT EXISTS public.tour_swag_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.tour_participants(id) ON DELETE CASCADE,
  swag_item_id UUID NOT NULL REFERENCES public.swag_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tour_id, participant_id, swag_item_id)
);

-- Enable RLS on all tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_swag_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (accessible to all authenticated users)
-- Warehouses policies
CREATE POLICY "warehouses_select_authenticated" 
  ON public.warehouses FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "warehouses_insert_authenticated" 
  ON public.warehouses FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "warehouses_update_authenticated" 
  ON public.warehouses FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "warehouses_delete_authenticated" 
  ON public.warehouses FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Team members policies
CREATE POLICY "team_members_select_authenticated" 
  ON public.team_members FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "team_members_insert_authenticated" 
  ON public.team_members FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "team_members_update_authenticated" 
  ON public.team_members FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "team_members_delete_authenticated" 
  ON public.team_members FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Swag items policies
CREATE POLICY "swag_items_select_authenticated" 
  ON public.swag_items FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "swag_items_insert_authenticated" 
  ON public.swag_items FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "swag_items_update_authenticated" 
  ON public.swag_items FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "swag_items_delete_authenticated" 
  ON public.swag_items FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Tours policies
CREATE POLICY "tours_select_authenticated" 
  ON public.tours FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tours_insert_authenticated" 
  ON public.tours FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tours_update_authenticated" 
  ON public.tours FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tours_delete_authenticated" 
  ON public.tours FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Tour participants policies
CREATE POLICY "tour_participants_select_authenticated" 
  ON public.tour_participants FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tour_participants_insert_authenticated" 
  ON public.tour_participants FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tour_participants_update_authenticated" 
  ON public.tour_participants FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tour_participants_delete_authenticated" 
  ON public.tour_participants FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Tour swag allocations policies
CREATE POLICY "tour_swag_allocations_select_authenticated" 
  ON public.tour_swag_allocations FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tour_swag_allocations_insert_authenticated" 
  ON public.tour_swag_allocations FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "tour_swag_allocations_update_authenticated" 
  ON public.tour_swag_allocations FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "tour_swag_allocations_delete_authenticated" 
  ON public.tour_swag_allocations FOR DELETE 
  USING (auth.uid() IS NOT NULL);
