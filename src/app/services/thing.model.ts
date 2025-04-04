export interface Thing {
  id: number;
  name: string;
  location: Point
  observedProperties: string[];
}

export interface Point {
  lat: number;
  lon: number;
}
