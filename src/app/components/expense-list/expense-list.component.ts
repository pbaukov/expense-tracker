import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit, OnDestroy {
  displayedColumns = ['date', 'category', 'subcategory', 'description', 'amount', 'actions'];
  dataSource = new MatTableDataSource<Expense>();
  total = 0;
  syncing = false;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  private subs = new Subscription();

  constructor(
    public expenseService: ExpenseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.expenseService.init();

    this.subs.add(this.expenseService.expenses.subscribe(expenses => {
      this.dataSource.data = expenses;
      this.total = expenses.reduce((sum, e) => sum + e.amount, 0);
    }));

    this.subs.add(this.expenseService.syncing.subscribe(s => this.syncing = s));
    this.subs.add(this.expenseService.error.subscribe(e => this.error = e));
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.expenseService.destroy();
  }

  openAdd(): void {
    const ref = this.dialog.open(ExpenseFormComponent, { width: '420px' });
    ref.afterClosed().subscribe(async result => {
      if (result) {
        await this.expenseService.add(result);
        this.snackBar.open('Витрату додано', '', { duration: 2000 });
      }
    });
  }

  openEdit(expense: Expense): void {
    const ref = this.dialog.open(ExpenseFormComponent, {
      width: '420px',
      data: { expense }
    });
    ref.afterClosed().subscribe(async result => {
      if (result) {
        await this.expenseService.update({ ...result, id: expense.id });
        this.snackBar.open('Витрату оновлено', '', { duration: 2000 });
      }
    });
  }

  async delete(expense: Expense): Promise<void> {
    await this.expenseService.remove(expense.id);
    this.snackBar.open('Витрату видалено', '', { duration: 2000 });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
