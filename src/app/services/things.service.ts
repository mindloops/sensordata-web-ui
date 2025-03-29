import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Thing } from './thing.model';

@Injectable({
  providedIn: 'root'
})
export class ThingsService {
  private apiUrl = '/api/Things?$expand=Datastreams/ObservedProperty($select=description)';

  constructor(private http: HttpClient) { }

  getThings(): Observable<Thing[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => {
        return response.value.map((thingData: any) => {
          return {
            id: thingData['@iot.id'],
            name: thingData.name,
            observedProperties: thingData.Datastreams.map(
              (dataStream: any) => dataStream.ObservedProperty.description
            ),
          };
        });
      })
    );
  }
}
