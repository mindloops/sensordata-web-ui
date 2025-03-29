// data.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { TableData } from './sensor-table.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'api/data'; // Replace with your actual API endpoint

  getData(): Observable<TableData[]> {
    return this.http.get<TableData[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<TableData[]>('getData', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}
