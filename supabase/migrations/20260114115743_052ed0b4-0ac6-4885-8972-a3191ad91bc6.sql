-- Add Yearly Open and Yearly Close fields
ALTER TABLE public.stock_entries
ADD COLUMN dropdown7 text DEFAULT NULL,
ADD COLUMN dropdown8 text DEFAULT NULL,
ADD COLUMN dropdown7_date timestamp with time zone DEFAULT NULL,
ADD COLUMN dropdown8_date timestamp with time zone DEFAULT NULL;