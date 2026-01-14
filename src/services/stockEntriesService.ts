import { supabase } from '@/integrations/supabase/client';
import { StockEntryData, StockEntryRow } from '@/types/stockEntry';

// Convert camelCase to snake_case for database
const toDbFormat = (entry: StockEntryData, userId: string): Omit<StockEntryRow, 'id' | 'created_at' | 'updated_at'> => {
  return {
    user_id: userId,
    stock1: entry.stock1 || '',
    stock2: entry.stock2 || '',
    stock2b: entry.stock2b || '',
    stock2b_color: entry.stock2bColor || null,
    stock3: entry.stock3 || '',
    stock4: entry.stock4 || '',
    stock1_date: entry.stock1Date ? new Date(entry.stock1Date).toISOString() : null,
    stock2_date: entry.stock2Date ? new Date(entry.stock2Date).toISOString() : null,
    stock3_date: entry.stock3Date ? new Date(entry.stock3Date).toISOString() : null,
    stock4_date: entry.stock4Date ? new Date(entry.stock4Date).toISOString() : null,
    classification: entry.classification || null,
    dropdown1: entry.dropdown1 || null,
    dropdown2: entry.dropdown2 || null,
    dropdown3: entry.dropdown3 || null,
    dropdown4: entry.dropdown4 || null,
    dropdown5: entry.dropdown5 || null,
    dropdown6: entry.dropdown6 || null,
    dropdown7: entry.dropdown7 || null,
    dropdown8: entry.dropdown8 || null,
    dropdown1_date: entry.dropdown1Date ? new Date(entry.dropdown1Date).toISOString() : null,
    dropdown2_date: entry.dropdown2Date ? new Date(entry.dropdown2Date).toISOString() : null,
    dropdown3_date: entry.dropdown3Date ? new Date(entry.dropdown3Date).toISOString() : null,
    dropdown4_date: entry.dropdown4Date ? new Date(entry.dropdown4Date).toISOString() : null,
    dropdown5_date: entry.dropdown5Date ? new Date(entry.dropdown5Date).toISOString() : null,
    dropdown6_date: entry.dropdown6Date ? new Date(entry.dropdown6Date).toISOString() : null,
    dropdown7_date: entry.dropdown7Date ? new Date(entry.dropdown7Date).toISOString() : null,
    dropdown8_date: entry.dropdown8Date ? new Date(entry.dropdown8Date).toISOString() : null,
    og_candle: entry.ogCandle || null,
    og_open_a: entry.ogOpenA || null,
    sd_open_a: entry.sdOpenA || null,
    og_close_a: entry.ogCloseA || null,
    sd_close_a: entry.sdCloseA || null,
    og_open_a_date: entry.ogOpenADate ? new Date(entry.ogOpenADate).toISOString() : null,
    og_close_a_date: entry.ogCloseADate ? new Date(entry.ogCloseADate).toISOString() : null,
    notes: entry.notes || null,
    image_url: entry.imageUrl || null,
    entry_type: entry.type || 'common',
    part2_result: entry.part2Result || null,
    legacy_timestamp: entry.timestamp || null,
  };
};

