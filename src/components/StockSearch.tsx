import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import EditEntryDialog from './EditEntryDialog';
import { formatValue } from '@/utils/valueFormatter';

interface StockEntryData {
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
  dropdown1Date?: Date | null;
  dropdown2Date?: Date | null;
  dropdown3Date?: Date | null;
  dropdown4Date?: Date | null;
  ogOpenADate?: Date | null;
  ogCloseADate?: Date | null;
  classification: 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL';
  dropdown1?: string;
  dropdown2?: string;
  dropdown3?: string;
  dropdown4?: string;
  ogCandle?: string;
  ogOpenA?: string;
  ogCloseA?: string;
  notes?: string;
  imageUrl?: string;
  timestamp: number;
}

const StockSearch: React.FC = () => {
  const [searchData, setSearchData] = useState({
    stock1: '',
    ogCandle: '',
    ogOpenA: '',
    ogCloseA: '',
    serialNumber: '',
    notes: ''
  });

  const [dropdowns, setDropdowns] = useState({
    dropdown1Main: '',
    dropdown1Sub: '',
    dropdown2Main: '',
    dropdown2Sub: '',
    dropdown3Main: '',
    dropdown3Sub: '',
    dropdown4Main: '',
    dropdown4Sub: '',
    candleMain: '',
    candleSub: ''
  });

  // Combine INTRO dropdowns
  React.useEffect(() => {
    const combined = [
      dropdowns.dropdown1Main && dropdowns.dropdown1Sub ? `${dropdowns.dropdown1Main} ${dropdowns.dropdown1Sub}` : '',
      dropdowns.dropdown2Main && dropdowns.dropdown2Sub ? `${dropdowns.dropdown2Main} ${dropdowns.dropdown2Sub}` : '',
      dropdowns.dropdown3Main && dropdowns.dropdown3Sub ? `${dropdowns.dropdown3Main} ${dropdowns.dropdown3Sub}` : '',
      dropdowns.dropdown4Main && dropdowns.dropdown4Sub ? `${dropdowns.dropdown4Main} ${dropdowns.dropdown4Sub}` : ''
    ].filter(Boolean).join(' ');
    setSearchData(prev => ({ ...prev, stock1: combined }));
  }, [dropdowns.dropdown1Main, dropdowns.dropdown1Sub, dropdowns.dropdown2Main, dropdowns.dropdown2Sub, dropdowns.dropdown3Main, dropdowns.dropdown3Sub, dropdowns.dropdown4Main, dropdowns.dropdown4Sub]);

  // Combine OG CANDLE dropdowns
  React.useEffect(() => {
    const combined = dropdowns.candleMain && dropdowns.candleSub ? `${dropdowns.candleMain} ${dropdowns.candleSub}` : '';
    setSearchData(prev => ({ ...prev, ogCandle: combined }));
  }, [dropdowns.candleMain, dropdowns.candleSub]);

  const [filter, setFilter] = useState<string>('');
  const [allResults, setAllResults] = useState<StockEntryData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showOnlyDifferentResults, setShowOnlyDifferentResults] = useState(false);
  const [showSameDateDifferent, setShowSameDateDifferent] = useState(false);

  const performSearch = () => {
    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const sortedEntries = existingEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    const hasStockFields = [searchData.stock1, searchData.ogCandle, searchData.ogOpenA, searchData.ogCloseA].some(field => field.trim() !== '');
    const hasSerialNumber = searchData.serialNumber.trim() !== '';
    const hasNotes = searchData.notes.trim() !== '';
    const hasFilter = filter !== '';
    
    if (!hasStockFields && !hasSerialNumber && !hasNotes && !hasFilter) {
      setAllResults([]);
      return;
    }
    
    let matchingEntries = sortedEntries;
    
    if (hasSerialNumber) {
      matchingEntries = matchingEntries.filter((entry, idx) => {
        const serialNum = (sortedEntries.length - idx).toString();
        const searchSerial = searchData.serialNumber.replace('#', '').trim();
        return serialNum === searchSerial;
      });
    }
    
    if (hasFilter) {
      matchingEntries = matchingEntries.filter(entry => 
        entry.classification.toLowerCase() === filter.toLowerCase()
      );
    }
    
    if (hasNotes) {
      matchingEntries = matchingEntries.filter(entry => 
        entry.notes?.toLowerCase().includes(searchData.notes.toLowerCase())
      );
    }
    
    if (hasStockFields) {
      matchingEntries = matchingEntries.filter(entry => {
        const entryValues = [entry.stock1 || '', entry.ogCandle || '', entry.ogOpenA || '', entry.ogCloseA || ''];
        const searchValues = [searchData.stock1, searchData.ogCandle, searchData.ogOpenA, searchData.ogCloseA];
        
        return searchValues.every((searchValue, index) => {
          return !searchValue.trim() || entryValues[index].toLowerCase() === searchValue.toLowerCase();
        });
      });
    }
    
    setAllResults(matchingEntries);
  };

  const getEntryKey = (entry: StockEntryData) => {
    return `${entry.stock1}|${entry.ogCandle}|${entry.ogOpenA}|${entry.ogCloseA}`;
  };

  const duplicatesWithDifferentResults = useMemo(() => {
    const allEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const sortedAllEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    const groups = new Map<string, { entries: StockEntryData[]; indices: number[] }>();
    
    sortedAllEntries.forEach((entry, idx) => {
      const key = getEntryKey(entry);
      if (!groups.has(key)) {
        groups.set(key, { entries: [], indices: [] });
      }
      groups.get(key)!.entries.push(entry);
      groups.get(key)!.indices.push(idx);
    });
    
    const duplicatesWithDifferent: StockEntryData[] = [];
    
    groups.forEach((group) => {
      if (group.entries.length > 1) {
        const classifications = new Set(group.entries.map(e => e.classification));
        if (classifications.size > 1) {
          duplicatesWithDifferent.push(...group.entries);
        }
      }
    });
    
    return duplicatesWithDifferent;
  }, []);

  const sameDateDifferentEntries = useMemo(() => {
    const allEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const sortedAllEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    const groups = new Map<string, { entries: StockEntryData[]; indices: number[] }>();
    
    sortedAllEntries.forEach((entry, idx) => {
      const key = getEntryKey(entry);
      if (!groups.has(key)) {
        groups.set(key, { entries: [], indices: [] });
      }
      groups.get(key)!.entries.push(entry);
      groups.get(key)!.indices.push(idx);
    });
    
    const sameDateDifferent: StockEntryData[] = [];
    
    groups.forEach((group) => {
      if (group.entries.length > 1) {
        const classifications = new Set(group.entries.map(e => e.classification));
        const timestamps = new Set(group.entries.map(e => e.timestamp));
        if (classifications.size === 1 && timestamps.size > 1) {
          sameDateDifferent.push(...group.entries);
        }
      }
    });
    
    return sameDateDifferent;
  }, []);

  const handleShowDuplicates = () => {
    const newValue = !showOnlyDifferentResults;
    setShowOnlyDifferentResults(newValue);
    setShowSameDateDifferent(false);
    
    if (newValue && duplicatesWithDifferentResults.length > 0) {
      setAllResults(duplicatesWithDifferentResults);
      setHasSearched(true);
    } else if (!newValue && allResults.length > 0) {
      performSearch();
    }
  };

  const handleShowSameDateDifferent = () => {
    const newValue = !showSameDateDifferent;
    setShowSameDateDifferent(newValue);
    setShowOnlyDifferentResults(false);
    
    if (newValue && sameDateDifferentEntries.length > 0) {
      setAllResults(sameDateDifferentEntries);
      setHasSearched(true);
    } else if (!newValue && allResults.length > 0) {
      performSearch();
    }
  };

  const handleEntryUpdated = () => {
    performSearch();
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value.toUpperCase()
    }));
    
    setTimeout(() => {
      performSearch();
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    performSearch();
  };

  const handleRefresh = () => {
    setSearchData({
      stock1: '',
      ogCandle: '',
      ogOpenA: '',
      ogCloseA: '',
      serialNumber: '',
      notes: ''
    });
    setDropdowns({
      dropdown1Main: '',
      dropdown1Sub: '',
      dropdown2Main: '',
      dropdown2Sub: '',
      dropdown3Main: '',
      dropdown3Sub: '',
      dropdown4Main: '',
      dropdown4Sub: '',
      candleMain: '',
      candleSub: ''
    });
    setFilter('');
    setAllResults([]);
    setHasSearched(false);
    setShowOnlyDifferentResults(false);
    setShowSameDateDifferent(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Entry Combination
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* INTRO Section */}
          <div className="space-y-4 pb-4 mb-4 border-b">
            <Label className="text-lg font-bold">INTRO</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* INTRO 1 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">INTRO 1</Label>
                <div className="flex gap-2">
                  <Select 
                    value={dropdowns.dropdown1Main}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown1Main: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown1Main ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="YG" className="text-lg font-bold">YG</SelectItem>
                      <SelectItem value="YR" className="text-lg font-bold">YR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={dropdowns.dropdown1Sub}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown1Sub: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown1Sub ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="UP" className="text-lg font-bold">UP</SelectItem>
                      <SelectItem value="DOWN" className="text-lg font-bold">DOWN</SelectItem>
                      <SelectItem value="+" className="text-lg font-bold">+</SelectItem>
                      <SelectItem value="-" className="text-lg font-bold">-</SelectItem>
                      <SelectItem value="B" className="text-lg font-bold">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* INTRO 2 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">INTRO 2</Label>
                <div className="flex gap-2">
                  <Select 
                    value={dropdowns.dropdown2Main}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown2Main: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown2Main ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                      <SelectItem value="ER" className="text-lg font-bold">ER</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={dropdowns.dropdown2Sub}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown2Sub: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown2Sub ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="UP" className="text-lg font-bold">UP</SelectItem>
                      <SelectItem value="DOWN" className="text-lg font-bold">DOWN</SelectItem>
                      <SelectItem value="+" className="text-lg font-bold">+</SelectItem>
                      <SelectItem value="-" className="text-lg font-bold">-</SelectItem>
                      <SelectItem value="B" className="text-lg font-bold">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* INTRO 3 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">INTRO 3</Label>
                <div className="flex gap-2">
                  <Select 
                    value={dropdowns.dropdown3Main}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown3Main: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown3Main ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                      <SelectItem value="ER" className="text-lg font-bold">ER</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={dropdowns.dropdown3Sub}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown3Sub: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown3Sub ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="UP" className="text-lg font-bold">UP</SelectItem>
                      <SelectItem value="DOWN" className="text-lg font-bold">DOWN</SelectItem>
                      <SelectItem value="+" className="text-lg font-bold">+</SelectItem>
                      <SelectItem value="-" className="text-lg font-bold">-</SelectItem>
                      <SelectItem value="B" className="text-lg font-bold">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* INTRO 4 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">INTRO 4</Label>
                <div className="flex gap-2">
                  <Select 
                    value={dropdowns.dropdown4Main}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown4Main: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown4Main ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                      <SelectItem value="ER" className="text-lg font-bold">ER</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={dropdowns.dropdown4Sub}
                    onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown4Sub: value }))}
                  >
                    <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.dropdown4Sub ? '#dcfce7' : '#ffe3e2' }}>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="UP" className="text-lg font-bold">UP</SelectItem>
                      <SelectItem value="DOWN" className="text-lg font-bold">DOWN</SelectItem>
                      <SelectItem value="+" className="text-lg font-bold">+</SelectItem>
                      <SelectItem value="-" className="text-lg font-bold">-</SelectItem>
                      <SelectItem value="B" className="text-lg font-bold">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* OG CANDLE Section */}
          <div className="space-y-2">
            <Label className="text-lg font-bold">OG CANDLE</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                value={dropdowns.candleMain}
                onValueChange={(value) => setDropdowns(prev => ({ ...prev, candleMain: value }))}
              >
                <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.candleMain ? '#dcfce7' : '#ffe3e2' }}>
                  <SelectValue placeholder="Select Candle" />
                </SelectTrigger>
                <SelectContent className="bg-card z-[100]">
                  {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={`CANDLE ${num}`} className="text-lg font-bold">
                      CANDLE {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={dropdowns.candleSub}
                onValueChange={(value) => setDropdowns(prev => ({ ...prev, candleSub: value }))}
              >
                <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: dropdowns.candleSub ? '#dcfce7' : '#ffe3e2' }}>
                  <SelectValue placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent className="bg-card z-[100]">
                  <SelectItem value="RED" className="text-lg font-bold">RED</SelectItem>
                  <SelectItem value="GREEN" className="text-lg font-bold">GREEN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* OG OPEN A and OG CLOSE A */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-lg font-bold">OG OPEN A</Label>
              <Select 
                value={searchData.ogOpenA}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, ogOpenA: value }))}
              >
                <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: searchData.ogOpenA ? '#dcfce7' : '#ffe3e2' }}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card z-[100]">
                  <SelectItem value="OR-" className="text-lg font-bold">OR-</SelectItem>
                  <SelectItem value="OR+" className="text-lg font-bold">OR+</SelectItem>
                  <SelectItem value="ORB" className="text-lg font-bold">ORB</SelectItem>
                  <SelectItem value="OG-" className="text-lg font-bold">OG-</SelectItem>
                  <SelectItem value="OG+" className="text-lg font-bold">OG+</SelectItem>
                  <SelectItem value="OGB" className="text-lg font-bold">OGB</SelectItem>
                  <SelectItem value="CG-" className="text-lg font-bold">CG-</SelectItem>
                  <SelectItem value="CG+" className="text-lg font-bold">CG+</SelectItem>
                  <SelectItem value="CGB" className="text-lg font-bold">CGB</SelectItem>
                  <SelectItem value="CR-" className="text-lg font-bold">CR-</SelectItem>
                  <SelectItem value="CR+" className="text-lg font-bold">CR+</SelectItem>
                  <SelectItem value="CRB" className="text-lg font-bold">CRB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-bold">OG CLOSE A</Label>
              <Select 
                value={searchData.ogCloseA}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, ogCloseA: value }))}
              >
                <SelectTrigger className="text-lg font-bold" style={{ backgroundColor: searchData.ogCloseA ? '#dcfce7' : '#ffe3e2' }}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card z-[100]">
                  <SelectItem value="OR-" className="text-lg font-bold">OR-</SelectItem>
                  <SelectItem value="OR+" className="text-lg font-bold">OR+</SelectItem>
                  <SelectItem value="ORB" className="text-lg font-bold">ORB</SelectItem>
                  <SelectItem value="OG-" className="text-lg font-bold">OG-</SelectItem>
                  <SelectItem value="OG+" className="text-lg font-bold">OG+</SelectItem>
                  <SelectItem value="OGB" className="text-lg font-bold">OGB</SelectItem>
                  <SelectItem value="CG-" className="text-lg font-bold">CG-</SelectItem>
                  <SelectItem value="CG+" className="text-lg font-bold">CG+</SelectItem>
                  <SelectItem value="CGB" className="text-lg font-bold">CGB</SelectItem>
                  <SelectItem value="CR-" className="text-lg font-bold">CR-</SelectItem>
                  <SelectItem value="CR+" className="text-lg font-bold">CR+</SelectItem>
                  <SelectItem value="CRB" className="text-lg font-bold">CRB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial-number" className="text-xl font-bold">SERIAL NUMBER</Label>
            <input
              id="serial-number"
              type="text"
              placeholder="Search by serial number..."
              value={searchData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              className="w-full px-3 py-2 text-base border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-notes" className="text-xl font-bold">NOTES</Label>
            <Textarea
              id="search-notes"
              placeholder="Search by notes..."
              value={searchData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="text-base min-h-[80px]"
            />
            {hasSearched && (searchData.stock1 || searchData.ogCandle || searchData.ogOpenA || searchData.ogCloseA || searchData.serialNumber || searchData.notes || filter) && allResults.length === 0 && (
              <div className="bg-red-600 text-white font-bold text-2xl p-4 rounded-lg text-center">
                No result
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xl font-bold">RESULT</div>
            <Select onValueChange={(value) => {
              setFilter(value);
              setTimeout(() => performSearch(), 100);
            }} value={filter}>
              <SelectTrigger className={`text-xl font-bold ${filter ? 'bg-green-100 hover:bg-green-200' : 'bg-yellow-100 hover:bg-yellow-200'}`}>
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Front Act" className="text-xl font-bold">Front Act</SelectItem>
                <SelectItem value="Act" className="text-xl font-bold">Act</SelectItem>
                <SelectItem value="Consolidation Close" className="text-xl font-bold">Consolidation Close</SelectItem>
                <SelectItem value="Consolidation Act" className="text-xl font-bold">Consolidation Act</SelectItem>
                <SelectItem value="Consolidation Front Act" className="text-xl font-bold">Consolidation Front Act</SelectItem>
                <SelectItem value="Act doubt" className="text-xl font-bold">Act doubt</SelectItem>
                <SelectItem value="3rd act" className="text-xl font-bold">3rd act</SelectItem>
                <SelectItem value="4th act" className="text-xl font-bold">4th act</SelectItem>
                <SelectItem value="5th act" className="text-xl font-bold">5th act</SelectItem>
                <SelectItem value="NILL" className="text-xl font-bold">NILL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-8 py-3">
              Search
            </Button>
            <Button type="button" onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-8 py-3">
              Refresh
            </Button>
          </div>

          <div className="flex gap-4 justify-center pt-2">
            <Button 
              type="button" 
              onClick={handleShowDuplicates}
              className={`font-bold text-lg px-6 py-2 ${
                showOnlyDifferentResults 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-800'
              }`}
            >
              {showOnlyDifferentResults ? 'Hide' : 'Show'} Duplicates ({duplicatesWithDifferentResults.length})
            </Button>
            <Button 
              type="button" 
              onClick={handleShowSameDateDifferent}
              className={`font-bold text-lg px-6 py-2 text-white`}
              style={{ backgroundColor: showSameDateDifferent ? '#2b6df5' : '#93c5fd' }}
            >
              {showSameDateDifferent ? 'Hide' : 'Show'} Same Result ({sameDateDifferentEntries.length})
            </Button>
          </div>
        </form>

        {allResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-extrabold text-2xl">
              Search Results ({allResults.length}):
              {showOnlyDifferentResults && (
                <Badge variant="outline" className="ml-3 bg-orange-100 text-orange-800 border-orange-300">
                  Showing duplicates with different results
                </Badge>
              )}
              {showSameDateDifferent && (
                <Badge variant="outline" className="ml-3 text-white border-white" style={{ backgroundColor: '#2b6df5' }}>
                  Duplicate entry with same result
                </Badge>
              )}
            </h3>
            {allResults.map((entry, idx) => {
              const allEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
              const sortedEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);
              const serialNumber = sortedEntries.length - sortedEntries.findIndex(e => e.timestamp === entry.timestamp);
              
              return (
                <Card key={idx} className="p-4 bg-card">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary font-bold text-lg">
                      Entry #{serialNumber}
                    </Badge>
                    <EditEntryDialog 
                      entry={entry}
                      index={sortedEntries.findIndex(e => e.timestamp === entry.timestamp)}
                      serialNumber={serialNumber}
                      onEntryUpdated={handleEntryUpdated}
                    />
                  </div>
                  <div className="space-y-3">
                    {entry.stock1 && (
                      <div className="text-lg">
                        <span className="font-medium text-muted-foreground">INTRO: </span>
                        <span className="font-bold">{formatValue(entry.stock1)}</span>
                      </div>
                    )}
                    {entry.ogCandle && (
                      <div className="text-lg">
                        <span className="font-medium text-muted-foreground">OG CANDLE: </span>
                        <span className="font-bold">{formatValue(entry.ogCandle)}</span>
                      </div>
                    )}
                    {entry.ogOpenA && (
                      <div className="text-lg">
                        <span className="font-medium text-muted-foreground">OG OPEN A: </span>
                        <span className="font-bold">{formatValue(entry.ogOpenA)}</span>
                      </div>
                    )}
                    {entry.ogCloseA && (
                      <div className="text-lg">
                        <span className="font-medium text-muted-foreground">OG CLOSE A: </span>
                        <span className="font-bold">{formatValue(entry.ogCloseA)}</span>
                      </div>
                    )}
                    {entry.classification === "Act" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 w-fit text-lg">
                        <TrendingUp className="h-4 w-4" />
                        Act
                      </Badge>
                    ) : entry.classification === "Front Act" ? (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1 w-fit text-lg">
                        <TrendingDown className="h-4 w-4" />
                        Front Act
                      </Badge>
                    ) : entry.classification === "Consolidation Act" ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1 w-fit text-lg">
                        <TrendingUp className="h-4 w-4" />
                        Consolidation Act
                      </Badge>
                    ) : entry.classification === "Consolidation Front Act" ? (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1 w-fit text-lg">
                        <TrendingDown className="h-4 w-4" />
                        Consolidation Front Act
                      </Badge>
                    ) : entry.classification === "Consolidation Close" ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 w-fit text-lg">
                        <TrendingUp className="h-4 w-4" />
                        Consolidation Close
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground w-fit text-lg">
                        {entry.classification}
                      </Badge>
                    )}
                    {entry.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded text-base">
                        <span className="font-medium text-muted-foreground">Notes: </span>
                        <span className="text-foreground">{entry.notes}</span>
                      </div>
                    )}
                    {entry.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={entry.imageUrl}
                          alt="Note image"
                          className="max-w-full h-64 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSearch;
