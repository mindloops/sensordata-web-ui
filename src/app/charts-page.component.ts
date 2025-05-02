import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import {ThingsService} from './services/things.service';
import {Thing} from './services/thing.model';
import {DatastreamObservations} from './services/observation.model';
import {EChartsOption} from 'echarts';
import {forkJoin} from 'rxjs';
import * as echarts from 'echarts/core';
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent} from 'echarts/components';
import {BarChart, LineChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';

// workaround for https://github.com/xieziyu/ngx-echarts/issues/437
echarts.use([BarChart, GridComponent, CanvasRenderer, TitleComponent, TooltipComponent, LegendComponent, LineChart]);

@Component({
  selector: 'app-charts-page',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `
    <div class="charts-container">
      <div *ngFor="let chart of charts" class="chart-wrapper">
        <h3>{{ chart.title }}</h3>
        <div echarts [options]="chart.options" class="chart"></div>
      </div>
    </div>
  `,
  providers: [
    provideEchartsCore({ echarts }),
  ],
  styles: [`
    .charts-container {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
    }
    .chart-wrapper {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .chart {
      height: 400px;
      width: 100%;
    }
    h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
  `]
})
export class ChartsPageComponent implements OnInit, OnChanges {
  @Input() selectedThings: Thing[] = [];
  charts: { title: string; options: EChartsOption }[] = [];

  constructor(private thingsService: ThingsService) {}

  ngOnInit() {
    this.loadCharts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedThings']) {
      this.loadCharts();
    }
  }

  private loadCharts() {
    if (!this.selectedThings.length) return;

    // Get all unique datastream IDs from selected things
    const datastreamIds = this.selectedThings.flatMap(thing => thing.datastreamIds);

    // Create an array of observables for each datastream
    const observables = datastreamIds.map(id =>
      this.thingsService.getObservations(id)
    );

    // Fetch all observations in parallel
    forkJoin(observables).subscribe(datastreams => {
      this.createCharts(datastreams);
    });
  }

  private createCharts(datastreams: DatastreamObservations[]) {
    // Group datastreams by observed property type
    const groupedDatastreams = this.groupDatastreamsByProperty(datastreams);

    this.charts = Object.entries(groupedDatastreams).map(([property, streams]) => ({
      title: property,
      options: this.createChartOptions(streams)
    }));
  }

  private groupDatastreamsByProperty(datastreams: DatastreamObservations[]): Record<string, DatastreamObservations[]> {
    const grouped: Record<string, DatastreamObservations[]> = {};

    this.selectedThings.forEach(thing => {
      thing.datastreamIds.forEach((id, index) => {
        const property = thing.observedProperties[index];
        if (!grouped[property]) {
          grouped[property] = [];
        }
        const datastream = datastreams.find(d => d.id === id);
        if (datastream) {
          grouped[property].push(datastream);
        }
      });
    });

    return grouped;
  }

  private createChartOptions(datastreams: DatastreamObservations[]): EChartsOption {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      legend: {
        top: 30
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          rotate: 45,
          formatter: '{HH}:{mm}'
        }
      },
      yAxis: {
        type: 'value'
      },
      series: datastreams.map(datastream => ({
        name: datastream.name,
        type: 'line',
        data: datastream.observations.map(obs => ([
          new Date(obs.time),
          obs.result
        ])),
        smooth: true
      }))
    };
  }
}
