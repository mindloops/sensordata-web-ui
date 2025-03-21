import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Thing } from './thing.model';

@Injectable({
  providedIn: 'root'
})
export class ThingsService {
  private apiUrl = '/api/Things';

  constructor(private http: HttpClient) { }

  getThings(): Observable<Thing[]> {
    return this.http.get<{value: Thing[] }>(this.apiUrl).pipe(
      map(response => response.value)
    );
  }
}