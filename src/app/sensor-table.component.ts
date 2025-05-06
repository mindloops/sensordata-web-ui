// table.component.ts
import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs';
import {Thing} from './services/thing.model';
import {MatChip} from '@angular/material/chips';

@Component({
  selector: 'app-sensor-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatChip,
  ],
  templateUrl: './sensor-table.component.html',
  styles: `
    .container {
      padding: 20px;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
    }

    .selection-summary {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .selection-summary p {
      margin: 0;
    }
  `
})
export class TableComponent implements OnInit, AfterViewInit {
  @Input() data$: Observable<Thing[]> | undefined; // Accept observable as input

  @Output() processSelected = new EventEmitter<Thing[]>();

  displayedColumns: string[] = ['select', 'name', 'observedProperties'];
  dataSource = new MatTableDataSource<Thing>([]);
  selection = new SelectionModel<Thing>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    if (this.data$) {
      this.data$.subscribe(data => {
        this.dataSource.data = data;
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row: Thing): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.name}`;
  }

  renderDetails() {
    this.processSelected.emit(this.selection.selected);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
