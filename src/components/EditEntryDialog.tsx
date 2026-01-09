import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit2, CalendarIcon, Upload, X } from 'lucide-react';
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
  classification: 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL';
  dropdown1?: string;
  dropdown2?: string;
  dropdown3?: string;
  dropdown4?: string;
  dropdown5?: string;
  dropdown6?: string;
  dropdown1Date?: Date | null;
  dropdown2Date?: Date | null;
  dropdown3Date?: Date | null;
  dropdown4Date?: Date | null;
  dropdown5Date?: Date | null;
  dropdown6Date?: Date | null;
  ogCandle?: string;
  ogOpenA?: string;
  ogCloseA?: string;
  ogOpenADate?: Date | null;
  ogCloseADate?: Date | null;
  notes?: string;
  imageUrl?: string;
  timestamp: number;
  type?: 'part1' | 'part2' | 'common';
}

interface EditEntryDialogProps {
  entry: StockEntryData;
  index: number;
  serialNumber: number;
  onEntryUpdated: () => void;
}

const EditEntryDialog: React.FC<EditEntryDialogProps> = ({ entry, index, serialNumber, onEntryUpdated }) => {
  const [formData, setFormData] = useState({
    stock1: '',
    stock2: '',
    stock2b: '',
    stock2bColor: '',
    stock3: '',
    stock4: '',
    classification: '' as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | '',
    ogOpenA: '',
    ogCloseA: '',
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
    dropdown5Main: '',
    dropdown5Sub: '',
    dropdown6Main: '',
    dropdown6Sub: '',
    candleMain: '',
    candleSub: ''
  });
  
  const [ogDirections, setOgDirections] = useState({
    dropdown1: '',
    dropdown2: '',
    dropdown3: '',
    dropdown4: ''
  });
  
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [selectedDates, setSelectedDates] = useState<{
    stock1Date: Date | null;
    stock2Date: Date | null;
    stock3Date: Date | null;
    stock4Date: Date | null;
    dropdown1Date: Date | null;
    dropdown2Date: Date | null;
    dropdown3Date: Date | null;
    dropdown4Date: Date | null;
    dropdown5Date: Date | null;
    dropdown6Date: Date | null;
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
    dropdown4Date: new Date(),
    dropdown5Date: new Date(),
    dropdown6Date: new Date(),
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
    dropdown4Date: boolean;
    dropdown5Date: boolean;
    dropdown6Date: boolean;
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
    dropdown4Date: false,
    dropdown5Date: false,
    dropdown6Date: false,
    ogOpenADate: false,
    ogCloseADate: false
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      const normalizeClassification = (classification: string): 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' => {
        if (classification === 'ACT') return 'Act';
        if (classification === 'FRONT ACT') return 'Front Act';
        return classification as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act';
      };

      setFormData({
        stock1: entry.stock1,
        stock2: entry.stock2,
        stock2b: entry.stock2b || '',
        stock2bColor: entry.stock2bColor || '',
        stock3: entry.stock3,
        stock4: entry.stock4,
        classification: normalizeClassification(entry.classification),
        ogOpenA: entry.ogOpenA || '',
        ogCloseA: entry.ogCloseA || '',
        notes: entry.notes || ''
      });
      
      // Parse INTRO dropdowns
      if (entry.dropdown1) {
        const parts = entry.dropdown1.split(' ');
        setDropdowns(prev => ({
          ...prev,
          dropdown1Main: parts[0] || '',
          dropdown1Sub: parts[1] || ''
        }));
      }
      if (entry.dropdown2) {
        const parts = entry.dropdown2.split(' ');
        setDropdowns(prev => ({
          ...prev,
          dropdown2Main: parts[0] || '',
          dropdown2Sub: parts[1] || ''
        }));
      }
      if (entry.dropdown3) {
        const parts = entry.dropdown3.split(' ');
        setDropdowns(prev => ({
          ...prev,
          dropdown3Main: parts[0] || '',
          dropdown3Sub: parts[1] || ''
        }));
      }
      
      // Parse OG CANDLE dropdowns
      if (entry.ogCandle) {
        const parts = entry.ogCandle.split(' ');
        if (parts.length >= 2) {
          setDropdowns(prev => ({
            ...prev,
            candleMain: parts.slice(0, -1).join(' '),
            candleSub: parts[parts.length - 1]
          }));
        }
      }
      
      // Set OG DIRECTION dropdowns
      setOgDirections({
        dropdown1: entry.dropdown1 || '',
        dropdown2: entry.dropdown2 || '',
        dropdown3: entry.dropdown3 || '',
        dropdown4: entry.dropdown4 || ''
      });
      
      setSelectedDates({
        stock1Date: entry.stock1Date ? new Date(entry.stock1Date) : null,
        stock2Date: entry.stock2Date ? new Date(entry.stock2Date) : null,
        stock3Date: entry.stock3Date ? new Date(entry.stock3Date) : null,
        stock4Date: entry.stock4Date ? new Date(entry.stock4Date) : null,
        dropdown1Date: entry.dropdown1Date ? new Date(entry.dropdown1Date) : null,
        dropdown2Date: entry.dropdown2Date ? new Date(entry.dropdown2Date) : null,
        dropdown3Date: entry.dropdown3Date ? new Date(entry.dropdown3Date) : null,
        dropdown4Date: entry.dropdown4Date ? new Date(entry.dropdown4Date) : null,
        dropdown5Date: entry.dropdown5Date ? new Date(entry.dropdown5Date) : null,
        dropdown6Date: entry.dropdown6Date ? new Date(entry.dropdown6Date) : null,
        ogOpenADate: entry.ogOpenADate ? new Date(entry.ogOpenADate) : null,
        ogCloseADate: entry.ogCloseADate ? new Date(entry.ogCloseADate) : null
      });
      
      setDateChanged({
        stock1Date: false,
        stock2Date: false,
        stock3Date: false,
        stock4Date: false,
        dropdown1Date: false,
        dropdown2Date: false,
        dropdown3Date: false,
        dropdown4Date: false,
        dropdown5Date: false,
        dropdown6Date: false,
        ogOpenADate: false,
        ogCloseADate: false
      });
      
      setImagePreview(entry.imageUrl || null);
      setSelectedImage(null);
    }
  }, [open, entry]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = entry.imageUrl;
    if (selectedImage) {
      imageUrl = (await uploadImage(selectedImage)) || entry.imageUrl;
    }

    // Combine dropdown values
    const dropdown1 = `${dropdowns.dropdown1Main} ${dropdowns.dropdown1Sub}`.trim();
    const dropdown2 = `${dropdowns.dropdown2Main} ${dropdowns.dropdown2Sub}`.trim();
    const dropdown3 = `${dropdowns.dropdown3Main} ${dropdowns.dropdown3Sub}`.trim();
    const ogCandle = `${dropdowns.candleMain} ${dropdowns.candleSub}`.trim();

    // Check if this was a Part 1 entry and Part 2 values are now added
    const wasPart1Entry = entry.type === 'part1';
    const hasPart2Values = !!(
      ogDirections.dropdown1 || 
      ogDirections.dropdown2 || 
      ogDirections.dropdown3 || 
      ogDirections.dropdown4 || 
      ogCandle || 
      formData.ogOpenA || 
      formData.ogCloseA
    );

    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    
    if (wasPart1Entry && hasPart2Values) {
      // Keep original Part 1 entry unchanged
      // Create NEW combined entry in Common with next serial number
      const newCombinedEntry: StockEntryData = {
        ...formData,
        ...selectedDates,
        classification: formData.classification as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL',
        dropdown1,
        dropdown2,
        dropdown3,
        dropdown4: ogDirections.dropdown4,
        ogCandle,
        imageUrl,
        timestamp: Date.now(), // New serial number
        type: 'common'
      };
      
      existingEntries.push(newCombinedEntry);
      localStorage.setItem('stockEntries', JSON.stringify(existingEntries));
      
      toast({
        title: "Combined Entry Created",
        description: `Original Part 1 entry preserved. New combined entry created in Common with serial #${existingEntries.length}`,
        variant: "default"
      });
    } else {
      // Regular update (keep same serial number and position)
      const updatedEntry: StockEntryData = {
        ...formData,
        ...selectedDates,
        classification: formData.classification as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL',
        dropdown1,
        dropdown2,
        dropdown3,
        dropdown4: ogDirections.dropdown4,
        ogCandle,
        imageUrl,
        timestamp: entry.timestamp,
        type: entry.type
      };
      
      const entryIndex = existingEntries.findIndex(e => e.timestamp === entry.timestamp);
      if (entryIndex !== -1) {
        existingEntries[entryIndex] = updatedEntry;
        localStorage.setItem('stockEntries', JSON.stringify(existingEntries));
      }
      
      toast({
        title: "Entry Updated",
        description: `Entry updated successfully`,
        variant: "default"
      });
    }

    setOpen(false);
    setUploading(false);
    onEntryUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            Edit Entry <span className="font-bold text-primary">#{serialNumber}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Part 1 Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Part 1 Fields</h3>
              
              {/* MONTHLY OPEN, MONTHLY CLOSE, WEEKLY OPEN, WEEKLY CLOSE Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MONTHLY OPEN */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">MONTHLY OPEN</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={dropdowns.dropdown1Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown1Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown1Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                        <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={dropdowns.dropdown1Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown1Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
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
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            (!selectedDates.dropdown1Date || dateChanged.dropdown1Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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

                {/* MONTHLY CLOSE */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">MONTHLY CLOSE</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={dropdowns.dropdown2Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown2Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown2Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                        <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={dropdowns.dropdown2Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown2Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
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
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            (!selectedDates.dropdown2Date || dateChanged.dropdown2Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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

                {/* WEEKLY OPEN */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">WEEKLY OPEN</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={dropdowns.dropdown3Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown3Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown3Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                        <SelectItem value="WR" className="text-lg font-bold">WR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={dropdowns.dropdown3Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown3Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
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
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            (!selectedDates.dropdown3Date || dateChanged.dropdown3Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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

                {/* WEEKLY CLOSE */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">WEEKLY CLOSE</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={dropdowns.dropdown4Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown4Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown4Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="WG" className="text-lg font-bold">WG</SelectItem>
                        <SelectItem value="WR" className="text-lg font-bold">WR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={dropdowns.dropdown4Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown4Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown4Sub ? '#dcfce7' : '#ffe3e2' }}
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
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            (!selectedDates.dropdown4Date || dateChanged.dropdown4Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDates.dropdown4Date ? format(selectedDates.dropdown4Date, "PPP") : <span>No date (NILL)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDates.dropdown4Date || undefined}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDates(prev => ({ ...prev, dropdown4Date: date }));
                              setDateChanged(prev => ({ ...prev, dropdown4Date: true }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDates(prev => ({ ...prev, dropdown4Date: null }));
                        setDateChanged(prev => ({ ...prev, dropdown4Date: false }));
                      }}
                      className={cn(
                        !selectedDates.dropdown4Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                      )}
                    >
                      NILL
                    </Button>
                  </div>
                </div>

                {/* DAILY OPEN */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">DAILY OPEN</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={dropdowns.dropdown5Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown5Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown5Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                        <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={dropdowns.dropdown5Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown5Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown5Sub ? '#dcfce7' : '#ffe3e2' }}
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
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            (!selectedDates.dropdown5Date || dateChanged.dropdown5Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDates.dropdown5Date ? format(selectedDates.dropdown5Date, "PPP") : <span>No date (NILL)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDates.dropdown5Date || undefined}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDates(prev => ({ ...prev, dropdown5Date: date }));
                              setDateChanged(prev => ({ ...prev, dropdown5Date: true }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDates(prev => ({ ...prev, dropdown5Date: null }));
                        setDateChanged(prev => ({ ...prev, dropdown5Date: false }));
                      }}
                      className={cn(
                        !selectedDates.dropdown5Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                      )}
                    >
                      NILL
                    </Button>
                  </div>
                </div>

                {/* DAILY CLOSE */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">DAILY CLOSE</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={dropdowns.dropdown6Main}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown6Main: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown6Main ? '#dcfce7' : '#ffe3e2' }}
                      >
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-[100]">
                        <SelectItem value="MG" className="text-lg font-bold">MG</SelectItem>
                        <SelectItem value="MR" className="text-lg font-bold">MR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={dropdowns.dropdown6Sub}
                      onValueChange={(value) => setDropdowns(prev => ({ ...prev, dropdown6Sub: value }))}
                    >
                      <SelectTrigger 
                        className="text-lg font-bold"
                        style={{ backgroundColor: dropdowns.dropdown6Sub ? '#dcfce7' : '#ffe3e2' }}
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
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            (!selectedDates.dropdown6Date || dateChanged.dropdown6Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDates.dropdown6Date ? format(selectedDates.dropdown6Date, "PPP") : <span>No date (NILL)</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDates.dropdown6Date || undefined}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDates(prev => ({ ...prev, dropdown6Date: date }));
                              setDateChanged(prev => ({ ...prev, dropdown6Date: true }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDates(prev => ({ ...prev, dropdown6Date: null }));
                        setDateChanged(prev => ({ ...prev, dropdown6Date: false }));
                      }}
                      className={cn(
                        !selectedDates.dropdown6Date ? "bg-green-100 hover:bg-green-200 text-gray-900" : "bg-blue-900 hover:bg-blue-800 text-white"
                      )}
                    >
                      NILL
                    </Button>
                  </div>
                </div>
              </div>

              {/* DIRECTION A, COLOUR, B */}
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
                            (!selectedDates.stock2Date || dateChanged.stock2Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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
                    label="DIRECTION B"
                    selectedValue={formData.stock2b}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, stock2b: value }))}
                    baseOptions={['CG IN', 'CG DOWN', 'CG UP', 'CR IN', 'CR UP', 'CR DOWN']}
                    hideModifier={true}
                    customBackgroundStyle={{ empty: { backgroundColor: '#ffe3e2' }, filled: { backgroundColor: '#dcfce7' } }}
                  />
                </div>
              </div>

              {/* OPEN A and CLOSE A */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <SimpleOptionSelector
                    label="OPEN A"
                    selectedValue={formData.stock3}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, stock3: value }))}
                    baseOptions={['CG+', 'CG-', 'CGB', 'CR+', 'CR-', 'CRB', 'OG+', 'OG-', 'OGB', 'OR+', 'OR-', 'ORB', 'NILL']}
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
                            (!selectedDates.stock3Date || dateChanged.stock3Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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
                            (!selectedDates.stock4Date || dateChanged.stock4Date) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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
            </div>

            {/* Part 2 Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-bold underline" style={{ color: '#e1f2ff' }}>PART 2 FIELDS</h3>
              
              {/* OG DIRECTION A, B, C, D */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG DIRECTION A</Label>
                  <Select 
                    value={ogDirections.dropdown1}
                    onValueChange={(value) => setOgDirections(prev => ({ ...prev, dropdown1: value }))}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: ogDirections.dropdown1 ? '#dcfce7' : '#ffe3e2' }}
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
                    value={ogDirections.dropdown2}
                    onValueChange={(value) => setOgDirections(prev => ({ ...prev, dropdown2: value }))}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: ogDirections.dropdown2 ? '#dcfce7' : '#ffe3e2' }}
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
                    value={ogDirections.dropdown3}
                    onValueChange={(value) => setOgDirections(prev => ({ ...prev, dropdown3: value }))}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: ogDirections.dropdown3 ? '#dcfce7' : '#ffe3e2' }}
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
                    value={ogDirections.dropdown4}
                    onValueChange={(value) => setOgDirections(prev => ({ ...prev, dropdown4: value }))}
                  >
                    <SelectTrigger 
                      className="text-lg font-bold"
                      style={{ backgroundColor: ogDirections.dropdown4 ? '#dcfce7' : '#ffe3e2' }}
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

              {/* OG CANDLE */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">OG CANDLE</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* OG OPEN A and OG CLOSE A */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG OPEN A</Label>
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
                            (!selectedDates.ogOpenADate || dateChanged.ogOpenADate) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold">OG CLOSE A</Label>
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
                            (!selectedDates.ogCloseADate || dateChanged.ogCloseADate) ? "bg-green-100 hover:bg-green-200" : "bg-sky-100 hover:bg-sky-200"
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
            </div>

            {/* RESULT */}
            <div className="space-y-2">
              <Label className="text-xl font-bold">RESULT</Label>
              <Select 
                value={formData.classification}
                onValueChange={(value) => setFormData(prev => ({ ...prev, classification: value as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' | '' }))}
              >
                <SelectTrigger className={`text-xl font-bold ${formData.classification ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}>
                  <SelectValue placeholder="Select Result" />
                </SelectTrigger>
                <SelectContent className="bg-card z-[100]">
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

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xl font-bold">NOTES</Label>
              <Textarea
                placeholder=""
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value.toUpperCase() }))}
                className="min-h-[80px]"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-xl font-bold">Image (Optional)</Label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-auto max-h-48 rounded-lg" />
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="flex-shrink-0 flex gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-form"
            className="flex-1"
            disabled={uploading}
          >
            {uploading ? 'Updating...' : 'Update Entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntryDialog;
