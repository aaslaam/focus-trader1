import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  dropdown4?: string;
  dropdown1Date?: Date | null;
  dropdown2Date?: Date | null;
  dropdown3Date?: Date | null;
  dropdown4Date?: Date | null;
  notes?: string;
  imageUrl?: string;
  timestamp: number;
}

interface SavedEntriesProps {
  refreshTrigger: number;
}

const SavedEntries: React.FC<SavedEntriesProps> = ({ refreshTrigger }) => {
  const [entries, setEntries] = useState<StockEntryData[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEntries = () => {
    const savedEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    setEntries(savedEntries.sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadEntries();
  }, [refreshTrigger]);

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
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No entries yet</p>
            <p className="text-sm">Add your first stock combination above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/20 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                  <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-4xl font-extrabold text-gray-900 bg-blue-200 px-4 py-2 rounded-md min-w-[4rem] text-center">
                      {entries.length - index}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* DIRECTION A & B */}
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

                    {/* COLOUR with DATE OF COLOUR */}
                    {entry.stock2bColor && (
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

                    {/* OPEN A, OPEN B, CLOSE A & CLOSE B */}
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
                  </div>

                  {/* New Four Dropdowns Row */}
                  {(entry.dropdown1 || entry.dropdown2 || entry.dropdown3 || entry.dropdown4) && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {entry.dropdown1 && (
                        <div className="px-3 py-2 rounded bg-blue-50 border border-blue-200">
                          <span className="text-lg font-bold">{entry.dropdown1}</span>
                        </div>
                      )}
                      {entry.dropdown2 && (
                        <div className="px-3 py-2 rounded bg-green-50 border border-green-200">
                          <span className="text-lg font-bold">{entry.dropdown2}</span>
                        </div>
                      )}
                      {entry.dropdown3 && (
                        <div className="px-3 py-2 rounded bg-purple-50 border border-purple-200">
                          <span className="text-lg font-bold">{entry.dropdown3}</span>
                        </div>
                      )}
                      {entry.dropdown4 && (
                        <div className="px-3 py-2 rounded bg-orange-50 border border-orange-200">
                          <span className="text-lg font-bold">{entry.dropdown4}</span>
                        </div>
                      )}
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
                    index={index}
                    serialNumber={entries.length - index}
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
                      <AlertDialogAction onClick={() => deleteEntry(index)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedEntries;