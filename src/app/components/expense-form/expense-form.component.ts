import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Expense, EXPENSE_CATEGORIES } from '../../models/expense.model';

export interface ExpenseFormData {
  expense?: Expense;
}

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  form!: FormGroup;
  categories = EXPENSE_CATEGORIES;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ExpenseFormData
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.expense;
    this.form = this.fb.group({
      date: [this.data?.expense?.date ?? new Date().toISOString().split('T')[0], Validators.required],
      amount: [this.data?.expense?.amount ?? '', [Validators.required, Validators.min(0.01)]],
      category: [this.data?.expense?.category ?? '', Validators.required],
      description: [this.data?.expense?.description ?? '', Validators.required]
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
