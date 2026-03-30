export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  subcategory: string;
  description: string;
}

export const CATEGORIES: Record<string, string[]> = {
  'Їжа': ['Продукти', 'Вихідна їжа', "Кав'ярні", 'Твікс'],
  'Таксі + Бенз': ['Таксі', 'Бензин'],
  'Одяг та взуття': ['Одяг', 'Взуття'],
  'Must have': ['Комуналка', 'Підписки', "Зв'язок"],
  'Хімія, etc.': [],
  'Донати': [],
  "Здоров'я": ['Психологи', 'Ліки', 'Спортзал'],
  'Розваги': ['Квитки', 'Коктейлі'],
  'Інше': [],
};
