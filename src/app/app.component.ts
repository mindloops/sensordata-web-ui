import { Component, OnInit } from '@angular/core';
import { ThingsService } from './services/things.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Thing } from './services/thing.model';
import { MapComponent } from './map.component';
import {TableComponent} from './sensor-table.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MapComponent, TableComponent],
  template: `
    <div class="app-container">
      <div class="menu">
        <img src="logo.svg" alt="Logo" class="logo">
        <h1>Sensordata viewer</h1>
      </div>
      <div class="content">
        <app-data-table class="data-table" [data$]="things$"></app-data-table>
        <app-map class="map" (polygonComplete)="onPolygonComplete($event)"></app-map>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  things$!: Observable<Thing[]>;

  constructor(private thingsService: ThingsService) { }

  ngOnInit(): void {
    this.things$ = this.thingsService.getThings();
  }

  polygonData: any = null;

  onPolygonComplete(data: any): void {
    console.log('Polygon drawing completed:', data);
    this.polygonData = data;

    // Here you can perform any additional processing with the polygon data
    // For example, send it to a server, perform calculations, etc.
  }
}
