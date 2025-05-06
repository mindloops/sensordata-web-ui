import { Component, OnInit, AfterViewInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import { Point, Polygon } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Thing } from './services/thing.model';
import { Observable } from 'rxjs';
import { ThingsService } from './services/things.service';
import WKT from 'ol/format/WKT';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="map-container">
      <div #map class="map"></div>
      <div class="map-controls">
        <button mat-raised-button color="primary"
                (click)="toggleDrawMode()"
                matTooltip="{{ isDrawModeActive ? 'Cancel polygon drawing' : 'Draw a polygon to filter sensors' }}">
          <mat-icon>{{ isDrawModeActive ? 'close' : 'edit' }}</mat-icon>
          {{ isDrawModeActive ? 'Cancel Drawing' : 'Draw Polygon' }}
        </button>
        <button mat-raised-button color="warn"
                (click)="clearDrawing()"
                matTooltip="Clear the drawn polygon">
          <mat-icon>delete</mat-icon>
          Clear Drawing
        </button>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .map {
      width: 100%;
      height: 100%;
    }
    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class MapComponent implements OnInit, AfterViewInit {
  things$!: Observable<Thing[]>;

  @ViewChild('map') mapElement!: ElementRef;
  @Output() polygonComplete = new EventEmitter<string>();
  @Output() polygonCanceled = new EventEmitter<void>();

  private map!: Map;
  private pointsSource = new VectorSource();
  private drawSource = new VectorSource();
  private draw: Draw | null = null;
  isDrawModeActive = false;

  constructor(private thingsService: ThingsService) { }


  ngOnInit(): void {
    this.things$ = this.thingsService.getThings();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addPoints();
  }

  private initMap(): void {
    // Create the layers
    const osmLayer = new TileLayer({
      source: new OSM()
    });

    const pointsLayer = new VectorLayer({
      source: this.pointsSource,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'black', width: 1 })
        })
      })
    });

    const drawLayer = new VectorLayer({
      source: this.drawSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(0, 153, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#0099ff',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#0099ff'
          })
        })
      })
    });

    // Create the map
    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [osmLayer, pointsLayer, drawLayer],
      view: new View({
        center: fromLonLat([5.2, 52.1]), // Centered on the Netherlands
        zoom: 7 // Suitable zoom level for the Netherlands
      })
    });

    // Add modify interaction
    const modify = new Modify({ source: this.drawSource });
    this.map.addInteraction(modify);

    // Listen for changes to vector features
    this.drawSource.on('change', () => {
      const features = this.drawSource.getFeatures();
      if (features.length > 0) {
        // Get the polygon geometry
        const polygonFeature = features[features.length - 1];
        if (polygonFeature && polygonFeature.getGeometry()?.getType() === 'Polygon') {
          // Only emit if this is not a modification event (avoid multiple emissions)
          if (!this.isDrawModeActive) {
            this.emitPolygonData(polygonFeature);
          }
        }
      }
    });
  }

  toggleDrawMode(): void {
    if (this.isDrawModeActive) {
      this.map.removeInteraction(this.draw!);
      this.draw = null;
      this.isDrawModeActive = false;
    } else {
      this.draw = new Draw({
        source: this.drawSource,
        type: 'Polygon'
      });

      this.map.addInteraction(this.draw);
      this.isDrawModeActive = true;

      // Add snap interaction for better drawing
      const snap = new Snap({ source: this.drawSource });
      this.map.addInteraction(snap);

      // Listen for drawend event
      this.draw.on('drawend', (event) => {
        this.isDrawModeActive = false;
        this.map.removeInteraction(this.draw!);
        this.draw = null;
        this.emitPolygonData(event.feature);
      });
    }
  }

  clearDrawing(): void {
    this.drawSource.clear();
    this.polygonCanceled.emit();
    if (this.isDrawModeActive) {
      this.toggleDrawMode();
    }
  }

  private addPoints(): void {
    this.things$.subscribe(things => {
      things.forEach(thing => {
        const lon = thing.location.lon;
        const lat = thing.location.lat;

        const point = new Feature({
          geometry: new Point(fromLonLat([lon, lat])),
          name: thing.name
        });

        this.pointsSource.addFeature(point);
      });
    });
  }

  private emitPolygonData(feature: Feature): void {
    const wktFormat = new WKT();
    const wkt = wktFormat.writeFeatures([feature], {
      dataProjection: 'EPSG:4326',     // projection for the output data
      featureProjection: 'EPSG:3857'   // projection currently used by features
    });;
    this.polygonComplete.emit(wkt); // Emit the formatted WKT string
  }

}
