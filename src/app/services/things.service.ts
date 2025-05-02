import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {DEFAULT_LOCATION_SELECTION, Thing} from './thing.model';
import { DatastreamObservations } from './observation.model';

@Injectable({
  providedIn: 'root'
})
export class ThingsService {

  constructor(private http: HttpClient) { }

  getThings(wkt: string = DEFAULT_LOCATION_SELECTION): Observable<Thing[]> {
    let url = '/api/Things?$expand=Locations,Datastreams/ObservedProperty($select=description)';
    url += `&$filter=st_intersects(Locations/location, geography'SRID=4326;${wkt}')`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        return response.value.map((thingData: any) => {
          return {
            id: thingData['@iot.id'],
            name: thingData.name,
            location: {
              lat: thingData.Locations[0].location.coordinates[1],
              lon: thingData.Locations[0].location.coordinates[0]
            },
            datastreamIds: thingData.Datastreams?.map(
              (dataStream: any) => dataStream['@iot.id']
            ),
            observedProperties: thingData.Datastreams?.map(
              (dataStream: any) =>
                 dataStream.ObservedProperty.description
            ),
          };
        });
      })
    );
  }

  getObservations(datastreamId: string): Observable<DatastreamObservations> {
    const url = `/api/Datastreams(${datastreamId})?$expand=Observations($select=result,phenomenonTime)`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        return {
          id: response['@iot.id'],
          name: response.name,
          observations: response.Observations?.map((observation: any) => ({
            time: observation.phenomenonTime,
            result: observation.result
          })) ?? []
        };
      })
    );
  }
}
