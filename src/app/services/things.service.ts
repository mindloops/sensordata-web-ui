import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Thing } from './thing.model';

@Injectable({
  providedIn: 'root'
})
export class ThingsService {
  private apiUrl = '/api/Things?$expand=Locations,Datastreams/ObservedProperty($select=description)';

  constructor(private http: HttpClient) { }

  getThings(): Observable<Thing[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => {
        return response.value.map((thingData: any) => {
          return {
            id: thingData['@iot.id'],
            name: thingData.name,
            location: {
              lat: thingData.Locations[0].location.coordinates[1],
              lon: thingData.Locations[0].location.coordinates[0]
            },
            observedProperties: thingData.Datastreams.map(
              (dataStream: any) => dataStream.ObservedProperty.description
            ),
          };
        });
      })
    );
  }
}
