import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Database, Trash2, TrendingUp, TrendingDown, Calendar, Download, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import EditEntryDialog from './EditEntryDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { deleteEntry as deleteEntryService, migrateLocalStorageEntries } from '@/services/stockEntriesService';
import { StockEntryData } from '@/types/stockEntry';

interface SavedEntriesProps {
  entries: StockEntryData[];
  loading: boolean;
  onRefetch: () => void;
}

const SavedEntries: React.FC<SavedEntriesProps> = ({ entries, loading, onRefetch }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteEntry = async (entry: StockEntryData) => {
    if (!user || !entry.id) return;
    
    try {
      await deleteEntryService(entry.id, user.id);
      toast({
        title: "Entry Deleted",
        description: "Stock entry has been removed.",
        variant: "default"
      });
      onRefetch();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      });
    }
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

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as StockEntryData[];
        
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid data format');
        }

        // Store in localStorage temporarily and trigger migration
        localStorage.setItem('stockEntries', JSON.stringify(importedData));
        const count = await migrateLocalStorageEntries(user.id);
        
        onRefetch();
        
        toast({
          title: "Backup Restored",
          description: `${count} entries imported successfully.`,
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

  // Filter entries - show only common entries (combined Part 1 + Part 2)
  const filteredEntries = entries.filter(entry => {
    const entryType = entry.type || 'common';
    return entryType === 'common';
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
            {/* Common Entry Fields - Combines Part 1 and Part 2 in order */}
            {entryType === 'common' && (
              <>
                {/* Monthly Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.dropdown1 && (
                    <div className="px-3 py-2 rounded bg-blue-50 border border-blue-200">
                      <div className="text-sm font-bold text-blue-700 mb-1">MONTHLY OPEN</div>
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
                      <div className="text-sm font-bold text-green-700 mb-1">MONTHLY CLOSE</div>
                      <span className="text-lg font-bold">{entry.dropdown2}</span>
                      {entry.dropdown2Date && (
                        <div className="text-xs text-green-600 mt-1">
                          {format(new Date(entry.dropdown2Date), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Weekly Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.dropdown3 && (
                    <div className="px-3 py-2 rounded bg-purple-50 border border-purple-200">
                      <div className="text-sm font-bold text-purple-700 mb-1">WEEKLY OPEN</div>
                      <span className="text-lg font-bold">{entry.dropdown3}</span>
                      {entry.dropdown3Date && (
                        <div className="text-xs text-purple-600 mt-1">
                          {format(new Date(entry.dropdown3Date), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                  {entry.dropdown4 && (
                    <div className="px-3 py-2 rounded bg-pink-50 border border-pink-200">
                      <div className="text-sm font-bold text-pink-700 mb-1">WEEKLY CLOSE</div>
                      <span className="text-lg font-bold">{entry.dropdown4}</span>
                      {entry.dropdown4Date && (
                        <div className="text-xs text-pink-600 mt-1">
                          {format(new Date(entry.dropdown4Date), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Daily Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.dropdown5 && (
                    <div className="px-3 py-2 rounded bg-orange-50 border border-orange-200">
                      <div className="text-sm font-bold text-orange-700 mb-1">DAILY OPEN</div>
                      <span className="text-lg font-bold">{entry.dropdown5}</span>
                      {entry.dropdown5Date && (
                        <div className="text-xs text-orange-600 mt-1">
                          {format(new Date(entry.dropdown5Date), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                  {entry.dropdown6 && (
                    <div className="px-3 py-2 rounded bg-teal-50 border border-teal-200">
                      <div className="text-sm font-bold text-teal-700 mb-1">DAILY CLOSE</div>
                      <span className="text-lg font-bold">{entry.dropdown6}</span>
                      {entry.dropdown6Date && (
                        <div className="text-xs text-teal-600 mt-1">
                          {format(new Date(entry.dropdown6Date), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Opening Candle and Candle No's */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.ogCandle && (
                    <div className="px-3 py-2 rounded bg-indigo-50 border border-indigo-200">
                      <div className="text-sm font-bold text-indigo-700 mb-1">CANDLE NO'S</div>
                      <span className="text-lg font-bold">{entry.ogCandle}</span>
                    </div>
                  )}
                </div>
                {/* OG OPEN A and OG CLOSE A */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.ogOpenA && (
                    <div className="px-3 py-2 rounded bg-indigo-50 border border-indigo-200">
                      <div className="text-sm font-bold text-indigo-700 mb-1">OG OPEN A</div>
                      <span className="text-lg font-bold">{entry.ogOpenA}</span>
                      {entry.ogOpenADate && (
                        <div className="text-xs text-indigo-600 mt-1">
                          {format(new Date(entry.ogOpenADate), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                  {entry.ogCloseA && (
                    <div className="px-3 py-2 rounded bg-pink-50 border border-pink-200">
                      <div className="text-sm font-bold text-pink-700 mb-1">OG CLOSE A</div>
                      <span className="text-lg font-bold">{entry.ogCloseA}</span>
                      {entry.ogCloseADate && (
                        <div className="text-xs text-pink-600 mt-1">
                          {format(new Date(entry.ogCloseADate), "d/M/yyyy")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
              {entry.classification?.toUpperCase() || 'N/A'}
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
            serialNumber={serialNumber}
            onEntryUpdated={onRefetch}
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
                <AlertDialogAction 
                  onClick={() => handleDeleteEntry(entry)} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
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
            Saved Entries ({filteredEntries.length})
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
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Loading entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No entries yet</p>
            <p className="text-sm">Save entries to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.id || entry.timestamp}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/20 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {renderEntry(entry, index)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedEntries;
