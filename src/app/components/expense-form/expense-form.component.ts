import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CATEGORIES, Expense } from '../../models/expense.model';

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
  categoryNames = Object.keys(CATEGORIES);
  subcategories: string[] = [];
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: ExpenseFormData
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.expense;
    const initial = this.data?.expense;

    this.form = this.fb.group({
      date: [initial?.date ?? new Date().toISOString().split('T')[0], Validators.required],
      category: [initial?.category ?? '', Validators.required],
      subcategory: [initial?.subcategory ?? ''],
      amount: [initial?.amount ?? '', [Validators.required, Validators.min(0.01)]],
      description: [initial?.description ?? '']
    });

    // Populate subcategories if editing
    if (initial?.category) {
      this.subcategories = CATEGORIES[initial.category] ?? [];
    }

    // React to category changes
    this.form.get('category')!.valueChanges.subscribe(cat => {
      this.subcategories = CATEGORIES[cat] ?? [];
      this.form.get('subcategory')!.setValue('');
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
