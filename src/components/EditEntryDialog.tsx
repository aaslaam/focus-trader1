import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  dropdown1Date?: Date | null;
  dropdown2Date?: Date | null;
  dropdown3Date?: Date | null;
  dropdown4Date?: Date | null;
  ogCandle?: string;
  ogOpenA?: string;
  ogCloseA?: string;
  ogOpenADate?: Date | null;
  ogCloseADate?: Date | null;
  notes?: string;
  imageUrl?: string;
  timestamp: number;
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
    ogCandle: '',
    ogOpenA: '',
    ogCloseA: '',
    notes: ''
  });
  const [candleDropdowns, setCandleDropdowns] = useState({
    candleMain: '',
    candleSub: ''
  });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<{
    stock1Date: Date | null;
    stock2Date: Date | null;
    stock3Date: Date | null;
    stock4Date: Date | null;
  }>({
    stock1Date: new Date(),
    stock2Date: new Date(),
    stock3Date: new Date(),
    stock4Date: new Date()
  });
  const [dateChanged, setDateChanged] = useState<{
    stock1Date: boolean;
    stock2Date: boolean;
    stock3Date: boolean;
    stock4Date: boolean;
  }>({
    stock1Date: false,
    stock2Date: false,
    stock3Date: false,
    stock4Date: false
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // No longer needed - using SimpleOptionSelector

  // Update combined OG CANDLE value whenever candle dropdowns change
  useEffect(() => {
    const combined = `${candleDropdowns.candleMain} ${candleDropdowns.candleSub}`.trim();
    setFormData(prev => ({ ...prev, ogCandle: combined }));
  }, [candleDropdowns.candleMain, candleDropdowns.candleSub]);

  useEffect(() => {
    if (open) {
      // Normalize classification value from legacy uppercase to current format
      const normalizeClassification = (classification: string): 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' => {
        if (classification === 'ACT') return 'Act';
        if (classification === 'FRONT ACT') return 'Front Act';
        return classification as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act';
      };

      setFormData({
        stock1: entry.stock1,
        stock2: entry.stock2,
        stock2b: entry.stock2b || '',
        stock2bColor: (entry as any).stock2bColor || '',
        stock3: entry.stock3,
        stock4: entry.stock4,
        classification: normalizeClassification(entry.classification),
        ogCandle: entry.ogCandle || '',
        ogOpenA: entry.ogOpenA || '',
        ogCloseA: entry.ogCloseA || '',
        notes: entry.notes || ''
      });
      
      // Parse ogCandle back into dropdowns
      if (entry.ogCandle) {
        const parts = entry.ogCandle.split(' ');
        if (parts.length >= 2) {
          setCandleDropdowns({
            candleMain: parts.slice(0, -1).join(' '), // Everything except last part
            candleSub: parts[parts.length - 1] // Last part
          });
        }
      } else {
        setCandleDropdowns({ candleMain: '', candleSub: '' });
      }
      
      setSelectedDates({
        stock1Date: entry.stock1Date ? new Date(entry.stock1Date) : null,
        stock2Date: entry.stock2Date ? new Date(entry.stock2Date) : null,
        stock3Date: entry.stock3Date ? new Date(entry.stock3Date) : null,
        stock4Date: entry.stock4Date ? new Date(entry.stock4Date) : null
      });
      setDateChanged({
        stock1Date: false,
        stock2Date: false,
        stock3Date: false,
        stock4Date: false
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
    
    // Check for missing fields, but exclude fields with "NILL" value
    const isFieldMissing = (value: string) => !value || value.trim() === '';
    
    if (isFieldMissing(formData.stock2) || isFieldMissing(formData.stock2b) || isFieldMissing(formData.stock3) || isFieldMissing(formData.stock4) || !formData.classification) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a result.",
        variant: "destructive"
      });
      setUploading(false);
      return;
    }

    console.log('EditEntry submit - classification:', formData.classification);

    // Check for duplicates (excluding current entry). Exact match on all fields including notes
    const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];
    
    const fmt = (d: Date | string) => format(new Date(d), 'yyyy-MM-dd');
    const currentDates = {
      stock1Date: fmt(selectedDates.stock1Date),
      stock2Date: fmt(selectedDates.stock2Date),
      stock3Date: fmt(selectedDates.stock3Date),
      stock4Date: fmt(selectedDates.stock4Date)
    };
    
    const normalizeNotes = (notes?: string) => (notes || '').trim();
    
    const isDuplicate = existingEntries.some((existingEntry) => {
      // Skip the current entry being edited by comparing timestamps
      if (existingEntry.timestamp === entry.timestamp) return false;
      
      const entryDates = {
        stock1Date: fmt(existingEntry.stock1Date),
        stock2Date: fmt(existingEntry.stock2Date),
        stock3Date: fmt(existingEntry.stock3Date),
        stock4Date: fmt(existingEntry.stock4Date)
      };
      return (
        existingEntry.stock1 === formData.stock1 &&
        existingEntry.stock2 === formData.stock2 &&
        existingEntry.stock2b === formData.stock2b &&
        existingEntry.stock3 === formData.stock3 &&
        existingEntry.stock4 === formData.stock4 &&
        existingEntry.classification === formData.classification &&
        entryDates.stock1Date === currentDates.stock1Date &&
        entryDates.stock2Date === currentDates.stock2Date &&
        entryDates.stock3Date === currentDates.stock3Date &&
        entryDates.stock4Date === currentDates.stock4Date &&
        normalizeNotes(existingEntry.notes) === normalizeNotes(formData.notes)
      );
    });

    if (isDuplicate) {
      toast({
        title: "Duplicate Entry",
        description: "An identical entry (all fields match exactly including notes) already exists.",
        variant: "destructive"
      });
      setUploading(false);
      return;
    }

    let imageUrl = entry.imageUrl;
    if (selectedImage) {
      imageUrl = (await uploadImage(selectedImage)) || entry.imageUrl;
    }

    const updatedEntry: StockEntryData = {
      ...formData,
      ...selectedDates,
      classification: formData.classification as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL',
      imageUrl,
      timestamp: entry.timestamp
    };

    // Find and update the entry by timestamp
    const entryIndex = existingEntries.findIndex(e => e.timestamp === entry.timestamp);
    if (entryIndex !== -1) {
      existingEntries[entryIndex] = updatedEntry;
      localStorage.setItem('stockEntries', JSON.stringify(existingEntries));
    }
    
    toast({
      title: "Entry Updated",
      description: `Entry combination result: ${formData.classification}`,
      variant: "default"
    });

    setOpen(false);
    setUploading(false);
    onEntryUpdated();
  };

  const handleSetAllNill = async () => {
    // Set all field values to NILL including direction A, B, colour, and classification
    setFormData(prev => ({
      ...prev,
      stock2: 'NILL',
      stock2b: 'NILL',
      stock2bColor: 'NILL',
      stock3: 'NILL',
      openb: 'NILL',
      stock4: 'NILL',
      stock4b: 'NILL',
      classification: 'NILL' as 'NILL'
    }));
    
    // Wait a bit for state to update, then submit
    setTimeout(async () => {
      setUploading(true);
      
      const existingEntries = JSON.parse(localStorage.getItem('stockEntries') || '[]') as StockEntryData[];

      let imageUrl = entry.imageUrl;
      if (selectedImage) {
        imageUrl = (await uploadImage(selectedImage)) || entry.imageUrl;
      }

      const updatedEntry: StockEntryData = {
        stock1: formData.stock1,
        stock2: 'NILL',
        stock2b: 'NILL',
        stock2bColor: 'NILL',
        stock3: 'NILL',
        stock4: 'NILL',
        ...selectedDates,
        classification: 'NILL',
        notes: formData.notes,
        imageUrl,
        timestamp: entry.timestamp
      };

      // Find and update the entry by timestamp
      const entryIndex = existingEntries.findIndex(e => e.timestamp === entry.timestamp);
      if (entryIndex !== -1) {
        existingEntries[entryIndex] = updatedEntry;
        localStorage.setItem('stockEntries', JSON.stringify(existingEntries));
        
        toast({
          title: "Entry Updated",
          description: "All fields set to NILL and entry updated successfully",
          variant: "default"
        });
      }

      setOpen(false);
      setUploading(false);
      onEntryUpdated();
    }, 100);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            Edit Entry <span className="font-bold text-primary">#{serialNumber}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
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
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                   <SimpleOptionSelector
                     label="CLOSE A"
                   selectedValue={formData.stock4}
                   onValueChange={(value) => setFormData(prev => ({ ...prev, stock4: value }))}
                   baseOptions={['CG-', 'CG+', 'CGB', 'CR-', 'CR+', 'CRB', 'OG-', 'OG+', 'OGB', 'OR-', 'OR+', 'ORB', 'NILL']}
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
           
            {/* OG CANDLE Section */}
            <div className="space-y-2">
              <Label className="text-lg font-bold">OG CANDLE</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Dropdown: CANDLE 1-25 */}
                <Select 
                  value={candleDropdowns.candleMain}
                  onValueChange={(value) => setCandleDropdowns(prev => ({ ...prev, candleMain: value }))}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: candleDropdowns.candleMain ? '#dcfce7' : '#ffe3e2' }}
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
                  value={candleDropdowns.candleSub}
                  onValueChange={(value) => setCandleDropdowns(prev => ({ ...prev, candleSub: value }))}
                >
                  <SelectTrigger 
                    className="text-lg font-bold"
                    style={{ backgroundColor: candleDropdowns.candleSub ? '#dcfce7' : '#ffe3e2' }}
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
           
            {/* OG OPEN A and OG CLOSE A in same row */}
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
              </div>
            </div>
            
            <div className="space-y-2">
             <Label htmlFor="edit-classification" className="text-xl font-bold">RESULT</Label>
            <Select 
              value={formData.classification} 
              onValueChange={(value) => {
                console.log('EditEntry classification selected:', value);
                setFormData(prev => ({ ...prev, classification: value as 'Act' | 'Front Act' | 'Consolidation Act' | 'Consolidation Front Act' | 'Consolidation Close' | 'Act doubt' | '3rd act' | '4th act' | '5th act' | 'NILL' }));
              }}
            >
              <SelectTrigger className={`text-xl font-bold ${formData.classification ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}>
                <SelectValue />
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

          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-xl font-bold">NOTES</Label>
            <Textarea
              id="edit-notes"
              placeholder=""
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value.toUpperCase() }))}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Image (Optional)</Label>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                id="edit-image"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('edit-image')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-1 right-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          </form>
        </div>
        <div className="flex gap-3 pt-4 border-t bg-background">
          <Button type="submit" className="flex-1" form="edit-form" disabled={uploading}>
            {uploading ? 'Updating...' : 'Update Entry'}
          </Button>
          <Button 
            type="button"
            size="sm"
            onClick={handleSetAllNill}
            className="text-white font-bold"
            style={{ backgroundColor: '#1f3b8a' }}
          >
            OK
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntryDialog;