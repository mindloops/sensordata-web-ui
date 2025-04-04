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