// Convert snake_case to camelCase for frontend
const fromDbFormat = (row: StockEntryRow): StockEntryData => {
  return {
    id: row.id,
    stock1: row.stock1 || '',
    stock2: row.stock2 || '',
    stock2b: row.stock2b || '',
    stock2bColor: row.stock2b_color || undefined,
    stock3: row.stock3 || '',
    stock4: row.stock4 || '',
    stock1Date: row.stock1_date ? new Date(row.stock1_date) : null,
    stock2Date: row.stock2_date ? new Date(row.stock2_date) : null,
    stock3Date: row.stock3_date ? new Date(row.stock3_date) : null,
    stock4Date: row.stock4_date ? new Date(row.stock4_date) : null,
    classification: (row.classification as StockEntryData['classification']) || 'NILL',
    dropdown1: row.dropdown1 || undefined,
    dropdown2: row.dropdown2 || undefined,
    dropdown3: row.dropdown3 || undefined,
    dropdown4: row.dropdown4 || undefined,
    dropdown5: row.dropdown5 || undefined,
    dropdown6: row.dropdown6 || undefined,
    dropdown7: row.dropdown7 || undefined,
    dropdown8: row.dropdown8 || undefined,
    dropdown1Date: row.dropdown1_date ? new Date(row.dropdown1_date) : null,
    dropdown2Date: row.dropdown2_date ? new Date(row.dropdown2_date) : null,
    dropdown3Date: row.dropdown3_date ? new Date(row.dropdown3_date) : null,
    dropdown4Date: row.dropdown4_date ? new Date(row.dropdown4_date) : null,
    dropdown5Date: row.dropdown5_date ? new Date(row.dropdown5_date) : null,
    dropdown6Date: row.dropdown6_date ? new Date(row.dropdown6_date) : null,
    dropdown7Date: row.dropdown7_date ? new Date(row.dropdown7_date) : null,
    dropdown8Date: row.dropdown8_date ? new Date(row.dropdown8_date) : null,
    ogCandle: row.og_candle || undefined,
    ogOpenA: row.og_open_a || undefined,
    sdOpenA: row.sd_open_a || undefined,
    ogCloseA: row.og_close_a || undefined,
    sdCloseA: row.sd_close_a || undefined,
    ogOpenADate: row.og_open_a_date ? new Date(row.og_open_a_date) : null,
    ogCloseADate: row.og_close_a_date ? new Date(row.og_close_a_date) : null,
    notes: row.notes || undefined,
    imageUrl: row.image_url || undefined,
    timestamp: row.legacy_timestamp || new Date(row.created_at).getTime(),
    part2Result: row.part2_result || undefined,
    type: (row.entry_type as StockEntryData['type']) || undefined,
  };
};

