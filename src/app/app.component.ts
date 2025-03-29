import { Component, OnInit } from '@angular/core';
import { ThingsService } from './services/things.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Thing } from './services/thing.model';
import { MapComponent } from './map.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MapComponent],
  template: `
    <div>
      <h1>Things</h1>
      <ul>
        <li *ngFor="let thing of things$ | async">{{ thing.name }}</li>
      </ul>
      <app-map (polygonComplete)="onPolygonComplete($event)"></app-map>
      <div *ngIf="polygonData" class="result-panel">
        <h3>Drawn Polygon Data:</h3>
        <pre>{{ polygonData | json }}</pre>
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
