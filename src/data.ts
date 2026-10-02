import { Employee, PayrollRecord, User } from './types';

export const users: User[] = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'مدیر سیستم' },
  { username: 'manager', password: 'manager123', role: 'manager', name: 'مدیر مالی' },
];

export const initialEmployees: Employee[] = [
  { id: '1', name: 'علی محمدی', nationalCode: '0012345678', position: 'مهندس نرم‌افزار', department: 'فناوری اطلاعات', baseSalary: 45000000, startDate: '1400/03/15', status: 'active' },
  { id: '2', name: 'فاطمه احمدی', nationalCode: '0023456789', position: 'حسابدار ارشد', department: 'مالی', baseSalary: 38000000, startDate: '1399/06/01', status: 'active' },
  { id: '3', name: 'محمد رضایی', nationalCode: '0034567890', position: 'مدیر پروژه', department: 'فناوری اطلاعات', baseSalary: 52000000, startDate: '1398/01/10', status: 'active' },
  { id: '4', name: 'زهرا حسینی', nationalCode: '0045678901', position: 'کارشناس منابع انسانی', department: 'منابع انسانی', baseSalary: 32000000, startDate: '1401/09/20', status: 'active' },
  { id: '5', name: 'رضا کریمی', nationalCode: '0056789012', position: 'طراح گرافیک', department: 'مارکتینگ', baseSalary: 28000000, startDate: '1402/02/05', status: 'active' },
  { id: '6', name: 'مریم نوری', nationalCode: '0067890123', position: 'کارشناس فروش', department: 'فروش', baseSalary: 30000000, startDate: '1400/11/12', status: 'inactive' },
  { id: '7', name: 'حسن عباسی', nationalCode: '0078901234', position: 'توسعه‌دهنده بک‌اند', department: 'فناوری اطلاعات', baseSalary: 42000000, startDate: '1401/04/08', status: 'active' },
  { id: '8', name: 'سارا موسوی', nationalCode: '0089012345', position: 'کارشناس بازاریابی', department: 'مارکتینگ', baseSalary: 35000000, startDate: '1400/07/22', status: 'active' },
];

export const initialPayrolls: PayrollRecord[] = [
  { id: '1', employeeId: '1', employeeName: 'علی محمدی', month: 'فروردین', year: 1403, baseSalary: 45000000, overtime: 20, overtimePay: 8000000, bonus: 5000000, tax: 4500000, insurance: 3375000, loan: 2000000, otherDeductions: 0, netPay: 48125000, status: 'paid' },
  { id: '2', employeeId: '2', employeeName: 'فاطمه احمدی', month: 'فروردین', year: 1403, baseSalary: 38000000, overtime: 10, overtimePay: 3500000, bonus: 3000000, tax: 3500000, insurance: 2850000, loan: 1500000, otherDeductions: 0, netPay: 36650000, status: 'paid' },
  { id: '3', employeeId: '3', employeeName: 'محمد رضایی', month: 'فروردین', year: 1403, baseSalary: 52000000, overtime: 15, overtimePay: 6500000, bonus: 8000000, tax: 5800000, insurance: 3900000, loan: 3000000, otherDeductions: 0, netPay: 53800000, status: 'paid' },
  { id: '4', employeeId: '4', employeeName: 'زهرا حسینی', month: 'فروردین', year: 1403, baseSalary: 32000000, overtime: 5, overtimePay: 1500000, bonus: 2000000, tax: 2800000, insurance: 2400000, loan: 0, otherDeductions: 0, netPay: 30300000, status: 'pending' },
  { id: '5', employeeId: '5', employeeName: 'رضا کریمی', month: 'فروردین', year: 1403, baseSalary: 28000000, overtime: 8, overtimePay: 2000000, bonus: 1000000, tax: 2400000, insurance: 2100000, loan: 1000000, otherDeductions: 0, netPay: 25500000, status: 'processing' },
  { id: '6', employeeId: '1', employeeName: 'علی محمدی', month: 'اردیبهشت', year: 1403, baseSalary: 45000000, overtime: 25, overtimePay: 10000000, bonus: 5000000, tax: 4800000, insurance: 3375000, loan: 2000000, otherDeductions: 0, netPay: 49825000, status: 'pending' },
  { id: '7', employeeId: '7', employeeName: 'حسن عباسی', month: 'فروردین', year: 1403, baseSalary: 42000000, overtime: 12, overtimePay: 4500000, bonus: 3000000, tax: 4000000, insurance: 3150000, loan: 0, otherDeductions: 0, netPay: 42350000, status: 'paid' },
  { id: '8', employeeId: '8', employeeName: 'سارا موسوی', month: 'فروردین', year: 1403, baseSalary: 35000000, overtime: 6, overtimePay: 1800000, bonus: 2500000, tax: 3200000, insurance: 2625000, loan: 1500000, otherDeductions: 0, netPay: 32075000, status: 'paid' },
];
