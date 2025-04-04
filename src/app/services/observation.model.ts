export interface Observation {
  time: string; // The phenomenon time of the observation
  result: number; // The observed value
}

export interface DatastreamObservations {
  id: string; // The ID of the datastream
  observations: Observation[]; // Array of observations
}