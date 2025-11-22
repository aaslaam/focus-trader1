import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, TrendingUp, TrendingDown, Calendar, Filter, CalendarIcon, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SimpleOptionSelector from '@/components/SimpleOptionSelector';
import EditEntryDialog from './EditEntryDialog';
import { formatValue } from '@/utils/valueFormatter';

interface StockEntryData {
  stock1: string;
  stock2: string;
  stock2b: string;
  stock2bColor?: string;
  stock3: string;
  openb: string;
  stock4: string;
  stock4b: string;
  stock1Date: Date | null;
  stock2Date: Date | null;
  stock3Date: Date | null;
  stock4Date: Date | null;
  stock4bDate?: Date | null;
  openbDate?: Date | null;
  dropdown1?: string;
  dropdown2?: string;
  dropdown3?: string;
  dropdown4?: string;
  ogCandle?: string;
  ogOpenA?: string;
  ogCloseA?: string;
  classification: 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL';
  notes?: string;
  imageUrl?: string;
  timestamp: number;
  part1Result?: string;
  part2Result?: string;
}

const StockSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('common');
  const [searchData, setSearchData] = useState({
    stock1: '',
    stock2: '',
    stock2b: '',
    stock2bColor: '',
    stock3: '',
    openb: '',
    stock4: '',
    stock4b: '',
    dropdown1: '',
    dropdown2: '',
    dropdown3: '',
    dropdown4: '',
    ogCandle: '',
    ogOpenA: '',
    ogCloseA: '',
    serialNumber: '',
    notes: ''
  });
  const [filter, setFilter] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{ classification: string; dates: { stock1Date: Date | null; stock3Date: Date | null; stock4Date: Date | null; }; notes?: string; imageUrl?: string; } | null>(null);
  const [allResults, setAllResults] = useState<StockEntryData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showOnlyDifferentResults, setShowOnlyDifferentResults] = useState(false);
  const [showSameDateDifferent, setShowSameDateDifferent] = useState(false);

  // No longer needed - using SimpleOptionSelector

  const performSearch = () => {
    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const sortedEntries = existingEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    // Check if any search criteria is provided
    const hasStockFields = [
      searchData.stock1, searchData.stock2, searchData.stock2b, searchData.stock2bColor, 
      searchData.stock3, searchData.openb, searchData.stock4, searchData.stock4b,
      searchData.dropdown1, searchData.dropdown2, searchData.dropdown3, searchData.dropdown4,
      searchData.ogCandle, searchData.ogOpenA, searchData.ogCloseA
    ].some(field => field.trim() !== '');
    const hasSerialNumber = searchData.serialNumber.trim() !== '';
    const hasNotes = searchData.notes.trim() !== '';
    const hasFilter = filter !== '';
    
    // If no search criteria at all, clear results
    if (!hasStockFields && !hasSerialNumber && !hasNotes && !hasFilter) {
      setSearchResult(null);
      setAllResults([]);
      return;
    }
    
    // Start with all entries, then filter
    let matchingEntries = sortedEntries;
    
    // Filter by tab (Part 1, Part 2, or Common)
    if (activeTab === 'part1') {
      // Only entries with part1Result and NO part2Result
      matchingEntries = matchingEntries.filter(entry => entry.part1Result && !entry.part2Result);
    } else if (activeTab === 'part2') {
      // Only entries with part2Result and NO part1Result
      matchingEntries = matchingEntries.filter(entry => entry.part2Result && !entry.part1Result);
    }
    // For 'common', show all entries (no additional filtering)
    
    // Filter by serial number if provided
    if (hasSerialNumber) {
      matchingEntries = matchingEntries.filter((entry, idx) => {
        const serialNum = (sortedEntries.length - idx).toString();
        const searchSerial = searchData.serialNumber.replace('#', '').trim();
        return serialNum === searchSerial;
      });
    }
    
    // Filter by classification if provided
    if (hasFilter) {
      matchingEntries = matchingEntries.filter(entry => 
        entry.classification.toLowerCase() === filter.toLowerCase()
      );
    }
    
    // Filter by notes if provided
    if (hasNotes) {
      matchingEntries = matchingEntries.filter(entry => 
        entry.notes && entry.notes.toLowerCase().includes(searchData.notes.toLowerCase())
      );
    }
    
    // Filter by stock fields if provided
    if (hasStockFields) {
      matchingEntries = matchingEntries.filter(entry => {
        const entryValues = [
          entry.stock1, entry.stock2, entry.stock2b || '', entry.stock2bColor || '', 
          entry.stock3, entry.openb || '', entry.stock4, entry.stock4b || '',
          entry.dropdown1 || '', entry.dropdown2 || '', entry.dropdown3 || '', entry.dropdown4 || '',
          entry.ogCandle || '', entry.ogOpenA || '', entry.ogCloseA || ''
        ];
        const searchValues = [
          searchData.stock1, searchData.stock2, searchData.stock2b, searchData.stock2bColor, 
          searchData.stock3, searchData.openb, searchData.stock4, searchData.stock4b,
          searchData.dropdown1, searchData.dropdown2, searchData.dropdown3, searchData.dropdown4,
          searchData.ogCandle, searchData.ogOpenA, searchData.ogCloseA
        ];
        
        // Check if all selected search values match the entry
        return searchValues.every((searchValue, index) => {
          return !searchValue.trim() || entryValues[index].toLowerCase() === searchValue.toLowerCase();
        });
      });
    }
    
    // Display all matching results
    setSearchResult(null);
    setAllResults(matchingEntries);
  };

  // Helper function to create a unique key for grouping entries
  const getEntryKey = (entry: StockEntryData) => {
    return `${entry.stock2}|${entry.stock2b}|${entry.stock2bColor}|${entry.stock3}|${entry.openb}|${entry.stock4}|${entry.stock4b}`;
  };

  // Find duplicates with different results
  const duplicatesWithDifferentResults = useMemo(() => {
    const allEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const sortedAllEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    // Group entries by their stock values
    const groups = new Map<string, { entries: StockEntryData[]; indices: number[] }>();
    
    sortedAllEntries.forEach((entry, idx) => {
      const key = getEntryKey(entry);
      if (!groups.has(key)) {
        groups.set(key, { entries: [], indices: [] });
      }
      groups.get(key)!.entries.push(entry);
      groups.get(key)!.indices.push(idx);
    });
    
    // Find groups with different classifications (different results)
    const duplicatesWithDifferent: StockEntryData[] = [];
    
    groups.forEach((group) => {
      if (group.entries.length > 1) {
        const classifications = new Set(group.entries.map(e => e.classification));
        
        // Include ONLY if they have different results (classifications)
        if (classifications.size > 1) {
          duplicatesWithDifferent.push(...group.entries);
        }
      }
    });
    
    return duplicatesWithDifferent;
  }, []);

  // Find entries with same values, different dates, but same result
  const sameDateDifferentEntries = useMemo(() => {
    const allEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const sortedAllEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log('Total entries:', sortedAllEntries.length);
    
    // Group entries by their stock values
    const groups = new Map<string, { entries: StockEntryData[]; indices: number[] }>();
    
    sortedAllEntries.forEach((entry, idx) => {
      const key = getEntryKey(entry);
      if (!groups.has(key)) {
        groups.set(key, { entries: [], indices: [] });
      }
      groups.get(key)!.entries.push(entry);
      groups.get(key)!.indices.push(idx);
    });
    
    console.log('Total groups:', groups.size);
    
    // Find groups with same classification but different dates
    const sameDateDifferent: StockEntryData[] = [];
    
    groups.forEach((group, key) => {
      if (group.entries.length > 1) {
        const classifications = new Set(group.entries.map(e => e.classification));
        const timestamps = new Set(group.entries.map(e => e.timestamp));
        
        console.log('Group:', key, 'Entries:', group.entries.length, 'Classifications:', classifications.size, 'Timestamps:', timestamps.size);
        
        // Include if they have same result BUT different timestamps (dates)
        if (classifications.size === 1 && timestamps.size > 1) {
          console.log('✓ Adding group with same classification but different timestamps');
          sameDateDifferent.push(...group.entries);
        }
      }
    });
    
    console.log('Same Date Different entries found:', sameDateDifferent.length);
    
    return sameDateDifferent;
  }, []);

  const handleShowDuplicates = () => {
    const newValue = !showOnlyDifferentResults;
    setShowOnlyDifferentResults(newValue);
    setShowSameDateDifferent(false);
    
    if (newValue && duplicatesWithDifferentResults.length > 0) {
      // Show duplicate entries
      setAllResults(duplicatesWithDifferentResults);
      setHasSearched(true);
    } else if (!newValue && allResults.length > 0) {
      // If turning off, rerun the search to show normal results
      performSearch();
    }
  };

  const handleShowSameDateDifferent = () => {
    const newValue = !showSameDateDifferent;
    console.log('handleShowSameDateDifferent clicked, newValue:', newValue);
    console.log('sameDateDifferentEntries.length:', sameDateDifferentEntries.length);
    
    setShowSameDateDifferent(newValue);
    setShowOnlyDifferentResults(false);
    
    if (newValue && sameDateDifferentEntries.length > 0) {
      console.log('Showing same date different entries:', sameDateDifferentEntries);
      // Show entries with same values, different dates, same result
      setAllResults(sameDateDifferentEntries);
      setHasSearched(true);
    } else if (!newValue && allResults.length > 0) {
      console.log('Turning off filter, running performSearch');
      // If turning off, rerun the search to show normal results
      performSearch();
    }
  };

  const handleEntryUpdate = () => {
    // Reload search results after editing
    performSearch();
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value.toUpperCase()
    }));
    
    // Trigger search after a short delay (debounce)
    setTimeout(() => {
      performSearch();
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    performSearch();
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
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setTimeout(() => performSearch(), 100);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="part1" className="text-lg font-bold">PART 1</TabsTrigger>
            <TabsTrigger value="part2" className="text-lg font-bold">PART 2</TabsTrigger>
            <TabsTrigger value="common" className="text-lg font-bold">COMMON</TabsTrigger>
          </TabsList>

          <TabsContent value="part1">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="DIRECTION A"
                    selectedValue={searchData.stock2}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, stock2: value }))}
                    baseOptions={['CG UP', 'CG IN', 'CG DOWN', 'CR UP', 'CR IN', 'CR DOWN']}
                    hideModifier={true}
                  />
                  <SimpleOptionSelector
                    label="COLOUR"
                    selectedValue={searchData.stock2bColor || ''}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, stock2bColor: value }))}
                    baseOptions={['RED', 'GREEN']}
                    hideModifier={true}
                  />
                </div>
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="B"
                    selectedValue={searchData.stock2b}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, stock2b: value }))}
                    baseOptions={['CG IN', 'CG DOWN', 'CG UP', 'CR IN', 'CR UP', 'CR DOWN']}
                    hideModifier={true}
                    customBackgroundStyle={{ empty: { backgroundColor: '#ffe3e2' }, filled: { backgroundColor: '#dcfce7' } }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="OPEN A"
                    selectedValue={searchData.stock3}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, stock3: value }))}
                    baseOptions={['CG+', 'CG-', 'CGB', 'CR+', 'CR-', 'CRB', 'OG+', 'OG-', 'OGB', 'OR+', 'OR-', 'ORB', 'SD CG-', 'SD CG+', 'SD CGB', 'SD CR-', 'SD CR+', 'SD CRB', 'NILL']}
                    hideModifier={true}
                  />
                </div>
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="CLOSE A"
                    selectedValue={searchData.stock4}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, stock4: value }))}
                    baseOptions={['CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB', 'OG-', 'OG+', 'OGB', 'OR-', 'OR+', 'ORB', 'NILL']}
                    hideModifier={true}
                  />
                </div>
              </div>

              {/* INTRO Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">INTRO 1</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={searchData.dropdown1.split(' ')[0] || ''}
                      onValueChange={(value) => {
                        const sub = searchData.dropdown1.split(' ')[1] || '';
                        setSearchData(prev => ({ ...prev, dropdown1: sub ? `${value} ${sub}` : value }));
                        setTimeout(() => performSearch(), 100);
                      }}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold flex-1"
                        style={{ backgroundColor: searchData.dropdown1.split(' ')[0] ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                        <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={searchData.dropdown1.split(' ')[1] || ''}
                      onValueChange={(value) => {
                        const main = searchData.dropdown1.split(' ')[0] || '';
                        setSearchData(prev => ({ ...prev, dropdown1: main ? `${main} ${value}` : value }));
                        setTimeout(() => performSearch(), 100);
                      }}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold flex-1"
                        style={{ backgroundColor: searchData.dropdown1.split(' ')[1] ? '#dcfce7' : '#ffe3e2' }}
                      >
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
                <div className="space-y-2">
                  <Label className="text-sm font-bold">INTRO 2</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={searchData.dropdown2.split(' ')[0] || ''}
                      onValueChange={(value) => {
                        const sub = searchData.dropdown2.split(' ')[1] || '';
                        setSearchData(prev => ({ ...prev, dropdown2: sub ? `${value} ${sub}` : value }));
                        setTimeout(() => performSearch(), 100);
                      }}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold flex-1"
                        style={{ backgroundColor: searchData.dropdown2.split(' ')[0] ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                        <SelectItem value="ER" className="text-lg font-bold">ER</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={searchData.dropdown2.split(' ')[1] || ''}
                      onValueChange={(value) => {
                        const main = searchData.dropdown2.split(' ')[0] || '';
                        setSearchData(prev => ({ ...prev, dropdown2: main ? `${main} ${value}` : value }));
                        setTimeout(() => performSearch(), 100);
                      }}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold flex-1"
                        style={{ backgroundColor: searchData.dropdown2.split(' ')[1] ? '#dcfce7' : '#ffe3e2' }}
                      >
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
                <div className="space-y-2">
                  <Label className="text-sm font-bold">INTRO 3</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={searchData.dropdown3.split(' ')[0] || ''}
                      onValueChange={(value) => {
                        const sub = searchData.dropdown3.split(' ')[1] || '';
                        setSearchData(prev => ({ ...prev, dropdown3: sub ? `${value} ${sub}` : value }));
                        setTimeout(() => performSearch(), 100);
                      }}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold flex-1"
                        style={{ backgroundColor: searchData.dropdown3.split(' ')[0] ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="DG" className="text-lg font-bold">DG</SelectItem>
                        <SelectItem value="DR" className="text-lg font-bold">DR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={searchData.dropdown3.split(' ')[1] || ''}
                      onValueChange={(value) => {
                        const main = searchData.dropdown3.split(' ')[0] || '';
                        setSearchData(prev => ({ ...prev, dropdown3: main ? `${main} ${value}` : value }));
                        setTimeout(() => performSearch(), 100);
                      }}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold flex-1"
                        style={{ backgroundColor: searchData.dropdown3.split(' ')[1] ? '#dcfce7' : '#ffe3e2' }}
                      >
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

              <div className="space-y-2">
                <Label htmlFor="serial-number-part1" className="text-xl font-bold">SERIAL NUMBER</Label>
                <input
                  id="serial-number-part1"
                  type="text"
                  placeholder="Search by serial number..."
                  value={searchData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-notes-part1" className="text-xl font-bold">NOTES</Label>
                <Textarea
                  id="search-notes-part1"
                  placeholder="Search by notes..."
                  value={searchData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="text-base min-h-[80px]"
                />
                {hasSearched && (searchData.stock2 || searchData.stock2b || searchData.stock3 || searchData.stock4 || searchData.dropdown1 || searchData.dropdown2 || searchData.dropdown3 || searchData.serialNumber || searchData.notes || filter) && allResults.length === 0 && (
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
                    <SelectItem value="Consolidation Front Act" className="text-xl font-bold">Consolidation Front Act</SelectItem>
                    <SelectItem value="Consolidation Act" className="text-xl font-bold">Consolidation Act</SelectItem>
                    <SelectItem value="Act doubt" className="text-xl font-bold">Act doubt</SelectItem>
                    <SelectItem value="3rd act" className="text-xl font-bold">3rd act</SelectItem>
                    <SelectItem value="4th act" className="text-xl font-bold">4th act</SelectItem>
                    <SelectItem value="5th act" className="text-xl font-bold">5th act</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" variant="default">
                    <Search className="h-4 w-4 mr-2" />
                    Search & Filter
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchData({ stock1: '', stock2: '', stock2b: '', stock2bColor: '', stock3: '', openb: '', stock4: '', stock4b: '', dropdown1: '', dropdown2: '', dropdown3: '', dropdown4: '', ogCandle: '', ogOpenA: '', ogCloseA: '', serialNumber: '', notes: '' });
                      setFilter('');
                      setSearchResult(null);
                      setAllResults([]);
                      setHasSearched(false);
                      setShowOnlyDifferentResults(false);
                      setShowSameDateDifferent(false);
                    }}
                    className="flex items-center gap-2 border-border bg-white text-green-600 hover:bg-white hover:text-green-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                    <span className="text-green-600 font-bold">Refresh</span>
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    onClick={handleShowDuplicates}
                    className="flex-1 flex items-center justify-center gap-2 text-gray-900 font-bold"
                    style={{ backgroundColor: showOnlyDifferentResults ? '#22c55e' : '#bbf7d0' }}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="font-bold">
                      {showOnlyDifferentResults ? 'Show All Results' : 'Show Duplicate Entries with Different Results'}
                    </span>
                    {duplicatesWithDifferentResults.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {duplicatesWithDifferentResults.length}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    onClick={handleShowSameDateDifferent}
                    className="flex-1 flex items-center justify-center gap-2 text-gray-900 font-bold"
                    style={{ backgroundColor: showSameDateDifferent ? '#22c55e' : '#bbf7d0' }}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>
                      {showSameDateDifferent ? 'Show All Results' : 'Show duplicate with same result'}
                    </span>
                    {sameDateDifferentEntries.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {sameDateDifferentEntries.length}
                      </Badge>
                    )}
                  </Button>
            </div>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="part2">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG DIRECTION A</Label>
                  <Select 
                    value={searchData.dropdown1}
                    onValueChange={(value) => {
                      setSearchData(prev => ({ ...prev, dropdown1: value }));
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: searchData.dropdown1 ? '#dcfce7' : '#ffe3e2' }}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="OG" className="text-lg font-bold">OG</SelectItem>
                      <SelectItem value="OR" className="text-lg font-bold">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG DIRECTION B</Label>
                  <Select 
                    value={searchData.dropdown2}
                    onValueChange={(value) => {
                      setSearchData(prev => ({ ...prev, dropdown2: value }));
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: searchData.dropdown2 ? '#dcfce7' : '#ffe3e2' }}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                      <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                      <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                      <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                      <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG DIRECTION C</Label>
                  <Select 
                    value={searchData.dropdown3}
                    onValueChange={(value) => {
                      setSearchData(prev => ({ ...prev, dropdown3: value }));
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: searchData.dropdown3 ? '#dcfce7' : '#ffe3e2' }}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                      <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                      <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                      <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                      <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG DIRECTION D</Label>
                  <Select 
                    value={searchData.dropdown4}
                    onValueChange={(value) => {
                      setSearchData(prev => ({ ...prev, dropdown4: value }));
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: searchData.dropdown4 ? '#dcfce7' : '#ffe3e2' }}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                      <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                      <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                      <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                      <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">OG CANDLE</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    value={searchData.ogCandle.split(' ')[0] + ' ' + searchData.ogCandle.split(' ')[1] || ''}
                    onValueChange={(value) => {
                      const color = searchData.ogCandle.split(' ')[2] || '';
                      setSearchData(prev => ({ ...prev, ogCandle: color ? `${value} ${color}` : value }));
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: searchData.ogCandle.includes('CANDLE') ? '#dcfce7' : '#ffe3e2' }}
                    >
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
                    value={searchData.ogCandle.split(' ')[2] || ''}
                    onValueChange={(value) => {
                      const candle = `${searchData.ogCandle.split(' ')[0] || ''} ${searchData.ogCandle.split(' ')[1] || ''}`.trim();
                      setSearchData(prev => ({ ...prev, ogCandle: candle ? `${candle} ${value}` : value }));
                      setTimeout(() => performSearch(), 100);
                    }}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: (searchData.ogCandle.includes('RED') || searchData.ogCandle.includes('GREEN')) ? '#dcfce7' : '#ffe3e2' }}
                    >
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-[100]">
                      <SelectItem value="RED" className="text-lg font-bold">RED</SelectItem>
                      <SelectItem value="GREEN" className="text-lg font-bold">GREEN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="OG OPEN A"
                    selectedValue={searchData.ogOpenA}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, ogOpenA: value }))}
                    baseOptions={['OR-', 'OR+', 'ORB', 'OG-', 'OG+', 'OGB', 'CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB']}
                    hideModifier={true}
                  />
                </div>
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="OG CLOSE A"
                    selectedValue={searchData.ogCloseA}
                    onValueChange={(value) => setSearchData(prev => ({ ...prev, ogCloseA: value }))}
                    baseOptions={['OR-', 'OR+', 'ORB', 'OG-', 'OG+', 'OGB', 'CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB']}
                    hideModifier={true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial-number-part2" className="text-xl font-bold">SERIAL NUMBER</Label>
                <input
                  id="serial-number-part2"
                  type="text"
                  placeholder="Search by serial number..."
                  value={searchData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full px-3 py-2 text-base border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-notes-part2" className="text-xl font-bold">NOTES</Label>
                <Textarea
                  id="search-notes-part2"
                  placeholder="Search by notes..."
                  value={searchData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="text-base min-h-[80px]"
                />
                {hasSearched && (searchData.dropdown1 || searchData.dropdown2 || searchData.dropdown3 || searchData.dropdown4 || searchData.ogCandle || searchData.ogOpenA || searchData.ogCloseA || searchData.serialNumber || searchData.notes || filter) && allResults.length === 0 && (
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
                    <SelectItem value="Consolidation Front Act" className="text-xl font-bold">Consolidation Front Act</SelectItem>
                    <SelectItem value="Consolidation Act" className="text-xl font-bold">Consolidation Act</SelectItem>
                    <SelectItem value="Act doubt" className="text-xl font-bold">Act doubt</SelectItem>
                    <SelectItem value="3rd act" className="text-xl font-bold">3rd act</SelectItem>
                    <SelectItem value="4th act" className="text-xl font-bold">4th act</SelectItem>
                    <SelectItem value="5th act" className="text-xl font-bold">5th act</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" variant="default">
                    <Search className="h-4 w-4 mr-2" />
                    Search & Filter
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchData({ stock1: '', stock2: '', stock2b: '', stock2bColor: '', stock3: '', openb: '', stock4: '', stock4b: '', dropdown1: '', dropdown2: '', dropdown3: '', dropdown4: '', ogCandle: '', ogOpenA: '', ogCloseA: '', serialNumber: '', notes: '' });
                      setFilter('');
                      setSearchResult(null);
                      setAllResults([]);
                      setHasSearched(false);
                      setShowOnlyDifferentResults(false);
                      setShowSameDateDifferent(false);
                    }}
                    className="flex items-center gap-2 border-border bg-white text-green-600 hover:bg-white hover:text-green-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                    <span className="text-green-600 font-bold">Refresh</span>
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    onClick={handleShowDuplicates}
                    className="flex-1 flex items-center justify-center gap-2 text-gray-900 font-bold"
                    style={{ backgroundColor: showOnlyDifferentResults ? '#22c55e' : '#bbf7d0' }}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="font-bold">
                      {showOnlyDifferentResults ? 'Show All Results' : 'Show Duplicate Entries with Different Results'}
                    </span>
                    {duplicatesWithDifferentResults.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {duplicatesWithDifferentResults.length}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    onClick={handleShowSameDateDifferent}
                    className="flex-1 flex items-center justify-center gap-2 text-gray-900 font-bold"
                    style={{ backgroundColor: showSameDateDifferent ? '#22c55e' : '#bbf7d0' }}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>
                      {showSameDateDifferent ? 'Show All Results' : 'Show duplicate with same result'}
                    </span>
                    {sameDateDifferentEntries.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {sameDateDifferentEntries.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="common">
            <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleOptionSelector
                label="DIRECTION A"
                selectedValue={searchData.stock2}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, stock2: value }))}
                baseOptions={['CG UP', 'CG IN', 'CG DOWN', 'CR UP', 'CR IN', 'CR DOWN']}
                hideModifier={true}
              />
              <SimpleOptionSelector
                label="COLOUR"
                selectedValue={searchData.stock2bColor || ''}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, stock2bColor: value }))}
                baseOptions={['RED', 'GREEN']}
                hideModifier={true}
              />
            </div>
            <div className="space-y-2">
              <SimpleOptionSelector
                label="B"
                selectedValue={searchData.stock2b}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, stock2b: value }))}
                baseOptions={['CG IN', 'CG DOWN', 'CG UP', 'CR IN', 'CR UP', 'CR DOWN']}
                hideModifier={true}
                customBackgroundStyle={{ empty: { backgroundColor: '#ffe3e2' }, filled: { backgroundColor: '#dcfce7' } }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleOptionSelector
                label="OPEN A"
                selectedValue={searchData.stock3}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, stock3: value }))}
                baseOptions={['CG+', 'CG-', 'CGB', 'CR+', 'CR-', 'CRB', 'OG+', 'OG-', 'OGB', 'OR+', 'OR-', 'ORB', 'NILL']}
                hideModifier={true}
              />
            </div>
            <div className="space-y-2">
              <SimpleOptionSelector
                label="OPEN B"
                selectedValue={searchData.openb}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, openb: value }))}
                baseOptions={['SD CG-', 'SD CG+', 'SD CGB', 'SD CR-', 'SD CR+', 'SD CRB', 'NILL']}
                hideModifier={true}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleOptionSelector
                label="CLOSE A"
                selectedValue={searchData.stock4}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, stock4: value }))}
                baseOptions={['CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB', 'OG-', 'OG+', 'OGB', 'OR-', 'OR+', 'ORB', 'NILL']}
                hideModifier={true}
              />
            </div>
            <div className="space-y-2">
              <SimpleOptionSelector
                label="CLOSE B"
                selectedValue={searchData.stock4b}
                onValueChange={(value) => setSearchData(prev => ({ ...prev, stock4b: value }))}
                baseOptions={['SD CG-', 'SD CG+', 'SD CGB', 'SD CR-', 'SD CR+', 'SD CRB', 'NILL']}
                hideModifier={true}
              />
            </div>
          </div>

          {/* INTRO Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">INTRO 1</Label>
              <div className="flex gap-2">
                <Select 
                  value={searchData.dropdown1.split(' ')[0] || ''}
                  onValueChange={(value) => {
                    const sub = searchData.dropdown1.split(' ')[1] || '';
                    setSearchData(prev => ({ ...prev, dropdown1: sub ? `${value} ${sub}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold flex-1"
                    style={{ backgroundColor: searchData.dropdown1.split(' ')[0] ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-[100]">
                    <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                    <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={searchData.dropdown1.split(' ')[1] || ''}
                  onValueChange={(value) => {
                    const main = searchData.dropdown1.split(' ')[0] || '';
                    setSearchData(prev => ({ ...prev, dropdown1: main ? `${main} ${value}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold flex-1"
                    style={{ backgroundColor: searchData.dropdown1.split(' ')[1] ? '#dcfce7' : '#ffe3e2' }}
                  >
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
            <div className="space-y-2">
              <Label className="text-sm font-bold">INTRO 2</Label>
              <div className="flex gap-2">
                <Select 
                  value={searchData.dropdown2.split(' ')[0] || ''}
                  onValueChange={(value) => {
                    const sub = searchData.dropdown2.split(' ')[1] || '';
                    setSearchData(prev => ({ ...prev, dropdown2: sub ? `${value} ${sub}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold flex-1"
                    style={{ backgroundColor: searchData.dropdown2.split(' ')[0] ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-[100]">
                    <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                    <SelectItem value="ER" className="text-lg font-bold">ER</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={searchData.dropdown2.split(' ')[1] || ''}
                  onValueChange={(value) => {
                    const main = searchData.dropdown2.split(' ')[0] || '';
                    setSearchData(prev => ({ ...prev, dropdown2: main ? `${main} ${value}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold flex-1"
                    style={{ backgroundColor: searchData.dropdown2.split(' ')[1] ? '#dcfce7' : '#ffe3e2' }}
                  >
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
            <div className="space-y-2">
              <Label className="text-sm font-bold">INTRO 3</Label>
              <div className="flex gap-2">
                <Select 
                  value={searchData.dropdown3.split(' ')[0] || ''}
                  onValueChange={(value) => {
                    const sub = searchData.dropdown3.split(' ')[1] || '';
                    setSearchData(prev => ({ ...prev, dropdown3: sub ? `${value} ${sub}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold flex-1"
                    style={{ backgroundColor: searchData.dropdown3.split(' ')[0] ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-[100]">
                    <SelectItem value="DG" className="text-lg font-bold">DG</SelectItem>
                    <SelectItem value="DR" className="text-lg font-bold">DR</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={searchData.dropdown3.split(' ')[1] || ''}
                  onValueChange={(value) => {
                    const main = searchData.dropdown3.split(' ')[0] || '';
                    setSearchData(prev => ({ ...prev, dropdown3: main ? `${main} ${value}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold flex-1"
                    style={{ backgroundColor: searchData.dropdown3.split(' ')[1] ? '#dcfce7' : '#ffe3e2' }}
                  >
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">OG DIRECTION A</Label>
              <Select
                  value={searchData.dropdown1}
                  onValueChange={(value) => {
                    setSearchData(prev => ({ ...prev, dropdown1: value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: searchData.dropdown1 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-[100]">
                    <SelectItem value="OG" className="text-lg font-bold">OG</SelectItem>
                    <SelectItem value="OR" className="text-lg font-bold">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">OG DIRECTION B</Label>
                <Select 
                  value={searchData.dropdown2}
                  onValueChange={(value) => {
                    setSearchData(prev => ({ ...prev, dropdown2: value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: searchData.dropdown2 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-[100]">
                    <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                    <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                    <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                    <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                    <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">OG DIRECTION C</Label>
                <Select 
                  value={searchData.dropdown3}
                  onValueChange={(value) => {
                    setSearchData(prev => ({ ...prev, dropdown3: value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: searchData.dropdown3 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-[100]">
                    <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                    <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                    <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                    <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                    <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">OG DIRECTION D</Label>
                <Select 
                  value={searchData.dropdown4}
                  onValueChange={(value) => {
                    setSearchData(prev => ({ ...prev, dropdown4: value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: searchData.dropdown4 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-[100]">
                    <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                    <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                    <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                    <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                    <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-sm font-bold">OG CANDLE</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  value={searchData.ogCandle.split(' ')[0] + ' ' + searchData.ogCandle.split(' ')[1] || ''}
                  onValueChange={(value) => {
                    const color = searchData.ogCandle.split(' ')[2] || '';
                    setSearchData(prev => ({ ...prev, ogCandle: color ? `${value} ${color}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: searchData.ogCandle.includes('CANDLE') ? '#dcfce7' : '#ffe3e2' }}
                  >
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
                  value={searchData.ogCandle.split(' ')[2] || ''}
                  onValueChange={(value) => {
                    const candle = `${searchData.ogCandle.split(' ')[0] || ''} ${searchData.ogCandle.split(' ')[1] || ''}`.trim();
                    setSearchData(prev => ({ ...prev, ogCandle: candle ? `${candle} ${value}` : value }));
                    setTimeout(() => performSearch(), 100);
                  }}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: (searchData.ogCandle.includes('RED') || searchData.ogCandle.includes('GREEN')) ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-[100]">
                    <SelectItem value="RED" className="text-lg font-bold">RED</SelectItem>
                    <SelectItem value="GREEN" className="text-lg font-bold">GREEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SimpleOptionSelector
                  label="OG OPEN A"
                  selectedValue={searchData.ogOpenA}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, ogOpenA: value }))}
                  baseOptions={['OR-', 'OR+', 'ORB', 'OG-', 'OG+', 'OGB', 'CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB']}
                  hideModifier={true}
                />
              </div>
              <div className="space-y-2">
                <SimpleOptionSelector
                  label="OG CLOSE A"
                  selectedValue={searchData.ogCloseA}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, ogCloseA: value }))}
                  baseOptions={['OR-', 'OR+', 'ORB', 'OG-', 'OG+', 'OGB', 'CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB']}
                  hideModifier={true}
                />
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
            {hasSearched && (searchData.stock1 || searchData.stock2 || searchData.stock2b || searchData.stock3 || searchData.openb || searchData.stock4 || searchData.dropdown1 || searchData.dropdown2 || searchData.dropdown3 || searchData.dropdown4 || searchData.ogCandle || searchData.ogOpenA || searchData.ogCloseA || searchData.serialNumber || searchData.notes || filter) && allResults.length === 0 && (
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
                <SelectItem value="Consolidation Front Act" className="text-xl font-bold">Consolidation Front Act</SelectItem>
                <SelectItem value="Consolidation Act" className="text-xl font-bold">Consolidation Act</SelectItem>
                <SelectItem value="Act doubt" className="text-xl font-bold">Act doubt</SelectItem>
                <SelectItem value="3rd act" className="text-xl font-bold">3rd act</SelectItem>
                <SelectItem value="4th act" className="text-xl font-bold">4th act</SelectItem>
                <SelectItem value="5th act" className="text-xl font-bold">5th act</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" variant="default">
                <Search className="h-4 w-4 mr-2" />
                Search & Filter
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchData({ stock1: '', stock2: '', stock2b: '', stock2bColor: '', stock3: '', openb: '', stock4: '', stock4b: '', dropdown1: '', dropdown2: '', dropdown3: '', dropdown4: '', ogCandle: '', ogOpenA: '', ogCloseA: '', serialNumber: '', notes: '' });
                  setFilter('');
                  setSearchResult(null);
                  setAllResults([]);
                  setHasSearched(false);
                  setShowOnlyDifferentResults(false);
                  setShowSameDateDifferent(false);
                }}
                className="flex items-center gap-2 border-border bg-white text-green-600 hover:bg-white hover:text-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                <span className="text-green-600 font-bold">Refresh</span>
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button"
                onClick={handleShowDuplicates}
                className="flex-1 flex items-center justify-center gap-2 text-gray-900 font-bold"
                style={{ backgroundColor: showOnlyDifferentResults ? '#22c55e' : '#bbf7d0' }}
              >
                <Copy className="h-4 w-4" />
                <span className="font-bold">
                  {showOnlyDifferentResults ? 'Show All Results' : 'Show Duplicate Entries with Different Results'}
                </span>
                {duplicatesWithDifferentResults.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {duplicatesWithDifferentResults.length}
                  </Badge>
                )}
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button"
                onClick={handleShowSameDateDifferent}
                className="flex-1 flex items-center justify-center gap-2 text-gray-900 font-bold"
                style={{ backgroundColor: showSameDateDifferent ? '#22c55e' : '#bbf7d0' }}
              >
                <Calendar className="h-4 w-4" />
                <span>
                  {showSameDateDifferent ? 'Show All Results' : 'Show duplicate with same result'}
                </span>
                {sameDateDifferentEntries.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {sameDateDifferentEntries.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </form>
      </TabsContent>
    </Tabs>

        {searchResult && (
          <div className="mt-6 p-4 rounded-lg border animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-lg">Search Result:</h3>
            </div>
            <div className="space-y-3">
              {searchResult.classification !== "Please enter all four stock names." && searchResult.classification !== "No match found." && (
                <div className="grid grid-cols-2 gap-2 text-base text-muted-foreground">
                   <div className="flex items-center gap-2">
                     <span className="font-bold">A: </span>
                     <span className="font-bold">{formatValue(searchData.stock2)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="font-bold">B: </span>
                     <span className="font-bold">{formatValue(searchData.stock2b)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-bold">3: </span>
                     <span className="font-bold">{formatValue(searchData.stock3)}</span>
                     <span className="ml-2">– {searchResult.dates.stock3Date ? format(searchResult.dates.stock3Date, "d/M/yyyy") : "NILL"}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4" />
                     <span className="font-bold">4: </span>
                     <span className="font-bold">{formatValue(searchData.stock4)}</span>
                     <span className="ml-2">– {searchResult.dates.stock4Date ? format(searchResult.dates.stock4Date, "d/M/yyyy") : "NILL"}</span>
                   </div>
                </div>
              )}
              {searchResult.classification === "Act" ? (
                <Badge variant="outline" className="bg-success-light text-success border-success flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Act
                </Badge>
              ) : searchResult.classification === "Front Act" ? (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive flex items-center gap-1 w-fit text-lg">
                  <TrendingDown className="h-4 w-4" />
                  Front Act
                </Badge>
              ) : searchResult.classification === "Consolidation Act" ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Consolidation Act
                </Badge>
              ) : searchResult.classification === "Consolidation Front Act" ? (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingDown className="h-4 w-4" />
                  Consolidation Front Act
                </Badge>
              ) : searchResult.classification === "Consolidation Close" ? (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Consolidation Close
                </Badge>
              ) : searchResult.classification === "Act doubt" ? (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Act doubt
                </Badge>
              ) : searchResult.classification === "3rd act" ? (
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  3rd act
                </Badge>
              ) : searchResult.classification === "4th act" ? (
                <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  4th act
                </Badge>
              ) : searchResult.classification === "5th act" ? (
                <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300 flex items-center gap-1 w-fit text-lg">
                  <TrendingUp className="h-4 w-4" />
                  5th act
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground w-fit text-lg">
                  {searchResult.classification}
                </Badge>
              )}
              {searchResult.notes && searchResult.classification !== "Please enter all four stock names." && searchResult.classification !== "No match found." && (
                <div className="mt-3 p-3 bg-muted/50 rounded text-base">
                  <span className="font-medium text-muted-foreground">Notes: </span>
                  <span className="text-foreground">{searchResult.notes}</span>
                </div>
              )}
              {searchResult.imageUrl && searchResult.classification !== "Please enter all four stock names." && searchResult.classification !== "No match found." && (
                <div className="mt-3">
                  <img
                    src={searchResult.imageUrl}
                    alt="Note image"
                    className="max-w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
        )}

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
            {allResults.map((entry, index) => {
              // Find the original index of this entry in the complete saved entries list
              const allEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
              const sortedAllEntries = allEntries.sort((a, b) => b.timestamp - a.timestamp);
              const originalIndex = sortedAllEntries.findIndex(savedEntry => savedEntry.timestamp === entry.timestamp);
              
               const serialNumber = sortedAllEntries.length - originalIndex;
               const displayNumber = index + 1; // Individual serial number for filtered results
               
                return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    {(showOnlyDifferentResults || showSameDateDifferent) && (
                      <div className="flex-shrink-0 w-16 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-extrabold text-2xl">
                        {displayNumber}
                      </div>
                    )}
                    <div className="flex-shrink-0 w-20 h-10 bg-red-200 text-gray-900 rounded-lg flex items-center justify-center font-extrabold text-2xl">
                      {serialNumber}
                    </div>
                    <div className="flex-1 space-y-4">
                      {/* Match the search form layout */}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">DIRECTION A</Label>
                          <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#ffe3e2' }}>
                            {formatValue(entry.stock2)}
                          </div>
                          {entry.stock2bColor && (
                            <>
                              <Label className="text-xl font-extrabold">COLOUR</Label>
                              <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#fef3c7' }}>
                                <span style={{ 
                                  color: entry.stock2bColor.toUpperCase() === 'RED' 
                                    ? '#FF0000' 
                                    : entry.stock2bColor.toUpperCase() === 'GREEN' 
                                    ? '#008000' 
                                    : '#000000' 
                                }}>
                                  {entry.stock2bColor.toUpperCase()}
                                  {entry.stock2Date && ` - ${format(new Date(entry.stock2Date), "d/M/yyyy")}`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">B</Label>
                          <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#ffe3e2' }}>
                            {formatValue(entry.stock2b || '')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">OPEN A</Label>
                          <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#dcfce7' }}>
                            {formatValue(entry.stock3)}
                            {entry.stock3Date && (
                              <span className="ml-3 text-lg font-extrabold text-muted-foreground">
                                {format(new Date(entry.stock3Date), "d/M/yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">OPEN B</Label>
                          <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#dcfce7' }}>
                            {formatValue(entry.openb || '')}
                            {entry.openbDate && (
                              <span className="ml-3 text-lg font-extrabold text-muted-foreground">
                                {format(new Date(entry.openbDate), "d/M/yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">CLOSE A</Label>
                          <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#dcfce7' }}>
                            {formatValue(entry.stock4)}
                            {entry.stock4Date && (
                              <span className="ml-3 text-lg font-extrabold text-muted-foreground">
                                {format(new Date(entry.stock4Date), "d/M/yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">CLOSE B</Label>
                          <div className="px-3 py-2 rounded-md text-xl font-extrabold" style={{ backgroundColor: '#dcfce7' }}>
                            {formatValue(entry.stock4b || '')}
                            {entry.stock4bDate && (
                              <span className="ml-3 text-lg font-extrabold text-muted-foreground">
                                {format(new Date(entry.stock4bDate), "d/M/yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xl font-extrabold">RESULT</Label>
                        <Badge
                          variant="outline"
                          className={
                            entry.classification === 'Act'
                              ? "bg-success-light text-success border-success text-2xl font-extrabold px-4 py-2"
                              : entry.classification === 'Front Act'
                              ? "bg-destructive/10 text-destructive border-destructive text-2xl font-extrabold px-4 py-2"
                              : entry.classification === 'Consolidation Act'
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300 text-2xl font-extrabold px-4 py-2"
                              : entry.classification === 'Consolidation Front Act'
                              ? "bg-orange-100 text-orange-800 border-orange-300 text-2xl font-extrabold px-4 py-2"
                              : entry.classification === 'Consolidation Close'
                              ? "bg-blue-100 text-blue-800 border-blue-300 text-2xl font-extrabold px-4 py-2"
                              : entry.classification === 'Act doubt'
                              ? "bg-purple-100 text-purple-800 border-purple-300 text-2xl font-extrabold px-4 py-2"
                              : entry.classification === '3rd act'
                              ? "bg-indigo-100 text-indigo-800 border-indigo-300 text-2xl font-extrabold px-4 py-2"
                              : entry.classification === '4th act'
                              ? "bg-pink-100 text-pink-800 border-pink-300 text-2xl font-extrabold px-4 py-2"
                              : "bg-teal-100 text-teal-800 border-teal-300 text-2xl font-extrabold px-4 py-2"
                          }
                        >
                          {entry.classification === 'Act' || entry.classification === 'Consolidation Act' || entry.classification === 'Consolidation Close' || entry.classification === 'Act doubt' || entry.classification === '3rd act' || entry.classification === '4th act' || entry.classification === '5th act' ? (
                            <TrendingUp className="h-6 w-6 mr-2" />
                          ) : (
                            <TrendingDown className="h-6 w-6 mr-2" />
                          )}
                         {entry.classification}
                       </Badge>
                      </div>

                      {entry.notes && (
                        <div className="space-y-2">
                          <Label className="text-xl font-extrabold">NOTES</Label>
                          <div className="px-3 py-2 bg-muted/50 rounded text-lg font-bold">
                            {entry.notes}
                          </div>
                        </div>
                      )}
                      
                      {entry.imageUrl && (
                        <div>
                          <img
                            src={entry.imageUrl}
                            alt="Note image"
                            className="max-w-full h-64 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <EditEntryDialog 
                        entry={entry} 
                        index={originalIndex}
                        serialNumber={serialNumber}
                        onEntryUpdated={handleEntryUpdate}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSearch;