export interface VisualStyle {
  className: string;
  showIcon: boolean;
  iconType?: 'candle';
}

export const getVisualStyle = (optionValue: string): VisualStyle => {
  const value = optionValue.toUpperCase().trim();
  
  // CG UP RED codes - Red background
  if (value === 'CG UP RED') {
    return {
      className: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
      showIcon: false
    };
  }
  
  // CG DOWN GREEN codes - Green background
  if (value === 'CG DOWN GREEN') {
    return {
      className: 'bg-success/20 text-success border-success/30 hover:bg-success/30',
      showIcon: false
    };
  }
  
  // CG codes - Green styling
  if (value.startsWith('CG')) {
    return {
      className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
      showIcon: false
    };
  }
  
  // CR codes - Red styling (no icon)
  if (value.startsWith('CR')) {
    return {
      className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
      showIcon: false
    };
  }
  
  // OG codes - Green background
  if (value.startsWith('OG')) {
    return {
      className: 'bg-success/20 text-success border-success/30 hover:bg-success/30',
      showIcon: false
    };
  }
  
  // OR codes - Red background
  if (value.startsWith('OR')) {
    return {
      className: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30',
      showIcon: false
    };
  }
  
  // NG codes - Light green background, no symbol
  if (value.startsWith('NG')) {
    return {
      className: 'bg-[#f3fbcc] text-gray-800 border-[#f3fbcc] hover:bg-[#f3fbcc]/80',
      showIcon: false
    };
  }
  
  // NR codes - Light green background, no symbol
  if (value.startsWith('NR')) {
    return {
      className: 'bg-[#f3fbcc] text-gray-800 border-[#f3fbcc] hover:bg-[#f3fbcc]/80',
      showIcon: false
    };
  }
  
  // NILL - Pink styling
  if (value === 'NILL') {
    return {
      className: 'bg-[#eba0b9] text-white border-[#eba0b9] hover:bg-[#eba0b9]/90',
      showIcon: false
    };
  }
  
  // SD codes - Special styling for new options
  if (value.startsWith('SD')) {
    if (value.startsWith('SD CG') || value.startsWith('SD OG')) {
      return {
        className: 'bg-success/30 text-success border-success/40 hover:bg-success/40',
        showIcon: false
      };
    }
    if (value.startsWith('SD CR') || value.startsWith('SD OR')) {
      return {
        className: 'bg-destructive/30 text-destructive border-destructive/40 hover:bg-destructive/40',
        showIcon: false
      };
    }
  }
  
  // Default styling for other options
  return {
    className: 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground',
    showIcon: false
  };
};