import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimpleOptionSelectorProps {
  label: React.ReactNode;
  selectedValue: string;
  onValueChange: (value: string) => void;
  baseOptions?: string[];
  hideModifier?: boolean;
  customModifiers?: string[];
  customBackgroundColors?: {
    empty: string;
    filled: string;
  };
  customBackgroundStyle?: {
    empty: React.CSSProperties;
    filled: React.CSSProperties;
  };
}

const SimpleOptionSelector: React.FC<SimpleOptionSelectorProps> = ({
  label,
  selectedValue,
  onValueChange,
  baseOptions = ['OG', 'OR', 'CG', 'CR'],
  hideModifier = false,
  customModifiers,
  customBackgroundColors,
  customBackgroundStyle
}) => {
  const suffixes = customModifiers || ['-', '+', 'B'];

  // Parse current selection
  const getBaseOption = () => {
    if (!selectedValue) return '';
    // Sort by length descending to match longest option first (e.g., "Candle 10" before "Candle 1")
    const sortedOptions = [...baseOptions].sort((a, b) => b.length - a.length);
    const base = sortedOptions.find(opt => selectedValue.startsWith(opt));
    return base || '';
  };

  const getSuffix = () => {
    if (!selectedValue) return '';
    const base = getBaseOption();
    return base ? selectedValue.slice(base.length) : '';
  };

  const handleBaseChange = (baseOption: string) => {
    const currentSuffix = getSuffix();
    const newValue = currentSuffix ? `${baseOption}${currentSuffix}` : baseOption;
    onValueChange(newValue);
  };

  const handleSuffixChange = (suffix: string) => {
    const currentBase = getBaseOption();
    const newValue = currentBase ? `${currentBase}${suffix}` : suffix;
    onValueChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xl font-bold">{label}</Label>
      <div className={hideModifier ? "w-full" : "grid grid-cols-2 gap-4"}>
        <div className="space-y-2">
          <Select value={hideModifier ? selectedValue : getBaseOption()} onValueChange={hideModifier ? onValueChange : handleBaseChange}>
            <SelectTrigger 
              className={`w-full border-border text-lg h-12 ${
                customBackgroundColors 
                  ? ((hideModifier ? selectedValue : getBaseOption()) ? customBackgroundColors.filled : customBackgroundColors.empty)
                  : ((hideModifier ? selectedValue : getBaseOption()) ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200')
              }`}
              style={customBackgroundStyle 
                ? ((hideModifier ? selectedValue : getBaseOption()) ? customBackgroundStyle.filled : customBackgroundStyle.empty)
                : undefined
              }
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border shadow-md z-50 max-h-[300px] overflow-y-auto">
              {baseOptions.map((option) => (
                <SelectItem key={option} value={option} className="hover:bg-accent text-xl py-3 font-bold">
                  <span className={
                    option === 'ULTTA' ? 'text-red-600 font-bold' : 
                    option === 'NILL' ? 'text-red-600 font-bold' : ''
                  }>
                    {option}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {!hideModifier && (
          <div className="space-y-2">
            <Select value={getSuffix()} onValueChange={handleSuffixChange}>
              <SelectTrigger 
                className={`w-full border-border text-lg h-12 ${
                  customBackgroundColors
                    ? (getSuffix() ? customBackgroundColors.filled : customBackgroundColors.empty)
                    : (getSuffix() ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200')
                }`}
                style={customBackgroundStyle
                  ? (getSuffix() ? customBackgroundStyle.filled : customBackgroundStyle.empty)
                  : undefined
                }
              >
                <SelectValue />
              </SelectTrigger>
               <SelectContent className="bg-popover border-border shadow-md z-50 max-h-[300px] overflow-y-auto">
                 {suffixes.map((suffix) => (
                   <SelectItem key={suffix} value={suffix} className="hover:bg-accent text-xl py-3 font-bold">
                     <span className={
                       suffix === 'NILL' ? 'text-red-600 font-bold' : 
                       suffix === 'RED' ? 'text-red-600 font-bold' : 
                       suffix === 'GREEN' ? 'text-green-600 font-bold' : ''
                     }>
                       {suffix === 'red' ? 'RED' : 
                        suffix === 'green' ? 'GREEN' : 
                        suffix === '-' ? <span className="text-3xl font-black">-</span> : 
                        suffix === '+' ? <span className="text-3xl font-black">+</span> : 
                        suffix === 'B' ? <span className="text-2xl font-black">B</span> : 
                        suffix}
                     </span>
                   </SelectItem>
                ))}
               </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {selectedValue && (
        <div className="mt-2 p-2 bg-muted rounded text-sm">
          <span className="font-medium">Selected: </span>
          <span className={`font-bold ${
            selectedValue.toUpperCase() === 'NILL' || selectedValue.toUpperCase() === 'ULTTA' ? 'text-red-600' :
            selectedValue.toUpperCase().includes('RED') ? 'text-red-600' :
            selectedValue.toUpperCase().includes('GREEN') ? 'text-green-600' :
            'text-primary'
          }`}>
            {selectedValue.toUpperCase()
              .replace(/([A-Z]{2,})(\-|\+|B)$/g, '$1 $2')
              .replace(/SD([A-Z])/g, 'SD $1')
              .replace(/NC([A-Z])/g, 'NC $1')
              .replace(/(IN)\s*(FORWARD|REVERSE|CG|CR)/g, '$1 $2')
              .replace(/([A-Z]{2})(IN|UP|DOWN|FORWARD|REVERSE|RETURN)/g, '$1 $2')
              .replace(/(FORWARD|REVERSE|RETURN)([A-Z\-\+B])/g, '$1 $2')
              .replace(/CANDLE(\d+)/g, 'CANDLE $1')
              .replace(/(\d)(RED|GREEN)/g, '$1 $2')
              .replace(/\s+/g, ' ')
              .trim()}
          </span>
        </div>
      )}
    </div>
  );
};

export default SimpleOptionSelector;