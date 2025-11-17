import React, { useState, useRef } from 'react';
import StockEntry from '@/components/StockEntry';
import StockSearch from '@/components/StockSearch';
import SavedEntries from '@/components/SavedEntries';
import { TrendingUp, BarChart3, X, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Calculate next entry number based on existing entries
  const entries = JSON.parse(localStorage.getItem('stockEntries') || '[]');
  const nextEntryNumber = entries.length + 1;

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExit = () => {
    // Attempt to close the window (works in some contexts like mobile apps or windows opened by JS)
    window.close();
    // If window.close() doesn't work (most browsers), show a message
    setTimeout(() => {
      toast({
        title: "Cannot close browser",
        description: "Please close the browser manually or press Alt+F4 (Windows) or Cmd+Q (Mac)",
        variant: "destructive"
      });
    }, 100);
  };

  const handleExport = () => {
    try {
      const stockEntries = localStorage.getItem('stockEntries') || '[]';
      const dataStr = JSON.stringify(JSON.parse(stockEntries), null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `focus-trader-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your stock entries have been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate that it's an array
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        localStorage.setItem('stockEntries', JSON.stringify(data));
        setRefreshTrigger(prev => prev + 1);
        
        toast({
          title: "Import Successful",
          description: `Imported ${data.length} entries successfully`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format or corrupted data",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-elegant">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Focus Trader 1st candle</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExit}
                className="bg-red-500/20 text-white border-red-500/50 hover:bg-red-500/30"
              >
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {/* Add Entry Form */}
          <div className="lg:col-span-1">
            <StockEntry onEntryAdded={handleEntryAdded} nextEntryNumber={nextEntryNumber} />
          </div>

          {/* Search Form */}
          <div className="lg:col-span-1">
            <StockSearch />
          </div>

          {/* Saved Entries List */}
          <div className="lg:col-span-2 xl:col-span-1">
            <SavedEntries refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="bg-card border rounded-lg p-6 text-center shadow-card">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-success" />
            <h3 className="text-lg font-semibold mb-1">Smart Matching</h3>
            <p className="text-sm text-muted-foreground">
              Case-insensitive and order-independent stock search
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center shadow-card">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-1">Local Storage</h3>
            <p className="text-sm text-muted-foreground">
              Your data persists between browser sessions
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center shadow-card">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-warning" />
            <h3 className="text-lg font-semibold mb-1">Easy Management</h3>
            <p className="text-sm text-muted-foreground">
              Add, search, and delete entries with intuitive controls
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Focus Trader 1st candle - Organize your investment insights</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;