import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StockEntryData, StockEntryRow } from '@/types/stockEntry';
import { fetchEntries } from '@/services/stockEntriesService';
import { useAuth } from '@/contexts/AuthContext';

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
    dropdown1Date: row.dropdown1_date ? new Date(row.dropdown1_date) : null,
    dropdown2Date: row.dropdown2_date ? new Date(row.dropdown2_date) : null,
    dropdown3Date: row.dropdown3_date ? new Date(row.dropdown3_date) : null,
    dropdown4Date: row.dropdown4_date ? new Date(row.dropdown4_date) : null,
    dropdown5Date: row.dropdown5_date ? new Date(row.dropdown5_date) : null,
    dropdown6Date: row.dropdown6_date ? new Date(row.dropdown6_date) : null,
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

export const useRealtimeEntries = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<StockEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchEntries(user.id);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to all events without filter, then filter client-side
    // This is more reliable for realtime sync across devices
    const channel = supabase
      .channel('stock_entries_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_entries'
        },
        (payload) => {
          // Filter by user_id on client side for cross-device sync
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as StockEntryRow;
            if (newEntry.user_id === user.id) {
              const entry = fromDbFormat(newEntry);
              setEntries(prev => {
                // Avoid duplicates
                if (prev.some(e => e.id === entry.id)) return prev;
                return [entry, ...prev];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as StockEntryRow;
            if (updatedRow.user_id === user.id) {
              const updatedEntry = fromDbFormat(updatedRow);
              setEntries(prev => 
                prev.map(entry => 
                  entry.id === updatedEntry.id ? updatedEntry : entry
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedRow = payload.old as { id: string; user_id?: string };
            if (!deletedRow.user_id || deletedRow.user_id === user.id) {
              setEntries(prev => prev.filter(entry => entry.id !== deletedRow.id));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { entries, loading, error, refetch: loadEntries };
};