// Fetch all entries for a user
export const fetchEntries = async (userId: string): Promise<StockEntryData[]> => {
  const { data, error } = await supabase
    .from('stock_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }

  return (data as StockEntryRow[]).map(fromDbFormat);
};

// Create a new entry
export const createEntry = async (entry: StockEntryData, userId: string): Promise<StockEntryData> => {
  const dbEntry = toDbFormat(entry, userId);
  
  const { data, error } = await supabase
    .from('stock_entries')
    .insert(dbEntry)
    .select()
    .single();

  if (error) {
    console.error('Error creating entry:', error);
    throw error;
  }

  return fromDbFormat(data as StockEntryRow);
};

// Update an existing entry
export const updateEntry = async (id: string, entry: Partial<StockEntryData>, userId: string): Promise<StockEntryData> => {
  // Build the update object with only provided fields
  const updateData: Record<string, unknown> = {};
  
  if (entry.stock1 !== undefined) updateData.stock1 = entry.stock1;
  if (entry.stock2 !== undefined) updateData.stock2 = entry.stock2;
  if (entry.stock2b !== undefined) updateData.stock2b = entry.stock2b;
  if (entry.stock2bColor !== undefined) updateData.stock2b_color = entry.stock2bColor;
  if (entry.stock3 !== undefined) updateData.stock3 = entry.stock3;
  if (entry.stock4 !== undefined) updateData.stock4 = entry.stock4;
  if (entry.stock1Date !== undefined) updateData.stock1_date = entry.stock1Date ? new Date(entry.stock1Date).toISOString() : null;
  if (entry.stock2Date !== undefined) updateData.stock2_date = entry.stock2Date ? new Date(entry.stock2Date).toISOString() : null;
  if (entry.stock3Date !== undefined) updateData.stock3_date = entry.stock3Date ? new Date(entry.stock3Date).toISOString() : null;
  if (entry.stock4Date !== undefined) updateData.stock4_date = entry.stock4Date ? new Date(entry.stock4Date).toISOString() : null;
  if (entry.classification !== undefined) updateData.classification = entry.classification;
  if (entry.dropdown1 !== undefined) updateData.dropdown1 = entry.dropdown1;
  if (entry.dropdown2 !== undefined) updateData.dropdown2 = entry.dropdown2;
  if (entry.dropdown3 !== undefined) updateData.dropdown3 = entry.dropdown3;
  if (entry.dropdown4 !== undefined) updateData.dropdown4 = entry.dropdown4;
  if (entry.dropdown5 !== undefined) updateData.dropdown5 = entry.dropdown5;
  if (entry.dropdown6 !== undefined) updateData.dropdown6 = entry.dropdown6;
  if (entry.dropdown7 !== undefined) updateData.dropdown7 = entry.dropdown7;
  if (entry.dropdown8 !== undefined) updateData.dropdown8 = entry.dropdown8;
  if (entry.dropdown1Date !== undefined) updateData.dropdown1_date = entry.dropdown1Date ? new Date(entry.dropdown1Date).toISOString() : null;
  if (entry.dropdown2Date !== undefined) updateData.dropdown2_date = entry.dropdown2Date ? new Date(entry.dropdown2Date).toISOString() : null;
  if (entry.dropdown3Date !== undefined) updateData.dropdown3_date = entry.dropdown3Date ? new Date(entry.dropdown3Date).toISOString() : null;
  if (entry.dropdown4Date !== undefined) updateData.dropdown4_date = entry.dropdown4Date ? new Date(entry.dropdown4Date).toISOString() : null;
  if (entry.dropdown5Date !== undefined) updateData.dropdown5_date = entry.dropdown5Date ? new Date(entry.dropdown5Date).toISOString() : null;
  if (entry.dropdown6Date !== undefined) updateData.dropdown6_date = entry.dropdown6Date ? new Date(entry.dropdown6Date).toISOString() : null;
  if (entry.dropdown7Date !== undefined) updateData.dropdown7_date = entry.dropdown7Date ? new Date(entry.dropdown7Date).toISOString() : null;
  if (entry.dropdown8Date !== undefined) updateData.dropdown8_date = entry.dropdown8Date ? new Date(entry.dropdown8Date).toISOString() : null;
  if (entry.ogCandle !== undefined) updateData.og_candle = entry.ogCandle;
  if (entry.ogOpenA !== undefined) updateData.og_open_a = entry.ogOpenA;
  if (entry.sdOpenA !== undefined) updateData.sd_open_a = entry.sdOpenA;
  if (entry.ogCloseA !== undefined) updateData.og_close_a = entry.ogCloseA;
  if (entry.sdCloseA !== undefined) updateData.sd_close_a = entry.sdCloseA;
  if (entry.ogOpenADate !== undefined) updateData.og_open_a_date = entry.ogOpenADate ? new Date(entry.ogOpenADate).toISOString() : null;
  if (entry.ogCloseADate !== undefined) updateData.og_close_a_date = entry.ogCloseADate ? new Date(entry.ogCloseADate).toISOString() : null;
  if (entry.notes !== undefined) updateData.notes = entry.notes;
  if (entry.imageUrl !== undefined) updateData.image_url = entry.imageUrl;
  if (entry.type !== undefined) updateData.entry_type = entry.type;
  if (entry.part2Result !== undefined) updateData.part2_result = entry.part2Result;

  const { data, error } = await supabase
    .from('stock_entries')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating entry:', error);
    throw error;
  }

  return fromDbFormat(data as StockEntryRow);
};

// Delete an entry
export const deleteEntry = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('stock_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

// Migrate localStorage entries to database
export const migrateLocalStorageEntries = async (userId: string): Promise<number> => {
  const localData = localStorage.getItem('stockEntries');
  if (!localData) return 0;

  const localEntries = JSON.parse(localData) as StockEntryData[];
  if (localEntries.length === 0) return 0;

  let migratedCount = 0;
  
  for (const entry of localEntries) {
    try {
      await createEntry(entry, userId);
      migratedCount++;
    } catch (error) {
      console.error('Error migrating entry:', error);
    }
  }

  // Clear localStorage after successful migration
  if (migratedCount > 0) {
    localStorage.setItem('stockEntries_backup', localData);
    localStorage.removeItem('stockEntries');
  }

  return migratedCount;
};
