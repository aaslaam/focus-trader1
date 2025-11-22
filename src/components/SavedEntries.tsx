import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, TrendingUp, TrendingDown, Calendar, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';
import EditEntryDialog from './EditEntryDialog';
import { getVisualStyle } from '@/utils/visualIndicators';
import { cn } from '@/lib/utils';
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
  classification: 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL';
  dropdown1?: string;
  dropdown2?: string;
  dropdown3?: string;
  dropdown1Date?: Date | null;
  dropdown2Date?: Date | null;
  dropdown3Date?: Date | null;
  ogCandle?: string;
  ogOpenA?: string;
  ogCloseA?: string;
  ogOpenADate?: Date | null;
  ogCloseADate?: Date | null;
  notes?: string;
  imageUrl?: string;
  timestamp: number;
  type: 'part1' | 'part2' | 'common';
}

interface SavedEntriesProps {
  refreshTrigger: number;
}

const SavedEntries: React.FC<SavedEntriesProps> = ({ refreshTrigger }) => {
  const [entries, setEntries] = useState<StockEntryData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('part1');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEntries = () => {
    try {
      const rawData = localStorage.getItem('stockEntries');
      console.log('SavedEntries - Raw localStorage data:', rawData);
      const savedEntries = JSON.parse(rawData || '[]') as StockEntryData[];
      console.log('SavedEntries - Parsed entries:', savedEntries.length, 'entries found');
      console.log('SavedEntries - First entry:', savedEntries[0]);
      const sortedEntries = savedEntries.sort((a, b) => b.timestamp - a.timestamp);
      console.log('SavedEntries - Setting state with entries:', sortedEntries.length);
      setEntries(sortedEntries);
      console.log('SavedEntries - State should now have', sortedEntries.length, 'entries');
    } catch (error) {
      console.error('SavedEntries - Error loading entries:', error);
      setEntries([]);
      toast({
        title: "Error Loading Entries",
        description: "Failed to load saved entries. Data may be corrupted.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('SavedEntries - useEffect triggered with refreshTrigger:', refreshTrigger);
    loadEntries();
  }, [refreshTrigger]);

  useEffect(() => {
    console.log('SavedEntries - Entries state updated, length:', entries.length);
  }, [entries]);

  const deleteEntry = (indexToDelete: number) => {
    const updatedEntries = entries.filter((_, index) => index !== indexToDelete);
    localStorage.setItem('stockEntries', JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    
    toast({
      title: "Entry Deleted",
      description: "Stock entry has been removed.",
      variant: "default"
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focus-trader-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup Created",
      description: `${entries.length} entries exported successfully.`,
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as StockEntryData[];
        
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid data format');
        }

        localStorage.setItem('stockEntries', JSON.stringify(importedData));
        setEntries(importedData.sort((a, b) => b.timestamp - a.timestamp));
        
        toast({
          title: "Backup Restored",
          description: `${importedData.length} entries imported successfully.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid backup file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter entries based on active tab
  const filteredEntries = entries.filter(entry => {
    // For backward compatibility, treat entries without type as 'common'
    const entryType = entry.type || 'common';
    return entryType === activeTab;
  });

  const renderEntry = (entry: StockEntryData, index: number) => {
    const serialNumber = filteredEntries.length - index;
    const entryType = entry.type || 'common';
    
    return (
      <>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl font-extrabold text-gray-900 bg-blue-200 px-4 py-2 rounded-md min-w-[4rem] text-center">
              {serialNumber}
            </span>
          </div>
          
          <div className="space-y-4">
            {/* DIRECTION A & B - Only show for Part 1 and Common entries */}
            {entryType !== 'part2' && (entry.stock2 || entry.stock2b) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-3 rounded inline-flex flex-col items-start gap-1" style={{ backgroundColor: '#ffe3e2' }}>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-extrabold">DIRECTION A:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xl font-extrabold">{formatValue(entry.stock2)}</span>
                      </div>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-3 rounded inline-flex flex-col items-start gap-1" style={{ backgroundColor: '#ffe3e2' }}>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-extrabold">B:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xl font-extrabold">{formatValue(entry.stock2b || '')}</span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* COLOUR with DATE OF COLOUR - Only show for Part 1 and Common entries */}
            {entryType !== 'part2' && entry.stock2bColor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-3 rounded inline-flex flex-col items-start gap-1" style={{ backgroundColor: '#fef3c7' }}>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-extrabold">COLOUR:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span 
                          className="text-xl font-extrabold"
                          style={{ 
                            color: entry.stock2bColor.toUpperCase() === 'RED' 
                              ? '#FF0000' 
                              : entry.stock2bColor.toUpperCase() === 'GREEN' 
                              ? '#008000' 
                              : '#000000' 
                          }}
                        >
                          {entry.stock2bColor.toUpperCase()}
                          {entry.stock2Date && ` - ${format(new Date(entry.stock2Date), "d/M/yyyy")}`}
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* OPEN A and CLOSE A - Only show for Part 1 and Common entries */}
            {entryType !== 'part2' && (entry.stock3 || entry.stock4) && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-3 rounded inline-flex flex-col items-start gap-1" style={{ backgroundColor: '#dcfce7' }}>
                        <div className="flex items-center gap-1">
                          {getVisualStyle(entry.stock3).showIcon && getVisualStyle(entry.stock3).iconType === 'candle' && (
                            <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
                          )}
                          <span className="text-xl font-extrabold">OPEN A:</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xl font-extrabold">{formatValue(entry.stock3)}</span>
                          <span className="text-lg font-extrabold text-muted-foreground">{entry.stock3Date ? format(new Date(entry.stock3Date), "d/M/yyyy") : "NILL"}</span>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-3 rounded inline-flex flex-col items-start gap-1" style={{ backgroundColor: '#dcfce7' }}>
                        <div className="flex items-center gap-1">
                          {getVisualStyle(entry.stock4).showIcon && getVisualStyle(entry.stock4).iconType === 'candle' && (
                            <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
                          )}
                          <span className="text-xl font-extrabold">CLOSE A:</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xl font-extrabold">{formatValue(entry.stock4)}</span>
                          <span className="text-lg font-extrabold text-muted-foreground">{entry.stock4Date ? format(new Date(entry.stock4Date), "d/M/yyyy") : "NILL"}</span>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* INTRO Dropdowns */}
          {(entry.dropdown1 || entry.dropdown2 || entry.dropdown3) && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {entry.dropdown1 && (
                  <div className="px-3 py-2 rounded bg-blue-50 border border-blue-200">
                    <div className="text-sm font-bold text-blue-700 mb-1">INTRO 1</div>
                    <span className="text-lg font-bold">{entry.dropdown1}</span>
                    {entry.dropdown1Date && (
                      <div className="text-xs text-blue-600 mt-1">
                        {format(new Date(entry.dropdown1Date), "d/M/yyyy")}
                      </div>
                    )}
                  </div>
                )}
                {entry.dropdown2 && (
                  <div className="px-3 py-2 rounded bg-green-50 border border-green-200">
                    <div className="text-sm font-bold text-green-700 mb-1">INTRO 2</div>
                    <span className="text-lg font-bold">{entry.dropdown2}</span>
                    {entry.dropdown2Date && (
                      <div className="text-xs text-green-600 mt-1">
                        {format(new Date(entry.dropdown2Date), "d/M/yyyy")}
                      </div>
                    )}
                  </div>
                )}
                {entry.dropdown3 && (
                  <div className="px-3 py-2 rounded bg-purple-50 border border-purple-200">
                    <div className="text-sm font-bold text-purple-700 mb-1">INTRO 3</div>
                    <span className="text-lg font-bold">{entry.dropdown3}</span>
                    {entry.dropdown3Date && (
                      <div className="text-xs text-purple-600 mt-1">
                        {format(new Date(entry.dropdown3Date), "d/M/yyyy")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OG CANDLE */}
          {entry.ogCandle && (
            <div className="mt-4">
              <div className="px-3 py-2 rounded bg-purple-50 border border-purple-200">
                <div className="text-sm font-bold text-purple-700 mb-1">OG CANDLE</div>
                <span className="text-lg font-bold">{entry.ogCandle}</span>
              </div>
            </div>
          )}

          {/* OG OPEN A and OG CLOSE A in same row */}
          {(entry.ogOpenA || entry.ogCloseA) && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OG OPEN A */}
                {entry.ogOpenA && (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded bg-indigo-50 border border-indigo-200">
                      <div className="text-sm font-bold text-indigo-700 mb-1">OG OPEN A</div>
                      <span className="text-lg font-bold">{entry.ogOpenA}</span>
                    </div>
                    {entry.ogOpenADate && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-slate-100 border border-slate-300">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-semibold">Date: {format(new Date(entry.ogOpenADate), "d/M/yyyy")}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* OG CLOSE A */}
                {entry.ogCloseA && (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded bg-pink-50 border border-pink-200">
                      <div className="text-sm font-bold text-pink-700 mb-1">OG CLOSE A</div>
                      <span className="text-lg font-bold">{entry.ogCloseA}</span>
                    </div>
                    {entry.ogCloseADate && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded bg-slate-100 border border-slate-300">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-semibold">Date: {format(new Date(entry.ogCloseADate), "d/M/yyyy")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-2xl font-extrabold px-4 py-2",
                entry.classification === 'Act'
                  ? "bg-success-light text-success border-success"
                  : entry.classification === 'Front Act'
                  ? "bg-destructive/10 text-destructive border-destructive"
                  : entry.classification === 'Consolidation Act'
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : entry.classification === 'Consolidation Front Act'
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : entry.classification === 'Consolidation Close'
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : entry.classification === 'Act doubt'
                  ? "bg-purple-100 text-purple-800 border-purple-300"
                  : entry.classification === '3rd act'
                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                  : entry.classification === '4th act'
                  ? "bg-pink-100 text-pink-800 border-pink-300"
                  : "bg-teal-100 text-teal-800 border-teal-300"
              )}
            >
              {entry.classification === 'Act' || entry.classification === 'Consolidation Act' || entry.classification === 'Consolidation Close' || entry.classification === 'Act doubt' || entry.classification === '3rd act' || entry.classification === '4th act' || entry.classification === '5th act' ? (
                <TrendingUp className="h-6 w-6 mr-2" />
              ) : (
                <TrendingDown className="h-6 w-6 mr-2" />
              )}
              {entry.classification.toUpperCase()}
            </Badge>
          </div>
          {entry.notes && (
            <div className="mt-2 p-3 bg-muted/50 rounded text-base">
              <span className="font-extrabold text-muted-foreground">Notes: </span>
              <span className="text-foreground font-bold">{entry.notes}</span>
            </div>
          )}
          {entry.imageUrl && (
            <div className="mt-2">
              <img
                src={entry.imageUrl}
                alt="Note image"
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}
          <div className="flex items-center gap-1 text-base font-bold text-muted-foreground">
            <Calendar className="h-5 w-5" />
            {formatDate(entry.timestamp)}
          </div>
        </div>
        <div className="flex gap-1">
          <EditEntryDialog 
            entry={entry} 
            index={entries.findIndex(e => e.timestamp === entry.timestamp)}
            serialNumber={serialNumber}
            onEntryUpdated={loadEntries}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this stock entry? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteEntry(entries.findIndex(e => e.timestamp === entry.timestamp))} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </>
    );
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-gradient-to-r from-accent to-accent/80 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-accent-foreground text-3xl font-bold">
            <Database className="h-6 w-6" />
            Saved Entries ({entries.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={exportData}
              disabled={entries.length === 0}
              variant="outline"
              size="sm"
              className="bg-background hover:bg-accent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="bg-background hover:bg-accent"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="part1">PART 1</TabsTrigger>
            <TabsTrigger value="part2">PART 2</TabsTrigger>
            <TabsTrigger value="common">COMMON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="part1">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No Part 1 entries yet</p>
                <p className="text-sm">Save Part 1 form to see entries here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry, index) => (
                  <div
                    key={entry.timestamp}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {renderEntry(entry, index)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="part2">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No Part 2 entries yet</p>
                <p className="text-sm">Save Part 2 form to see entries here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry, index) => (
                  <div
                    key={entry.timestamp}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {renderEntry(entry, index)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="common">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No Common entries yet</p>
                <p className="text-sm">Save using Common Save to see entries here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry, index) => (
                  <div
                    key={entry.timestamp}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {renderEntry(entry, index)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SavedEntries;
