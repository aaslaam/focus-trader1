import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TrendingUp } from 'lucide-react';
import { getVisualStyle } from '@/utils/visualIndicators';

interface Option {
  value: string;
  label: string;
}

interface OptionMatrixProps {
  label: string;
  options: Option[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  columns?: number;
  enableVisualIndicators?: boolean;
}

const OptionMatrix: React.FC<OptionMatrixProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  columns = 4,
  enableVisualIndicators = false
}) => {
  // Organize options into rows
  const rows: Option[][] = [];
  for (let i = 0; i < options.length; i += columns) {
    rows.push(options.slice(i, i + columns));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2">
            {row.map((option) => {
              const visualStyle = enableVisualIndicators ? getVisualStyle(option.value) : null;
              const isSelected = selectedValue === option.value;
              
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onValueChange(isSelected ? '' : option.value)}
                  className={`flex items-center justify-center text-xs p-3 h-auto min-h-[60px] whitespace-normal text-center gap-1 ${
                    visualStyle && !isSelected ? visualStyle.className : ''
                  }`}
                >
                  {visualStyle?.showIcon && visualStyle.iconType === 'candle' && (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span className="leading-tight">{option.label}</span>
                </Button>
              );
            })}
            {/* Fill empty cells if needed */}
            {row.length < columns && 
              Array.from({ length: columns - row.length }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionMatrix;