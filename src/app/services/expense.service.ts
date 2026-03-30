import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { Expense } from '../models/expense.model';
import { DropboxNotFoundError, DropboxService } from './dropbox.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly filePath = environment.dropboxFilePath;
  private expenses$ = new BehaviorSubject<Expense[]>([]);
  private syncing$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);
  private syncInterval: any;

  readonly expenses = this.expenses$.asObservable();
  readonly syncing = this.syncing$.asObservable();
  readonly error = this.error$.asObservable();

  constructor(private dropbox: DropboxService) {}

  async init(): Promise<void> {
    await this.sync();
    this.syncInterval = setInterval(() => this.sync(), environment.syncIntervalMs);
  }

  destroy(): void {
    clearInterval(this.syncInterval);
  }

  async sync(): Promise<void> {
    this.syncing$.next(true);
    this.error$.next(null);
    try {
      const csv = await this.dropbox.readFile(this.filePath);
      const result = Papa.parse<Expense>(csv, { header: true, skipEmptyLines: true });
      const expenses = result.data.map(row => ({
        ...row,
        amount: parseFloat(row.amount as any)
      }));
      this.expenses$.next(expenses);
    } catch (err: any) {
      if (err instanceof DropboxNotFoundError) {
        // File doesn't exist yet — create it
        this.expenses$.next([]);
        await this.persist([]);
      } else {
        this.error$.next('Failed to sync with Dropbox. Check your token or connection.');
      }
    } finally {
      this.syncing$.next(false);
    }
  }

  async add(expense: Omit<Expense, 'id'>): Promise<void> {
    const current = this.expenses$.getValue();
    const updated = [...current, { ...expense, id: uuidv4() }];
    await this.persist(updated);
    this.expenses$.next(updated);
  }

  async update(expense: Expense): Promise<void> {
    const current = this.expenses$.getValue();
    const updated = current.map(e => e.id === expense.id ? expense : e);
    await this.persist(updated);
    this.expenses$.next(updated);
  }

  async remove(id: string): Promise<void> {
    const current = this.expenses$.getValue();
    const updated = current.filter(e => e.id !== id);
    await this.persist(updated);
    this.expenses$.next(updated);
  }

  private async persist(expenses: Expense[]): Promise<void> {
    const csv = Papa.unparse(expenses);
    await this.dropbox.writeFile(this.filePath, csv);
  }
}
