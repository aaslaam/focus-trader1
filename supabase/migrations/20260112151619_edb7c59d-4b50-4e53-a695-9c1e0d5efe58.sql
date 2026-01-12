-- Create stock_entries table
CREATE TABLE public.stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stock fields
  stock1 TEXT DEFAULT '',
  stock2 TEXT DEFAULT '',
  stock2b TEXT DEFAULT '',
  stock2b_color TEXT,
  stock3 TEXT DEFAULT '',
  stock4 TEXT DEFAULT '',
  
  -- Stock dates
  stock1_date TIMESTAMPTZ,
  stock2_date TIMESTAMPTZ,
  stock3_date TIMESTAMPTZ,
  stock4_date TIMESTAMPTZ,
  
  -- Classification
  classification TEXT,
  
  -- Dropdowns 1-6
  dropdown1 TEXT,
  dropdown2 TEXT,
  dropdown3 TEXT,
  dropdown4 TEXT,
  dropdown5 TEXT,
  dropdown6 TEXT,
  
  -- Dropdown dates
  dropdown1_date TIMESTAMPTZ,
  dropdown2_date TIMESTAMPTZ,
  dropdown3_date TIMESTAMPTZ,
  dropdown4_date TIMESTAMPTZ,
  dropdown5_date TIMESTAMPTZ,
  dropdown6_date TIMESTAMPTZ,
  
  -- OG fields
  og_candle TEXT,
  og_open_a TEXT,
  sd_open_a TEXT,
  og_close_a TEXT,
  sd_close_a TEXT,
  og_open_a_date TIMESTAMPTZ,
  og_close_a_date TIMESTAMPTZ,
  
  -- Notes and images
  notes TEXT,
  image_url TEXT,
  
  -- Entry metadata
  entry_type TEXT DEFAULT 'common' CHECK (entry_type IN ('part1', 'part2', 'common')),
  part2_result TEXT,
  
  -- Timestamps for sync
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Legacy timestamp for migration compatibility
  legacy_timestamp BIGINT
);

-- Enable Row Level Security
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own entries
CREATE POLICY "Users can view own entries"
  ON public.stock_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own entries
CREATE POLICY "Users can insert own entries"
  ON public.stock_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own entries
CREATE POLICY "Users can update own entries"
  ON public.stock_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own entries
CREATE POLICY "Users can delete own entries"
  ON public.stock_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_entries;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER stock_entries_updated_at
  BEFORE UPDATE ON public.stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();