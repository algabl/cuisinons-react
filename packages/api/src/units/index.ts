export enum UnitCategory {
  VOLUME = "volume",
  WEIGHT = "weight",
  COUNT = "count",
  SPECIAL = "special",
}

export interface UnitDefinition {
  id: string;
  name: string;
  abbreviation: string;
  category: UnitCategory;
  baseConversionFactor: number; // Conversion factor to base unit (ml for volume, g for weight)
}

// Base units: ml for volume, g for weight
export const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  // Volume units (base: ml)
  ml: {
    id: "ml",
    name: "milliliters",
    abbreviation: "ml",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 1,
  },
  l: {
    id: "l",
    name: "liters",
    abbreviation: "l",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 1000,
  },
  tsp: {
    id: "tsp",
    name: "teaspoons",
    abbreviation: "tsp",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 4.92892,
  },
  tbsp: {
    id: "tbsp",
    name: "tablespoons",
    abbreviation: "tbsp",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 14.7868,
  },
  cup: {
    id: "cup",
    name: "cups",
    abbreviation: "cup",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 236.588,
  },
  pint: {
    id: "pint",
    name: "pints",
    abbreviation: "pt",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 473.176,
  },
  quart: {
    id: "quart",
    name: "quarts",
    abbreviation: "qt",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 946.353,
  },
  gallon: {
    id: "gallon",
    name: "gallons",
    abbreviation: "gal",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 3785.41,
  },
  floz: {
    id: "floz",
    name: "fluid ounces",
    abbreviation: "fl oz",
    category: UnitCategory.VOLUME,
    baseConversionFactor: 29.5735,
  },

  // Weight units (base: g)
  mg: {
    id: "mg",
    name: "milligrams",
    abbreviation: "mg",
    category: UnitCategory.WEIGHT,
    baseConversionFactor: 0.001,
  },
  g: {
    id: "g",
    name: "grams",
    abbreviation: "g",
    category: UnitCategory.WEIGHT,
    baseConversionFactor: 1,
  },
  kg: {
    id: "kg",
    name: "kilograms",
    abbreviation: "kg",
    category: UnitCategory.WEIGHT,
    baseConversionFactor: 1000,
  },
  oz: {
    id: "oz",
    name: "ounces",
    abbreviation: "oz",
    category: UnitCategory.WEIGHT,
    baseConversionFactor: 28.3495,
  },
  lb: {
    id: "lb",
    name: "pounds",
    abbreviation: "lb",
    category: UnitCategory.WEIGHT,
    baseConversionFactor: 453.592,
  },

  // Count units
  piece: {
    id: "piece",
    name: "pieces",
    abbreviation: "pc",
    category: UnitCategory.COUNT,
    baseConversionFactor: 1,
  },
  whole: {
    id: "whole",
    name: "whole",
    abbreviation: "whole",
    category: UnitCategory.COUNT,
    baseConversionFactor: 1,
  },
  each: {
    id: "each",
    name: "each",
    abbreviation: "each",
    category: UnitCategory.COUNT,
    baseConversionFactor: 1,
  },
  dozen: {
    id: "dozen",
    name: "dozen",
    abbreviation: "dz",
    category: UnitCategory.COUNT,
    baseConversionFactor: 12,
  },

  // Special units (no conversion)
  pinch: {
    id: "pinch",
    name: "pinch",
    abbreviation: "pinch",
    category: UnitCategory.SPECIAL,
    baseConversionFactor: 1,
  },
  dash: {
    id: "dash",
    name: "dash",
    abbreviation: "dash",
    category: UnitCategory.SPECIAL,
    baseConversionFactor: 1,
  },
  taste: {
    id: "taste",
    name: "to taste",
    abbreviation: "to taste",
    category: UnitCategory.SPECIAL,
    baseConversionFactor: 1,
  },
  needed: {
    id: "needed",
    name: "as needed",
    abbreviation: "as needed",
    category: UnitCategory.SPECIAL,
    baseConversionFactor: 1,
  },

  // None/no unit
  none: {
    id: "none",
    name: "none",
    abbreviation: "none",
    category: UnitCategory.COUNT,
    baseConversionFactor: 1,
  },
};

export function getUnitsByCategory(category: UnitCategory): UnitDefinition[] {
  return Object.values(UNIT_DEFINITIONS).filter(
    (unit) => unit.category === category,
  );
}

export function getUnitDefinition(unitId: string): UnitDefinition | undefined {
  return UNIT_DEFINITIONS[unitId];
}


export function canConvertUnits(fromUnit: string, toUnit: string): boolean {
  const from = getUnitDefinition(fromUnit);
  const to = getUnitDefinition(toUnit);

  if (!from || !to) return false;

  // Can convert within same category, except SPECIAL units
  return (
    from.category === to.category && from.category !== UnitCategory.SPECIAL
  );
}

export function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
): number | null {
  if (!canConvertUnits(fromUnit, toUnit)) return null;

  const from = getUnitDefinition(fromUnit);
  const to = getUnitDefinition(toUnit);

  if (!from || !to) return null;

  // Convert to base unit, then to target unit
  const baseQuantity = quantity * from.baseConversionFactor;
  const convertedQuantity = baseQuantity / to.baseConversionFactor;

  // Round to reasonable precision
  return Math.round(convertedQuantity * 1000) / 1000;
}

export const UNIT_OPTIONS = Object.values(UNIT_DEFINITIONS).map((unit) => ({
  value: unit.id,
  label: unit.name,
  abbreviation: unit.abbreviation,
  category: unit.category,
}));
