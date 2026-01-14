// Shared type definitions for stock entries

export interface StockEntryData {
  id?: string; // Database UUID
  stock1: string;
  stock2: string;
  stock2b: string;
  stock2bColor?: string;
  stock3: string;
  stock4: string;
  stock1Date: Date | null;
  stock2Date: Date | null;
  stock3Date: Date | null;
  stock4Date: Date | null;
  classification: 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL';
  dropdown1?: string;
  dropdown2?: string;
  dropdown3?: string;
  dropdown4?: string;
  dropdown5?: string;
  dropdown6?: string;
  dropdown7?: string;
  dropdown8?: string;
  dropdown1Date?: Date | null;
  dropdown2Date?: Date | null;
  dropdown3Date?: Date | null;
  dropdown4Date?: Date | null;
  dropdown5Date?: Date | null;
  dropdown6Date?: Date | null;
  dropdown7Date?: Date | null;
  dropdown8Date?: Date | null;
  ogCandle?: string;
  ogOpenA?: string;
  sdOpenA?: string;
  ogCloseA?: string;
  sdCloseA?: string;
  ogOpenADate?: Date | null;
  ogCloseADate?: Date | null;
  notes?: string;
  imageUrl?: string;
  timestamp: number;
  part2Result?: string;
  type?: 'part1' | 'part2' | 'common';
}

// Database row format (snake_case)
export interface StockEntryRow {
  id: string;
  user_id: string;
  stock1: string;
  stock2: string;
  stock2b: string;
  stock2b_color: string | null;
  stock3: string;
  stock4: string;
  stock1_date: string | null;
  stock2_date: string | null;
  stock3_date: string | null;
  stock4_date: string | null;
  classification: string | null;
  dropdown1: string | null;
  dropdown2: string | null;
  dropdown3: string | null;
  dropdown4: string | null;
  dropdown5: string | null;
  dropdown6: string | null;
  dropdown7: string | null;
  dropdown8: string | null;
  dropdown1_date: string | null;
  dropdown2_date: string | null;
  dropdown3_date: string | null;
  dropdown4_date: string | null;
  dropdown5_date: string | null;
  dropdown6_date: string | null;
  dropdown7_date: string | null;
  dropdown8_date: string | null;
  og_candle: string | null;
  og_open_a: string | null;
  sd_open_a: string | null;
  og_close_a: string | null;
  sd_close_a: string | null;
  og_open_a_date: string | null;
  og_close_a_date: string | null;
  notes: string | null;
  image_url: string | null;
  entry_type: string;
  part2_result: string | null;
  created_at: string;
  updated_at: string;
  legacy_timestamp: number | null;
}
