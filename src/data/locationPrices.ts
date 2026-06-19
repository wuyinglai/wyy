export type LocationType = 'city' | 'town' | 'outpost' | 'smallTown' | 'village';

export interface LocationPrices {
  locationType: LocationType;
  foodPrice: number;
  sparePartPrice: number | null;
}

export const LOCATION_PRICE_TABLE: Record<LocationType, LocationPrices> = {
  city: {
    locationType: 'city',
    foodPrice: 2,
    sparePartPrice: 8,
  },
  town: {
    locationType: 'town',
    foodPrice: 2,
    sparePartPrice: 8,
  },
  outpost: {
    locationType: 'outpost',
    foodPrice: 4,
    sparePartPrice: 12,
  },
  smallTown: {
    locationType: 'smallTown',
    foodPrice: 5,
    sparePartPrice: 14,
  },
  village: {
    locationType: 'village',
    foodPrice: 6,
    sparePartPrice: null,
  },
};

export function getLocationPrices(locationType: LocationType): LocationPrices {
  return LOCATION_PRICE_TABLE[locationType];
}
