import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StockEntry from '@/components/StockEntry';
import StockSearch from '@/components/StockSearch';
import SavedEntries from '@/components/SavedEntries';
import { TrendingUp, BarChart3, X, Download, Upload, LogOut, Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeEntries } from '@/hooks/useRealtimeEntries';
import { migrateLocalStorageEntries } from '@/services/stockEntriesService';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { entries, loading: entriesLoading, refetch } = useRealtimeEntries();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Migrate localStorage entries on first login
  useEffect(() => {
    const migrateEntries = async () => {
      if (!user) return;
      
      const localData = localStorage.getItem('stockEntries');
      if (!localData) return;
      
      const localEntries = JSON.parse(localData);
      if (localEntries.length === 0) return;
      
      setMigrating(true);
      try {
        const count = await migrateLocalStorageEntries(user.id);
        if (count > 0) {
          toast({
            title: 'Data Migrated',
            description: `${count} entries have been synced to the cloud.`,
          });
          refetch();
        }
      } catch (error) {
        console.error('Migration error:', error);
        toast({
          title: 'Migration Failed',
          description: 'Some entries could not be migrated. They remain in local storage.',
          variant: 'destructive',
        });
      } finally {
        setMigrating(false);
      }
    };

    migrateEntries();
  }, [user]);

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  const handleExit = () => {
    window.close();
    setTimeout(() => {
      toast({
        title: "Cannot close browser",
        description: "Please close the browser manually or press Alt+F4 (Windows) or Cmd+Q (Mac)",
        variant: "destructive"
      });
    }, 100);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(entries, null, 2);
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
        description: `${entries.length} entries have been exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        // Store temporarily in localStorage and trigger migration
        localStorage.setItem('stockEntries', JSON.stringify(data));
        const count = await migrateLocalStorageEntries(user.id);
        
        refetch();
        
        toast({
          title: "Import Successful",
          description: `Imported ${count} entries successfully`,
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Migration overlay */}
      {migrating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Syncing your data to the cloud...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-elegant">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Final App.</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Sync status indicator */}
              <div className="flex items-center gap-2 mr-2 text-sm">
                <Cloud className="h-4 w-4" />
                <span className="hidden sm:inline">{entriesLoading ? 'Syncing...' : 'Synced'}</span>
              </div>
              
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
                onClick={handleSignOut}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
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
          {/* User info */}
          <div className="text-sm opacity-75">
            Logged in as: {user.email}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {/* Add Entry Form */}
          <div className="lg:col-span-1">
            <StockEntry onEntryAdded={handleEntryAdded} nextEntryNumber={entries.filter(e => e.type === 'common').length + 1} />
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
            <Cloud className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-1">Cloud Sync</h3>
            <p className="text-sm text-muted-foreground">
              Your data syncs automatically across all devices
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
            <p>Final App. - Organize your investment insights</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
