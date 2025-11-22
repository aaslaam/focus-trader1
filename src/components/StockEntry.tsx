import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, CalendarIcon, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import SimpleOptionSelector from '@/components/SimpleOptionSelector';

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
  part1Result?: string;
  part2Result?: string;
  type: 'part1' | 'part2' | 'common';
}

interface Part1Data {
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
  part1Result: string;
  part1Notes: string;
  timestamp: number;
}

interface StockEntryProps {
  onEntryAdded: () => void;
  nextEntryNumber: number;
}

const StockEntry: React.FC<StockEntryProps> = ({ onEntryAdded, nextEntryNumber }) => {
  const [formData, setFormData] = useState({
    stock1: '',
    stock2: '',
    stock2b: '',
    stock2bColor: '',
    stock3: '',
    stock4: '',
    classification: '' as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | '',
    ogCandle: '',
    ogOpenA: '',
    ogCloseA: '',
    notes: '',
    part1Result: '' as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | '',
    part1Notes: '',
    part2Result: '' as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | ''
  });
  const [part1SavedData, setPart1SavedData] = useState<Part1Data | null>(null);
  const [activeTab, setActiveTab] = useState<string>('part1');
  const [newDropdowns, setNewDropdowns] = useState({
    dropdown1: '',
    dropdown2: '',
    dropdown3: '',
    dropdown4: ''
  });
  const [dropdowns, setDropdowns] = useState({
    dropdown1Main: '',
    dropdown1Sub: '',
    dropdown2Main: '',
    dropdown2Sub: '',
    dropdown3Main: '',
    dropdown3Sub: '',
    candleMain: '',
    candleSub: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEntrySaved, setShowEntrySaved] = useState(false);
  const [lastSavedEntry, setLastSavedEntry] = useState<StockEntryData | null>(null);
  const [entrySerialNumber, setEntrySerialNumber] = useState<number>(0);
  const [showMissingInfo, setShowMissingInfo] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showDuplicateEntry, setShowDuplicateEntry] = useState(false);
  const [duplicateSerialNumber, setDuplicateSerialNumber] = useState<number>(0);
  const [selectedDates, setSelectedDates] = useState<{
    stock1Date: Date | null;
    stock2Date: Date | null;
    stock3Date: Date | null;
    stock4Date: Date | null;
    dropdown1Date: Date | null;
    dropdown2Date: Date | null;
    dropdown3Date: Date | null;
    ogOpenADate: Date | null;
    ogCloseADate: Date | null;
  }>({
    stock1Date: new Date(),
    stock2Date: new Date(),
    stock3Date: new Date(),
    stock4Date: new Date(),
    dropdown1Date: new Date(),
    dropdown2Date: new Date(),
    dropdown3Date: new Date(),
    ogOpenADate: new Date(),
    ogCloseADate: new Date()
  });
  const [dateChanged, setDateChanged] = useState<{
    stock1Date: boolean;
    stock2Date: boolean;
    stock3Date: boolean;
    stock4Date: boolean;
    dropdown1Date: boolean;
    dropdown2Date: boolean;
    dropdown3Date: boolean;
    ogOpenADate: boolean;
    ogCloseADate: boolean;
  }>({
    stock1Date: false,
    stock2Date: false,
    stock3Date: false,
    stock4Date: false,
    dropdown1Date: false,
    dropdown2Date: false,
    dropdown3Date: false,
    ogOpenADate: false,
    ogCloseADate: false
  });
  const { toast } = useToast();
  
  // Update combined dropdown values whenever individual dropdowns change
  useEffect(() => {
    const combined = {
      dropdown1: `${dropdowns.dropdown1Main} ${dropdowns.dropdown1Sub}`.trim(),
      dropdown2: `${dropdowns.dropdown2Main} ${dropdowns.dropdown2Sub}`.trim(),
      dropdown3: `${dropdowns.dropdown3Main} ${dropdowns.dropdown3Sub}`.trim(),
      dropdown4: ''
    };
    console.log('StockEntry - useEffect updating combined dropdowns:', combined);
    console.log('StockEntry - Individual dropdown states:', dropdowns);
    setNewDropdowns(combined);
  }, [dropdowns]);
  
  // Update combined OG CANDLE value whenever candle dropdowns change
  useEffect(() => {
    const combined = `${dropdowns.candleMain} ${dropdowns.candleSub}`.trim();
    setFormData(prev => ({ ...prev, ogCandle: combined }));
  }, [dropdowns.candleMain, dropdowns.candleSub]);
  
  // Refs for auto-focus functionality
  const stock1Ref = useRef<HTMLInputElement>(null);
  const stock2Ref = useRef<HTMLInputElement>(null);
  const stock3Ref = useRef<HTMLInputElement>(null);
  const stock4Ref = useRef<HTMLInputElement>(null);
  const classificationRef = useRef<HTMLButtonElement>(null);

  // No longer needed - using SimpleOptionSelector

  const handleInputChange = (field: string, value: string) => {
    const upperValue = value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      [field]: upperValue
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'stock1':
          stock2Ref.current?.focus();
          break;
        case 'stock2':
          stock3Ref.current?.focus();
          break;
        case 'stock3':
          stock4Ref.current?.focus();
          break;
        case 'stock4':
          classificationRef.current?.click();
          break;
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `note-images/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('note-images')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('note-images')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const handlePart1Submit = async () => {
    // Validate Part 1 required fields
    const isFieldMissing = (value: string) => {
      if (!value || value.trim() === '') return true;
      if (value.toUpperCase() === 'NILL') return false;
      return false;
    };
    
    if (isFieldMissing(formData.stock2) || isFieldMissing(formData.stock2b) || isFieldMissing(formData.stock3) || isFieldMissing(formData.stock4) || !formData.part1Result) {
      const missing = [];
      if (isFieldMissing(formData.stock2)) missing.push("A DIRECTION");
      if (isFieldMissing(formData.stock2b)) missing.push("B");
      if (isFieldMissing(formData.stock3)) missing.push("OPEN A");
      if (isFieldMissing(formData.stock4)) missing.push("CLOSE A");
      if (!formData.part1Result) missing.push("Part 1 RESULT");
      
      setMissingFields(missing);
      setShowMissingInfo(true);
      setTimeout(() => {
        setShowMissingInfo(false);
        setMissingFields([]);
      }, 5000);
      return;
    }

    const part1Data: Part1Data = {
      stock1: formData.stock1,
      stock2: formData.stock2,
      stock2b: formData.stock2b,
      stock2bColor: formData.stock2bColor,
      stock3: formData.stock3,
      stock4: formData.stock4,
      stock1Date: selectedDates.stock1Date,
      stock2Date: selectedDates.stock2Date,
      stock3Date: selectedDates.stock3Date,
      stock4Date: selectedDates.stock4Date,
      dropdown1Date: selectedDates.dropdown1Date,
      dropdown2Date: selectedDates.dropdown2Date,
      dropdown3Date: selectedDates.dropdown3Date,
      part1Result: formData.part1Result,
      part1Notes: formData.part1Notes,
      timestamp: Date.now()
    };

    // Save to component state for Common Save
    setPart1SavedData(part1Data);

    // Also save to localStorage as a Part 1 entry
    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    const part1Entry: StockEntryData = {
      ...part1Data,
      classification: part1Data.part1Result as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL',
      notes: part1Data.part1Notes,
      type: 'part1'
    };
    const updatedEntries = [...existingEntries, part1Entry];
    localStorage.setItem('stockEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "Part 1 Saved",
      description: "Part 1 entry has been saved and is visible in PART 1 tab.",
      variant: "default"
    });

    onEntryAdded();
  };

  const handlePart2Submit = async () => {
    // Part 2 is optional - can save with or without data
    setUploading(true);

    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];

    const newEntry: StockEntryData = {
      stock1: '',
      stock2: '',
      stock2b: '',
      stock3: '',
      stock4: '',
      stock1Date: null,
      stock2Date: null,
      stock3Date: null,
      stock4Date: null,
      classification: formData.part2Result as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL',
      dropdown1: newDropdowns.dropdown1,
      dropdown2: newDropdowns.dropdown2,
      dropdown3: newDropdowns.dropdown3,
      dropdown4: newDropdowns.dropdown4,
      ogCandle: formData.ogCandle,
      ogOpenA: formData.ogOpenA,
      ogCloseA: formData.ogCloseA,
      ogOpenADate: selectedDates.ogOpenADate,
      ogCloseADate: selectedDates.ogCloseADate,
      part2Result: formData.part2Result,
      timestamp: Date.now(),
      type: 'part2'
    };

    const updatedEntries = [...existingEntries, newEntry];
    localStorage.setItem('stockEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "Part 2 Saved",
      description: "Part 2 entry has been saved and is visible in PART 2 tab.",
      variant: "default"
    });

    onEntryAdded();

    // Reset Part 2 fields
    setFormData(prev => ({
      ...prev,
      ogCandle: '',
      ogOpenA: '',
      ogCloseA: '',
      part2Result: ''
    }));
    setNewDropdowns({
      dropdown1: '',
      dropdown2: '',
      dropdown3: '',
      dropdown4: ''
    });
    setDropdowns(prev => ({
      ...prev,
      candleMain: '',
      candleSub: ''
    }));

    setUploading(false);
    onEntryAdded();
  };

  const handleCommonSave = async () => {
    if (!part1SavedData) {
      toast({
        title: "Error",
        description: "Please save Part 1 first.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.part2Result) {
      setMissingFields(["Part 2 RESULT"]);
      setShowMissingInfo(true);
      setTimeout(() => {
        setShowMissingInfo(false);
        setMissingFields([]);
      }, 5000);
      return;
    }

    setUploading(true);

    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];

    let imageUrl: string | undefined;
    if (selectedImage) {
      imageUrl = (await uploadImage(selectedImage)) || undefined;
    }

    const combinedEntry: StockEntryData = {
      ...part1SavedData,
      classification: formData.part2Result as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL',
      dropdown1: newDropdowns.dropdown1,
      dropdown2: newDropdowns.dropdown2,
      dropdown3: newDropdowns.dropdown3,
      dropdown4: newDropdowns.dropdown4,
      ogCandle: formData.ogCandle,
      ogOpenA: formData.ogOpenA,
      ogCloseA: formData.ogCloseA,
      ogOpenADate: selectedDates.ogOpenADate,
      ogCloseADate: selectedDates.ogCloseADate,
      notes: part1SavedData.part1Notes,
      part1Result: part1SavedData.part1Result,
      part2Result: formData.part2Result,
      imageUrl,
      timestamp: Date.now(),
      type: 'common'
    };

    const updatedEntries = [...existingEntries, combinedEntry];
    localStorage.setItem('stockEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "Combined Entry Saved",
      description: "Part 1 and Part 2 have been combined and saved.",
      variant: "default"
    });

    // Reset all form data
    setFormData({
      stock1: '',
      stock2: '',
      stock2b: '',
      stock2bColor: '',
      stock3: '',
      stock4: '',
      classification: '',
      ogCandle: '',
      ogOpenA: '',
      ogCloseA: '',
      notes: '',
      part1Result: '',
      part1Notes: '',
      part2Result: ''
    });
    setNewDropdowns({
      dropdown1: '',
      dropdown2: '',
      dropdown3: '',
      dropdown4: ''
    });
    setDropdowns({
      dropdown1Main: '',
      dropdown1Sub: '',
      dropdown2Main: '',
      dropdown2Sub: '',
      dropdown3Main: '',
      dropdown3Sub: '',
      candleMain: '',
      candleSub: ''
    });
    setSelectedDates({
      stock1Date: new Date(),
      stock2Date: new Date(),
      stock3Date: new Date(),
      stock4Date: new Date(),
      dropdown1Date: new Date(),
      dropdown2Date: new Date(),
      dropdown3Date: new Date(),
      ogOpenADate: new Date(),
      ogCloseADate: new Date()
    });
    setDateChanged({
      stock1Date: false,
      stock2Date: false,
      stock3Date: false,
      stock4Date: false,
      dropdown1Date: false,
      dropdown2Date: false,
      dropdown3Date: false,
      ogOpenADate: false,
      ogCloseADate: false
    });
    setSelectedImage(null);
    setImagePreview(null);
    setPart1SavedData(null);
    setUploading(false);

    onEntryAdded();
  };

  const handleRefresh = () => {
    // Clear all form data
    setFormData({
      stock1: '',
      stock2: '',
      stock2b: '',
      stock2bColor: '',
      stock3: '',
      stock4: '',
      classification: '',
      ogCandle: '',
      ogOpenA: '',
      ogCloseA: '',
      notes: '',
      part1Result: '',
      part1Notes: '',
      part2Result: ''
    });
    setPart1SavedData(null);
    setNewDropdowns({
      dropdown1: '',
      dropdown2: '',
      dropdown3: '',
      dropdown4: ''
    });
    setDropdowns({
      dropdown1Main: '',
      dropdown1Sub: '',
      dropdown2Main: '',
      dropdown2Sub: '',
      dropdown3Main: '',
      dropdown3Sub: '',
      candleMain: '',
      candleSub: ''
    });
    setSelectedDates({
      stock1Date: new Date(),
      stock2Date: new Date(),
      stock3Date: new Date(),
      stock4Date: new Date(),
      dropdown1Date: new Date(),
      dropdown2Date: new Date(),
      dropdown3Date: new Date(),
      ogOpenADate: new Date(),
      ogCloseADate: new Date()
    });
    setDateChanged({
      stock1Date: false,
      stock2Date: false,
      stock3Date: false,
      stock4Date: false,
      dropdown1Date: false,
      dropdown2Date: false,
      dropdown3Date: false,
      ogOpenADate: false,
      ogCloseADate: false
    });
    setSelectedImage(null);
    setImagePreview(null);
    setUploading(false);
    
    toast({
      title: "Form Cleared",
      description: "All fields have been reset.",
      variant: "default"
    });
  };

  const handleSetAllNill = async () => {
    // Set all field values to NILL including direction A, B, colour, and classification
    setFormData(prev => ({
      ...prev,
      stock2: 'NILL',
      stock2b: 'NILL',
      stock2bColor: 'NILL',
      stock3: 'NILL',
      stock4: 'NILL',
      classification: 'NILL' as 'NILL'
    }));
    
    // Wait a bit for state to update, then submit
    setTimeout(async () => {
      setUploading(true);
      
      const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];

      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = (await uploadImage(selectedImage)) || undefined;
      }

      const newEntry: StockEntryData = {
        stock1: formData.stock1,
        stock2: 'NILL',
        stock2b: 'NILL',
        stock2bColor: 'NILL',
        stock3: 'NILL',
        stock4: 'NILL',
        ...selectedDates,
        classification: 'NILL',
        ogCandle: 'NILL',
        notes: formData.notes,
        imageUrl,
        timestamp: Date.now(),
        type: 'part1'
      };

      const updatedEntries = [...existingEntries, newEntry];
      localStorage.setItem('stockEntries', JSON.stringify(updatedEntries));
      
      toast({
        title: "Entry Added",
        description: `Entry saved with all fields set to NILL`,
        variant: "default"
      });

      // Show entry saved message with serial number
      setLastSavedEntry(newEntry);
      setEntrySerialNumber(updatedEntries.length);
      setShowEntrySaved(true);
      setTimeout(() => {
        setShowEntrySaved(false);
        setLastSavedEntry(null);
      }, 5000);

      // Reset form
      setFormData({
        stock1: '',
        stock2: '',
        stock2b: '',
        stock2bColor: '',
        stock3: '',
        stock4: '',
        classification: '',
      ogCandle: '',
      ogOpenA: '',
      ogCloseA: '',
      notes: '',
      part1Result: '',
      part1Notes: '',
      part2Result: ''
    });
    setPart1SavedData(null);
    setNewDropdowns({
      dropdown1: '',
      dropdown2: '',
      dropdown3: '',
      dropdown4: ''
    });
      setDropdowns({
        dropdown1Main: '',
        dropdown1Sub: '',
        dropdown2Main: '',
        dropdown2Sub: '',
        dropdown3Main: '',
        dropdown3Sub: '',
        candleMain: '',
        candleSub: ''
      });
      setSelectedDates({
        stock1Date: new Date(),
        stock2Date: new Date(),
        stock3Date: new Date(),
        stock4Date: new Date(),
        dropdown1Date: new Date(),
        dropdown2Date: new Date(),
        dropdown3Date: new Date(),
        ogOpenADate: new Date(),
        ogCloseADate: new Date()
      });
      setDateChanged({
        stock1Date: false,
        stock2Date: false,
        stock3Date: false,
        stock4Date: false,
        dropdown1Date: false,
        dropdown2Date: false,
        dropdown3Date: false,
        ogOpenADate: false,
        ogCloseADate: false
      });
      setSelectedImage(null);
      setImagePreview(null);
      setUploading(false);

      onEntryAdded();
    }, 100);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          ADD ENTRY <span className="font-bold">#{nextEntryNumber}</span> {activeTab === 'part1' ? 'PART 1' : 'PART 2'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="part1" className="text-lg font-bold">Part 1</TabsTrigger>
            <TabsTrigger value="part2" className="text-lg font-bold">Part 2</TabsTrigger>
          </TabsList>
          
          {/* Part 1 Tab */}
          <TabsContent value="part1" className="space-y-4">
          {/* 4 Dropdown Pairs Section */}
          <div className="space-y-4 pb-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropdown 1 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">INTRO 1</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select 
                      value={dropdowns.dropdown1Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown1Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold z-50"
                        style={{ backgroundColor: dropdowns.dropdown1Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                        <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={dropdowns.dropdown1Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown1Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold z-50"
                        style={{ backgroundColor: dropdowns.dropdown1Sub ? '#dcfce7' : '#ffe3e2' }}
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
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          (!selectedDates.dropdown1Date || dateChanged.dropdown1Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                          !selectedDates.dropdown1Date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.dropdown1Date ? format(selectedDates.dropdown1Date, "PPP") : <span>No date (NILL)</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDates.dropdown1Date || undefined}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDates(prev => ({ ...prev, dropdown1Date: date }));
                            setDateChanged(prev => ({ ...prev, dropdown1Date: true }));
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDates(prev => ({ ...prev, dropdown1Date: null }));
                      setDateChanged(prev => ({ ...prev, dropdown1Date: false }));
                    }}
                    className={cn(
                      !selectedDates.dropdown1Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                    )}
                  >
                    NILL
                  </Button>
                </div>
              </div>

              {/* Dropdown 2 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">INTRO 2</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select 
                      value={dropdowns.dropdown2Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown2Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold z-50"
                        style={{ backgroundColor: dropdowns.dropdown2Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                        <SelectItem value="ER" className="text-lg font-bold">ER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={dropdowns.dropdown2Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown2Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold z-50"
                        style={{ backgroundColor: dropdowns.dropdown2Sub ? '#dcfce7' : '#ffe3e2' }}
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
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          (!selectedDates.dropdown2Date || dateChanged.dropdown2Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                          !selectedDates.dropdown2Date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.dropdown2Date ? format(selectedDates.dropdown2Date, "PPP") : <span>No date (NILL)</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDates.dropdown2Date || undefined}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDates(prev => ({ ...prev, dropdown2Date: date }));
                            setDateChanged(prev => ({ ...prev, dropdown2Date: true }));
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDates(prev => ({ ...prev, dropdown2Date: null }));
                      setDateChanged(prev => ({ ...prev, dropdown2Date: false }));
                    }}
                    className={cn(
                      !selectedDates.dropdown2Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                    )}
                  >
                    NILL
                  </Button>
                </div>
              </div>

              {/* Dropdown 3 */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">INTRO 3</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Select 
                      value={dropdowns.dropdown3Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown3Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold z-50"
                        style={{ backgroundColor: dropdowns.dropdown3Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="DG" className="text-lg font-bold">DG</SelectItem>
                        <SelectItem value="DR" className="text-lg font-bold">DR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={dropdowns.dropdown3Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown3Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold z-50"
                        style={{ backgroundColor: dropdowns.dropdown3Sub ? '#dcfce7' : '#ffe3e2' }}
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
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          (!selectedDates.dropdown3Date || dateChanged.dropdown3Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                          !selectedDates.dropdown3Date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.dropdown3Date ? format(selectedDates.dropdown3Date, "PPP") : <span>No date (NILL)</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDates.dropdown3Date || undefined}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDates(prev => ({ ...prev, dropdown3Date: date }));
                            setDateChanged(prev => ({ ...prev, dropdown3Date: true }));
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDates(prev => ({ ...prev, dropdown3Date: null }));
                      setDateChanged(prev => ({ ...prev, dropdown3Date: false }));
                    }}
                    className={cn(
                      !selectedDates.dropdown3Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                    )}
                  >
                    NILL
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SimpleOptionSelector
                label="DIRECTION A"
                selectedValue={formData.stock2}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stock2: value }))}
                baseOptions={['CG UP', 'CG IN', 'CG DOWN', 'CR UP', 'CR IN', 'CR DOWN']}
                hideModifier={true}
              />
              <SimpleOptionSelector
                label="COLOUR"
                selectedValue={formData.stock2bColor || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stock2bColor: value }))}
                baseOptions={['RED', 'GREEN']}
                hideModifier={true}
              />
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        (!selectedDates.stock2Date || dateChanged.stock2Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                        !selectedDates.stock2Date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDates.stock2Date ? format(selectedDates.stock2Date, "PPP") : <span>No date (NILL)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDates.stock2Date || undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDates(prev => ({ ...prev, stock2Date: date }));
                          setDateChanged(prev => ({ ...prev, stock2Date: true }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDates(prev => ({ ...prev, stock2Date: null }));
                    setDateChanged(prev => ({ ...prev, stock2Date: false }));
                  }}
                  className={cn(
                    !selectedDates.stock2Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                  )}
                >
                  NILL
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <SimpleOptionSelector
                label="B"
                selectedValue={formData.stock2b}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stock2b: value }))}
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
              selectedValue={formData.stock3}
              onValueChange={(value) => setFormData(prev => ({ ...prev, stock3: value }))}
              baseOptions={['CG+', 'CG-', 'CGB', 'CR+', 'CR-', 'CRB', 'OG+', 'OG-', 'OGB', 'OR+', 'OR-', 'ORB', 'SD CG-', 'SD CG+', 'SD CGB', 'SD CR-', 'SD CR+', 'SD CRB', 'NILL']}
              hideModifier={true}
            />
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        (!selectedDates.stock3Date || dateChanged.stock3Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                        !selectedDates.stock3Date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDates.stock3Date ? format(selectedDates.stock3Date, "PPP") : <span>No date (NILL)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDates.stock3Date || undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDates(prev => ({ ...prev, stock3Date: date }));
                          setDateChanged(prev => ({ ...prev, stock3Date: true }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDates(prev => ({ ...prev, stock3Date: null }));
                    setDateChanged(prev => ({ ...prev, stock3Date: false }));
                  }}
                  className={cn(
                    !selectedDates.stock3Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                  )}
                >
                  NILL
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <SimpleOptionSelector
                label="CLOSE A"
                 selectedValue={formData.stock4}
                 onValueChange={(value) => setFormData(prev => ({ ...prev, stock4: value }))}
                 baseOptions={['CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB', 'OG-', 'OG+', 'OGB', 'OR-', 'OR+', 'ORB', 'SD CG-', 'SD CG+', 'SD CGB', 'SD CR-', 'SD CR+', 'SD CRB', 'NILL']}
                 hideModifier={true}
               />
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        (!selectedDates.stock4Date || dateChanged.stock4Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                        !selectedDates.stock4Date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDates.stock4Date ? format(selectedDates.stock4Date, "PPP") : <span>No date (NILL)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDates.stock4Date || undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDates(prev => ({ ...prev, stock4Date: date }));
                          setDateChanged(prev => ({ ...prev, stock4Date: true }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDates(prev => ({ ...prev, stock4Date: null }));
                    setDateChanged(prev => ({ ...prev, stock4Date: false }));
                  }}
                  className={cn(
                    !selectedDates.stock4Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                  )}
                >
                  NILL
                </Button>
              </div>
            </div>
          </div>

          {/* Part 1 RESULT */}
          <div className="space-y-2">
            <Label htmlFor="part1Result" className="text-xl font-bold">RESULT</Label>
            <Select 
              value={formData.part1Result}
              onValueChange={(value) => setFormData(prev => ({ ...prev, part1Result: value as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | '' }))}
            >
              <SelectTrigger className={`text-xl font-bold ${formData.part1Result ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}>
                <SelectValue placeholder="Select Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Act" className="text-xl font-bold">Act</SelectItem>
                <SelectItem value="Front Act" className="text-xl font-bold">Front Act</SelectItem>
                <SelectItem value="Consolidation Act" className="text-xl font-bold">Consolidation Act</SelectItem>
                <SelectItem value="Consolidation Front Act" className="text-xl font-bold">Consolidation Front Act</SelectItem>
                <SelectItem value="Consolidation Close" className="text-xl font-bold">Consolidation Close</SelectItem>
                <SelectItem value="Act doubt" className="text-xl font-bold">Act doubt</SelectItem>
                <SelectItem value="3rd act" className="text-xl font-bold">3rd act</SelectItem>
                <SelectItem value="4th act" className="text-xl font-bold">4th act</SelectItem>
                <SelectItem value="5th act" className="text-xl font-bold">5th act</SelectItem>
                <SelectItem value="NILL" className="text-xl font-bold">NILL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Part 1 Notes */}
          <div className="space-y-2">
            <Label htmlFor="part1Notes" className="text-xl font-bold">NOTES</Label>
            <Textarea
              id="part1Notes"
              placeholder=""
              value={formData.part1Notes}
              onChange={(e) => setFormData(prev => ({ ...prev, part1Notes: e.target.value.toUpperCase() }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Part 1 Buttons */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              onClick={handleRefresh} 
              className="flex-1 bg-white text-green-600 border border-border hover:bg-white hover:text-green-700 font-bold" 
              variant="outline"
            >
              REFRESH
            </Button>
            <Button 
              type="button"
              onClick={handlePart1Submit}
              className="flex-1"
              variant="default"
            >
              Save Part 1
            </Button>
          </div>

            {part1SavedData && (
              <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                <div className="text-sm font-bold text-green-800">
                  ✓ Part 1 Saved! You can now fill Part 2.
                </div>
              </div>
            )}
          </TabsContent>

          {/* Part 2 Tab */}
          <TabsContent value="part2" className="space-y-4">
          {/* Four Dropdowns Row */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-lg font-bold">OG DIRECTION A</Label>
                <Select 
                  value={newDropdowns.dropdown1}
                  onValueChange={(value) => setNewDropdowns(prev => ({ ...prev, dropdown1: value }))}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: newDropdowns.dropdown1 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="OG" className="text-lg font-bold">OG</SelectItem>
                    <SelectItem value="OR" className="text-lg font-bold">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg font-bold">OG DIRECTION B</Label>
                <Select 
                  value={newDropdowns.dropdown2}
                  onValueChange={(value) => setNewDropdowns(prev => ({ ...prev, dropdown2: value }))}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: newDropdowns.dropdown2 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                    <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                    <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                    <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                    <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg font-bold">OG DIRECTION C</Label>
                <Select 
                  value={newDropdowns.dropdown3}
                  onValueChange={(value) => setNewDropdowns(prev => ({ ...prev, dropdown3: value }))}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: newDropdowns.dropdown3 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                    <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                    <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                    <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                    <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg font-bold">OG DIRECTION D</Label>
                <Select 
                  value={newDropdowns.dropdown4}
                  onValueChange={(value) => setNewDropdowns(prev => ({ ...prev, dropdown4: value }))}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: newDropdowns.dropdown4 ? '#dcfce7' : '#ffe3e2' }}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="FORWARD" className="text-lg font-bold">FORWARD</SelectItem>
                    <SelectItem value="IN" className="text-lg font-bold">IN</SelectItem>
                    <SelectItem value="REVERSE" className="text-lg font-bold">REVERSE</SelectItem>
                    <SelectItem value="RETURN" className="text-lg font-bold">RETURN</SelectItem>
                    <SelectItem value="NILL" className="text-lg font-bold">NILL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Single Date Field for All OG DIRECTION Dropdowns */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      (!selectedDates.dropdown1Date || dateChanged.dropdown1Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                      !selectedDates.dropdown1Date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDates.dropdown1Date ? format(selectedDates.dropdown1Date, "PPP") : <span>No date (NILL)</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDates.dropdown1Date || undefined}
                    onSelect={(date) => {
                      setSelectedDates(prev => ({ ...prev, dropdown1Date: date || null }));
                      setDateChanged(prev => ({ ...prev, dropdown1Date: true }));
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDates(prev => ({ ...prev, dropdown1Date: null }));
                  setDateChanged(prev => ({ ...prev, dropdown1Date: false }));
                }}
                className={cn(
                  !selectedDates.dropdown1Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                )}
              >
                NILL
              </Button>
            </div>
          </div>
          
          {/* OG CANDLE Section */}
          <div className="space-y-2">
            <Label className="text-lg font-bold">OG CANDLE</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Dropdown: CANDLE 1-25 */}
              <Select 
                value={dropdowns.candleMain}
                onValueChange={(value) => setDropdowns(prev => ({ ...prev, candleMain: value }))}
              >
                <SelectTrigger 
                  className="text-lg font-bold"
                  style={{ backgroundColor: dropdowns.candleMain ? '#dcfce7' : '#ffe3e2' }}
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
              
              {/* Second Dropdown: RED/GREEN */}
              <Select 
                value={dropdowns.candleSub}
                onValueChange={(value) => setDropdowns(prev => ({ ...prev, candleSub: value }))}
              >
                <SelectTrigger 
                  className="text-lg font-bold"
                  style={{ backgroundColor: dropdowns.candleSub ? '#dcfce7' : '#ffe3e2' }}
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
          
          {/* OG OPEN A and OG CLOSE A Dropdowns in Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OG OPEN A */}
            <div className="space-y-2">
              <Label className="text-lg font-bold">OG OPEN A</Label>
              <Select 
                value={formData.ogOpenA}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ogOpenA: value }))}
              >
                <SelectTrigger 
                  className="text-lg font-bold"
                  style={{ backgroundColor: formData.ogOpenA ? '#dcfce7' : '#ffe3e2' }}
                >
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
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        (!selectedDates.ogOpenADate || dateChanged.ogOpenADate) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                        !selectedDates.ogOpenADate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDates.ogOpenADate ? format(selectedDates.ogOpenADate, "PPP") : <span>No date (NILL)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDates.ogOpenADate || undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDates(prev => ({ ...prev, ogOpenADate: date }));
                          setDateChanged(prev => ({ ...prev, ogOpenADate: true }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDates(prev => ({ ...prev, ogOpenADate: null }));
                    setDateChanged(prev => ({ ...prev, ogOpenADate: false }));
                  }}
                  className={cn(
                    !selectedDates.ogOpenADate ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                  )}
                >
                  NILL
                </Button>
              </div>
            </div>
            
            {/* OG CLOSE A */}
            <div className="space-y-2">
              <Label className="text-lg font-bold">OG CLOSE A</Label>
              <Select 
                value={formData.ogCloseA}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ogCloseA: value }))}
              >
                <SelectTrigger 
                  className="text-lg font-bold"
                  style={{ backgroundColor: formData.ogCloseA ? '#dcfce7' : '#ffe3e2' }}
                >
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
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        (!selectedDates.ogCloseADate || dateChanged.ogCloseADate) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200",
                        !selectedDates.ogCloseADate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDates.ogCloseADate ? format(selectedDates.ogCloseADate, "PPP") : <span>No date (NILL)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDates.ogCloseADate || undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDates(prev => ({ ...prev, ogCloseADate: date }));
                          setDateChanged(prev => ({ ...prev, ogCloseADate: true }));
                        }
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDates(prev => ({ ...prev, ogCloseADate: null }));
                    setDateChanged(prev => ({ ...prev, ogCloseADate: false }));
                  }}
                  className={cn(
                    !selectedDates.ogCloseADate ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                  )}
                >
                  NILL
                </Button>
              </div>
            </div>
          </div>
          
          {/* Part 2 RESULT */}
          <div className="space-y-2">
            <Label htmlFor="part2Result" className="text-xl font-bold">RESULT</Label>
            <Select 
              value={formData.part2Result}
              onValueChange={(value) => setFormData(prev => ({ ...prev, part2Result: value as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | '' }))}
            >
              <SelectTrigger className={`text-xl font-bold ${formData.part2Result ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}>
                <SelectValue placeholder="Select Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Act" className="text-xl font-bold">Act</SelectItem>
                <SelectItem value="Front Act" className="text-xl font-bold">Front Act</SelectItem>
                <SelectItem value="Consolidation Act" className="text-xl font-bold">Consolidation Act</SelectItem>
                <SelectItem value="Consolidation Front Act" className="text-xl font-bold">Consolidation Front Act</SelectItem>
                <SelectItem value="Consolidation Close" className="text-xl font-bold">Consolidation Close</SelectItem>
                <SelectItem value="Act doubt" className="text-xl font-bold">Act doubt</SelectItem>
                <SelectItem value="3rd act" className="text-xl font-bold">3rd act</SelectItem>
                <SelectItem value="4th act" className="text-xl font-bold">4th act</SelectItem>
                <SelectItem value="5th act" className="text-xl font-bold">5th act</SelectItem>
                <SelectItem value="NILL" className="text-xl font-bold">NILL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Messages */}
          {showMissingInfo && (
            <div className="p-4 bg-destructive border-2 border-destructive text-destructive-foreground rounded-lg animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold">✗ Missing Information</span>
              </div>
              <div className="text-sm">
                <span className="font-bold">Please fill in:</span> {missingFields.join(", ")}
              </div>
            </div>
          )}

          {/* Part 2 Buttons */}
          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={handlePart2Submit}
              className="flex-1"
              variant="default"
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Part 2 Save (Optional)'}
            </Button>
            <Button 
              type="button"
              onClick={handleCommonSave}
              className="flex-1"
              variant="default"
              disabled={uploading || !part1SavedData}
            >
              {uploading ? 'Saving...' : 'Common Save'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
  );
};

export default StockEntry;
