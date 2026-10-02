export interface Employee {
  id: string;
  name: string;
  nationalCode: string;
  position: string;
  department: string;
  baseSalary: number;
  startDate: string;
  status: 'active' | 'inactive';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  baseSalary: number;
  overtime: number;
  overtimePay: number;
  bonus: number;
  tax: number;
  insurance: number;
  loan: number;
  otherDeductions: number;
  netPay: number;
  status: 'paid' | 'pending' | 'processing';
}

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'manager';
  name: string;
}
