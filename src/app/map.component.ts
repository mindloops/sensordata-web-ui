import { Component, OnInit, AfterViewInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import { Point, Polygon } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #map class="map"></div>
      <div class="map-controls">
        <button (click)="toggleDrawMode()" class="control-button">
          {{ isDrawModeActive ? 'Cancel Drawing' : 'Draw Polygon' }}
        </button>
        <button (click)="clearDrawing()" class="control-button">Clear Drawing</button>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 500px;
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
      gap: 5px;
    }
    .control-button {
      padding: 8px 12px;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    .control-button:hover {
      background-color: #f0f0f0;
    }
  `]
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  @Output() polygonComplete = new EventEmitter<any>();

  private map!: Map;
  private pointsSource = new VectorSource();
  private drawSource = new VectorSource();
  private draw: Draw | null = null;
  isDrawModeActive = false;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initMap();
    this.addRandomPoints(20);
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
        center: fromLonLat([0, 0]),
        zoom: 2
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
    if (this.isDrawModeActive) {
      this.toggleDrawMode();
    }
  }

  private addRandomPoints(count: number): void {
    const features = [];

    for (let i = 0; i < count; i++) {
      // Generate random coordinates within a reasonable range
      const lon = Math.random() * 360 - 180;
      const lat = Math.random() * 170 - 85;

      const point = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        name: `Point ${i + 1}`
      });

      features.push(point);
    }

    this.pointsSource.addFeatures(features);

    // Create GeoJSON representation for demonstration purposes
    const geoJsonFormat = new GeoJSON();
    const geoJsonString = geoJsonFormat.writeFeatures(features);
    console.log('GeoJSON data:', geoJsonString);
  }

  private emitPolygonData(feature: Feature): void {
    const geoJsonFormat = new GeoJSON();
    const geoJson = geoJsonFormat.writeFeatureObject(feature);
    this.polygonComplete.emit(geoJson);
  }
}
