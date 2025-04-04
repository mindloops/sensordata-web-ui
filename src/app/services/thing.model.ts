export const DEFAULT_LOCATION_SELECTION = 'POLYGON((-180 -90,180 -90,180 90,-180 90,-180 -90))'

export interface Thing {
  id: number;
  name: string;
  location: Point
  datastreamIds: string[];
  observedProperties: string[];
}

export interface Point {
  lat: number;
  lon: number;
}
