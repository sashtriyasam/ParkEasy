/**
 * Applies an alpha transparency level to a HEX color string.
 * Supports #RGB, #RRGGBB, and #RRGGBBAA formats.
 * @param hex The color string (e.g., #FF5733)
 * @param alpha The alpha value (0 to 1)
 * @returns A hex string with the applied alpha
 */
export const applyAlpha = (hex: string, alpha: number): string => {
  if (!hex || hex.indexOf('#') !== 0) return hex;
  
  // Remove hash
  let color = hex.slice(1);
  
  // Normalize to RRGGBB
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('');
  } else if (color.length === 4) {
    // #RGBA -> #RRGGBB (drop shorthand alpha A, expand RGB)
    color = color.slice(0, 3).split('').map(char => char + char).join('');
  } else if (color.length === 8) {
    color = color.slice(0, 6);
  } else if (color.length !== 6) {
    // Return original hex as fallback for invalid/unsupported lengths
    return hex;
  }
  
  // Convert alpha to 2-digit hex with clamping
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clampedAlpha * 255).toString(16).padStart(2, '0');
  
  return `#${color.toUpperCase()}${alphaHex.toUpperCase()}`;
};
