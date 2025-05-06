import { Component, OnInit } from '@angular/core';
import { ThingsService } from './services/things.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import {DEFAULT_LOCATION_SELECTION, Thing} from './services/thing.model';
import { MapComponent } from './map.component';
import { TableComponent } from './sensor-table.component';
import { ChartsComponent } from './charts.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MapComponent, TableComponent, ChartsComponent],
  template: `
    <div class="app-container">
      <div class="menu">
        <img src="logo.svg" alt="Logo" class="logo">
        <h1>Sensordata viewer</h1>
      </div>
      <div class="content">
        <app-sensor-table
          class="data-table"
          [data$]="things$"
          (processSelected)="onProcessSelected($event)">
        </app-sensor-table>
        <app-map
          class="map"
          (polygonComplete)="onPolygonComplete($event)"
          (polygonCanceled)="onPolygonCanceled()">
        </app-map>
      </div>
      <app-charts-page
        *ngIf="selectedThings.length > 0"
        [selectedThings]="selectedThings">
      </app-charts-page>
    </div>
  `,
  styles: `
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh; /* Make the container take up the full viewport height */
      margin: 0;
    }

    .menu {
      background-color: #f0f0f0;
      padding: 10px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ccc;
    }

    .logo {
      height: 100px; /* Adjust as needed */
      margin-right: 10px;
    }

    .content {
      display: flex;
      flex-grow: 1; /* Allow content to grow and fill remaining space */
    }

    .data-table {
      flex: 1;
      overflow: auto; /* Enable scrolling if content overflows */
    }

    .map {
      flex: 1;
      overflow: hidden; /* Prevent map content from overflowing */
    }
  `
})
export class AppComponent implements OnInit {
  private thingsSubject = new BehaviorSubject<Thing[]>([]);
  things$ = this.thingsSubject.asObservable();
  selectedThings: Thing[] = [];

  constructor(private thingsService: ThingsService) { }

  ngOnInit(): void {
    this.fetchThings(DEFAULT_LOCATION_SELECTION); // Fetch all things initially
  }

  onPolygonComplete(wkt: string): void {
    this.fetchThings(wkt); // Fetch filtered data based on WKT
    console.log('Polygon WKT:', wkt); // Log the WKT for debugging
  }

  onPolygonCanceled(): void {
    this.fetchThings(DEFAULT_LOCATION_SELECTION); // Fetch all things again
    console.log('Polygon canceled');
  }

  onProcessSelected(selectedThings: Thing[]): void {
    this.selectedThings = selectedThings;
  }

  private fetchThings(wkt: string): void {
    this.thingsService.getThings(wkt).subscribe((things) => {
      this.thingsSubject.next(things); // Update the BehaviorSubject with new data
    });
  }
}
