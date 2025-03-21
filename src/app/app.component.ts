import { Component, OnInit } from '@angular/core';
import { ThingsService } from './services/things.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Thing } from './services/thing.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  template: `
    <div>
      <h1>Things</h1>
      <ul>
        <li *ngFor="let thing of things$ | async">{{ thing.name }}</li>
      </ul>
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
}
