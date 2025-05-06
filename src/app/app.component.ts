import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ThingsService } from './services/things.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_LOCATION_SELECTION, Thing } from './services/thing.model';
import { MapComponent } from './map.component';
import { TableComponent } from './sensor-table.component';
import { ChartsComponent } from './charts.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MapComponent,
    TableComponent,
    ChartsComponent,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  template: `
    <div class="app-container">
      <!-- Toolbar -->
      <mat-toolbar class="app-toolbar">
        <img src="logo.svg" alt="Logo" class="logo">
        <span class="title">Sensordata Viewer</span>
      </mat-toolbar>

      <div class="scrollable-content">
        <!-- Main Content Area (Fills Viewport) -->
        <div class="content-container">
          <div class="data-panel mat-elevation-z2">
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title class="card-title">Sensors</mat-card-title>
              </mat-card-header>
              <mat-divider></mat-divider>
              <mat-card-content>
                <app-sensor-table
                  [data$]="things$"
                  (processSelected)="onProcessSelected($event)">
                </app-sensor-table>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="map-panel mat-elevation-z2">
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title class="card-title">Sensor map</mat-card-title>
              </mat-card-header>
              <mat-divider></mat-divider>
              <mat-card-content>
                <app-map
                  (polygonComplete)="onPolygonComplete($event)"
                  (polygonCanceled)="onPolygonCanceled()">
                </app-map>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Charts Section (Scrolls into view) -->
        <div *ngIf="selectedThings.length > 0" class="charts-panel mat-elevation-z2" #chartsSection>
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title class="card-title">
                Measurements
              </mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            <mat-card-content>
              <app-charts-page
                [selectedThings]="selectedThings">
              </app-charts-page>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .app-toolbar {
      flex-shrink: 0;
      z-index: 10;
      background-color: white;
      color: rgba(0, 0, 0, 0.87);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .logo {
      height: 50px;
      margin-right: 16px;
    }

    .title {
      font-size: 20px;
      font-weight: 500;
    }

    .content-container {
      display: flex;
      height: calc(100vh - 64px); /* Full viewport minus toolbar height */
      padding: 16px;
      gap: 16px;
      box-sizing: border-box;
    }

    .data-panel {
      flex: 1;
      min-width: 40%;
      display: flex;
      flex-direction: column;
    }

    .map-panel {
      flex: 1;
      min-width: 40%;
      display: flex;
      flex-direction: column;
    }

    .charts-panel {
      padding: 0 16px 16px 16px;
      margin-top: 16px;
      min-height: 500px;
    }

    mat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-content {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    mat-card-header {
      padding: 12px 16px 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 500;
    }

    .back-to-map-btn {
      margin-left: auto;
    }

    @media (max-height: 800px) {
      .content-container {
        height: calc(100vh - 64px);
      }
    }
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  private thingsSubject = new BehaviorSubject<Thing[]>([]);
  things$ = this.thingsSubject.asObservable();
  selectedThings: Thing[] = [];

  @ViewChild('chartsSection') chartsSection?: ElementRef;

  constructor(private thingsService: ThingsService) { }

  ngOnInit(): void {
    this.fetchThings(DEFAULT_LOCATION_SELECTION); // Fetch all things initially
  }

  ngAfterViewInit(): void {
    // Initial check for selected things
    if (this.selectedThings.length > 0) {
      this.scrollToCharts();
    }
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

    // Wait for DOM to update, then scroll to charts
    setTimeout(() => {
      this.scrollToCharts();
    }, 100);
  }

  scrollToCharts(): void {
    if (this.chartsSection) {
      this.chartsSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  private fetchThings(wkt: string): void {
    this.thingsService.getThings(wkt).subscribe((things) => {
      this.thingsSubject.next(things); // Update the BehaviorSubject with new data
    });
  }
}
