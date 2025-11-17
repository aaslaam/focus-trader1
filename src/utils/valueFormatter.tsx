import React from 'react';

/**
 * Add proper spacing to compound values
 */
const addSpacing = (value: string): string => {
  let formatted = value;
  
  // Add space between base option and modifiers (e.g., "OG-" -> "OG -", "CGB" -> "CG B")
  formatted = formatted.replace(/([A-Z]{2,})(\-|\+|B)/g, '$1 $2');
  
  // Add space after SD patterns (SD CG, SD CR, SD OG, SD OR)
  formatted = formatted.replace(/SD([A-Z])/g, 'SD $1');
  
  // Add space after NC patterns (NC RED, NC GREEN)
  formatted = formatted.replace(/NC([A-Z])/g, 'NC $1');
  
  // Add space between CG/CR/OG/OR and following words
  formatted = formatted.replace(/([A-Z]{2})(IN|UP|DOWN|FORWARD|REVERSE|RETURN)/g, '$1 $2');
  
  // Add space between words like FORWARD RETURN, REVERSE RETURN, etc.
  formatted = formatted.replace(/(FORWARD|REVERSE|RETURN)([A-Z])/g, '$1 $2');
  
  // Add space after Candle numbers and before modifiers
  formatted = formatted.replace(/CANDLE(\d+)/g, 'CANDLE $1');
  formatted = formatted.replace(/(\d)(RED|GREEN)/g, '$1 $2');
  
  // Clean up multiple spaces
  formatted = formatted.replace(/\s+/g, ' ');
  
  return formatted.trim();
};

/**
 * Format a value with proper color coding and text transformations
 */
export const formatValue = (value: string): React.ReactNode => {
  if (!value) return '';
  
  const upperValue = value.toUpperCase();
  const spacedValue = addSpacing(upperValue);
  
  // Handle special cases with color coding
  if (upperValue === 'NILL') {
    return <span className="text-red-600 font-bold">{spacedValue}</span>;
  }
  
  if (upperValue === 'ULTTA') {
    return <span className="text-red-600 font-bold">{spacedValue}</span>;
  }
  
  // Don't color NC GREEN and NC RED (display as normal text)
  if (upperValue === 'NC GREEN' || upperValue === 'NC RED' || upperValue === 'NCGREEN' || upperValue === 'NCRED') {
    return <span className="font-bold">{spacedValue}</span>;
  }
  
  if (upperValue === 'RED' || upperValue.endsWith('RED') || upperValue.includes('RED')) {
    return <span className="text-red-600 font-bold">{spacedValue}</span>;
  }
  
  if (upperValue === 'GREEN' || upperValue.endsWith('GREEN') || upperValue.includes('GREEN')) {
    return <span className="text-green-600 font-bold">{spacedValue}</span>;
  }
  
  // Default: return uppercase value with proper spacing
  return <span className="font-bold">{spacedValue}</span>;
};

/**
 * Format value as string (for display in simple contexts)
 */
export const formatValueString = (value: string): string => {
  if (!value) return '';
  return addSpacing(value.toUpperCase());
};
