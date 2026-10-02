import React, { useState } from 'react';
import { Employee, PayrollRecord, User } from './types';

interface DashboardProps {
  user: User;
  employees: Employee[];
  payrolls: PayrollRecord[];
  onLogout: () => void;
  onAddEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onAddPayroll: (pr: PayrollRecord) => void;
  onDeletePayroll: (id: string) => void;
  onUpdatePayrollStatus: (id: string, status: 'paid' | 'pending' | 'processing') => void;
}

type TabType = 'dashboard' | 'employees' | 'payroll' | 'reports';

const Dashboard: React.FC<DashboardProps> = ({
  user, employees, payrolls, onLogout, onAddEmployee, onDeleteEmployee, onAddPayroll, onDeletePayroll, onUpdatePayrollStatus
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddPayroll, setShowAddPayroll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // New employee form
  const [newEmp, setNewEmp] = useState({
    name: '', nationalCode: '', position: '', department: '', baseSalary: '', startDate: ''
  });

  // New payroll form
  const [newPayroll, setNewPayroll] = useState({
    employeeId: '', month: 'فروردین', year: 1403, overtime: '', bonus: '', loan: '', otherDeductions: ''
  });

  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const departments = ['فناوری اطلاعات', 'مالی', 'منابع انسانی', 'مارکتینگ', 'فروش'];

  // Stats
  const totalEmployees = employees.filter(e => e.status === 'active').length;
  const totalPayroll = payrolls.reduce((sum, p) => sum + p.netPay, 0);
  const pendingPayrolls = payrolls.filter(p => p.status === 'pending').length;
  const paidPayrolls = payrolls.filter(p => p.status === 'paid').length;

  const handleAddEmployee = () => {
    if (!newEmp.name || !newEmp.nationalCode || !newEmp.position || !newEmp.baseSalary) return;
    const emp: Employee = {
      id: Date.now().toString(),
      name: newEmp.name,
      nationalCode: newEmp.nationalCode,
      position: newEmp.position,
      department: newEmp.department,
      baseSalary: Number(newEmp.baseSalary),
      startDate: newEmp.startDate || '1403/01/01',
      status: 'active'
    };
    onAddEmployee(emp);
    setNewEmp({ name: '', nationalCode: '', position: '', department: '', baseSalary: '', startDate: '' });
    setShowAddEmployee(false);
  };

  const handleAddPayroll = () => {
    if (!newPayroll.employeeId) return;
    const emp = employees.find(e => e.id === newPayroll.employeeId);
    if (!emp) return;
    
    const overtime = Number(newPayroll.overtime) || 0;
    const bonus = Number(newPayroll.bonus) || 0;
    const loan = Number(newPayroll.loan) || 0;
    const otherDeductions = Number(newPayroll.otherDeductions) || 0;
    
    const overtimePay = Math.round(overtime * (emp.baseSalary / 192) * 1.4);
    const grossPay = emp.baseSalary + overtimePay + bonus;
    const insurance = Math.round(emp.baseSalary * 0.07);
    const tax = Math.round(grossPay * 0.09);
    const netPay = grossPay - tax - insurance - loan - otherDeductions;

    const pr: PayrollRecord = {
      id: Date.now().toString(),
      employeeId: emp.id,
      employeeName: emp.name,
      month: newPayroll.month,
      year: newPayroll.year,
      baseSalary: emp.baseSalary,
      overtime,
      overtimePay,
      bonus,
      tax,
      insurance,
      loan,
      otherDeductions,
      netPay,
      status: 'pending'
    };
    onAddPayroll(pr);
    setNewPayroll({ employeeId: '', month: 'فروردین', year: 1403, overtime: '', bonus: '', loan: '', otherDeductions: '' });
    setShowAddPayroll(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  const exportToCSV = () => {
    const filteredPayrolls = getFilteredPayrolls();
    let csv = '\uFEFF'; // BOM for UTF-8
    csv += 'نام کارمند,ماه,سال,حقوق پایه,اضافه کاری,پاداش,مالیات,بیمه,وام,سایر کسورات,خالص پرداختی,وضعیت\n';
    filteredPayrolls.forEach(p => {
      csv += `${p.employeeName},${p.month},${p.year},${p.baseSalary},${p.overtimePay},${p.bonus},${p.tax},${p.insurance},${p.loan},${p.otherDeductions},${p.netPay},${p.status === 'paid' ? 'پرداخت شده' : p.status === 'pending' ? 'در انتظار' : 'در حال پردازش'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payroll_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToDOT = () => {
    const filteredPayrolls = getFilteredPayrolls();
    let dot = 'digraph PayrollReport {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=filled, fillcolor=lightblue, fontname="Tahoma"];\n';
    dot += '  edge [color=gray];\n\n';
    dot += `  "گزارش حقوق و دستمزد" [shape=ellipse, fillcolor=gold, fontsize=16];\n\n`;
    
    filteredPayrolls.forEach(p => {
      const nodeId = `emp_${p.id}`;
      dot += `  "${nodeId}" [label="${p.employeeName}\\nخالص: ${formatNumber(p.netPay)} ریال", fillcolor="${p.status === 'paid' ? '#86efac' : p.status === 'pending' ? '#fde68a' : '#93c5fd'}"];\n`;
      dot += `  "گزارش حقوق و دستمزد" -> "${nodeId}";\n`;
    });
    
    dot += '}\n';
    
    const blob = new Blob([dot], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payroll_graph_${new Date().toISOString().split('T')[0]}.dot`;
    link.click();
  };

  const getFilteredPayrolls = () => {
    return payrolls.filter(p => {
      const matchSearch = !searchTerm || p.employeeName.includes(searchTerm);
      const matchMonth = !filterMonth || p.month === filterMonth;
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchMonth && matchStatus;
    });
  };

  const getFilteredEmployees = () => {
    return employees.filter(e => {
      return !searchTerm || e.name.includes(searchTerm) || e.position.includes(searchTerm) || e.department.includes(searchTerm);
    });
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'داشبورد', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'employees' as TabType, label: 'کارمندان', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'payroll' as TabType, label: 'حقوق و دستمزد', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'reports' as TabType, label: 'گزارشات و خروجی', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {sidebarOpen && <span className="font-bold text-sm">مدیریت حقوق و دستمزد</span>}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {sidebarOpen && <span className="text-sm">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <svg className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {sidebarOpen && <span className="text-sm">بستن منو</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'mr-64' : 'mr-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {user.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role === 'admin' ? 'مدیر سیستم' : 'مدیر مالی'}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                خروج
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">فعال</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(totalEmployees)}</p>
                  <p className="text-sm text-gray-500 mt-1">کل کارمندان</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">ریال</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(Math.round(totalPayroll / 1000000))}M</p>
                  <p className="text-sm text-gray-500 mt-1">مجموع حقوق پرداختی</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">در انتظار</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(pendingPayrolls)}</p>
                  <p className="text-sm text-gray-500 mt-1">حقوق در انتظار پرداخت</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">پرداخت شده</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(paidPayrolls)}</p>
                  <p className="text-sm text-gray-500 mt-1">فیش‌های پرداخت شده</p>
                </div>
              </div>

              {/* Recent Payrolls */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">آخرین فیش‌های حقوقی</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">نام کارمند</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">ماه</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">حقوق پایه</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">خالص پرداختی</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payrolls.slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">{p.employeeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{p.month} {p.year}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatNumber(p.baseSalary)}</td>
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">{formatNumber(p.netPay)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              p.status === 'paid' ? 'bg-green-50 text-green-600' :
                              p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {p.status === 'paid' ? 'پرداخت شده' : p.status === 'pending' ? 'در انتظار' : 'در حال پردازش'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="جستجوی کارمند..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAddEmployee(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    افزودن کارمند
                  </button>
                )}
              </div>

              {/* Add Employee Modal */}
              {showAddEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">افزودن کارمند جدید</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">نام و نام خانوادگی</label>
                        <input type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">کد ملی</label>
                        <input type="text" value={newEmp.nationalCode} onChange={e => setNewEmp({...newEmp, nationalCode: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">سمت</label>
                        <input type="text" value={newEmp.position} onChange={e => setNewEmp({...newEmp, position: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">دپارتمان</label>
                        <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="">انتخاب کنید</option>
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">حقوق پایه (ریال)</label>
                        <input type="number" value={newEmp.baseSalary} onChange={e => setNewEmp({...newEmp, baseSalary: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">تاریخ شروع</label>
                        <input type="text" placeholder="1403/01/01" value={newEmp.startDate} onChange={e => setNewEmp({...newEmp, startDate: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={handleAddEmployee} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">ثبت</button>
                      <button onClick={() => setShowAddEmployee(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">انصراف</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredEmployees().map(emp => (
                  <div key={emp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${emp.status === 'active' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' : 'bg-gray-400'}`}>
                          {emp.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.position}</p>
                        </div>
                      </div>
                      {user.role === 'admin' && (
                        <button onClick={() => onDeleteEmployee(emp.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">دپارتمان:</span>
                        <span className="text-gray-700">{emp.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">حقوق پایه:</span>
                        <span className="text-gray-700 font-medium">{formatNumber(emp.baseSalary)} ریال</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">وضعیت:</span>
                        <span className={`px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {emp.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="جستجو..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl py-2.5 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">همه ماه‌ها</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">همه وضعیت‌ها</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="pending">در انتظار</option>
                    <option value="processing">در حال پردازش</option>
                  </select>
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAddPayroll(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    ثبت فیش حقوقی
                  </button>
                )}
              </div>

              {/* Add Payroll Modal */}
              {showAddPayroll && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">ثبت فیش حقوقی جدید</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">کارمند</label>
                        <select value={newPayroll.employeeId} onChange={e => setNewPayroll({...newPayroll, employeeId: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="">انتخاب کارمند</option>
                          {employees.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">ماه</label>
                          <select value={newPayroll.month} onChange={e => setNewPayroll({...newPayroll, month: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">سال</label>
                          <input type="number" value={newPayroll.year} onChange={e => setNewPayroll({...newPayroll, year: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">ساعت اضافه کاری</label>
                          <input type="number" value={newPayroll.overtime} onChange={e => setNewPayroll({...newPayroll, overtime: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">پاداش (ریال)</label>
                          <input type="number" value={newPayroll.bonus} onChange={e => setNewPayroll({...newPayroll, bonus: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">وام (ریال)</label>
                          <input type="number" value={newPayroll.loan} onChange={e => setNewPayroll({...newPayroll, loan: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">سایر کسورات (ریال)</label>
                          <input type="number" value={newPayroll.otherDeductions} onChange={e => setNewPayroll({...newPayroll, otherDeductions: e.target.value})} className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={handleAddPayroll} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">ثبت فیش</button>
                      <button onClick={() => setShowAddPayroll(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors">انصراف</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Payroll Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">نام کارمند</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">ماه/سال</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">حقوق پایه</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">اضافه کاری</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">پاداش</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">مالیات</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">بیمه</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">خالص</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">وضعیت</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getFilteredPayrolls().map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-800 font-medium">{p.employeeName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.month} {p.year}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(p.baseSalary)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(p.overtimePay)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(p.bonus)}</td>
                          <td className="px-4 py-3 text-sm text-red-500">{formatNumber(p.tax)}</td>
                          <td className="px-4 py-3 text-sm text-red-500">{formatNumber(p.insurance)}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 font-bold">{formatNumber(p.netPay)}</td>
                          <td className="px-4 py-3">
                            <select
                              value={p.status}
                              onChange={(e) => onUpdatePayrollStatus(p.id, e.target.value as 'paid' | 'pending' | 'processing')}
                              className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${
                                p.status === 'paid' ? 'bg-green-50 text-green-600' :
                                p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-blue-50 text-blue-600'
                              }`}
                            >
                              <option value="paid">پرداخت شده</option>
                              <option value="pending">در انتظار</option>
                              <option value="processing">در حال پردازش</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {user.role === 'admin' && (
                              <button onClick={() => onDeletePayroll(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">خروجی گزارشات</h3>
                <p className="text-sm text-gray-500 mb-6">گزارش حقوق و دستمزد را در فرمت‌های مختلف دانلود کنید</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-4 p-5 bg-gradient-to-l from-green-50 to-emerald-50 border border-green-200 rounded-2xl hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">خروجی CSV</p>
                      <p className="text-xs text-gray-500">فایل اکسل (قابل باز شدن در Excel)</p>
                    </div>
                  </button>

                  <button
                    onClick={exportToDOT}
                    className="flex items-center gap-4 p-5 bg-gradient-to-l from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">خروجی DOT</p>
                      <p className="text-xs text-gray-500">فایل گراف Graphviz (قابل رندر با DOT)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Summary Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">خلاصه گزارش مالی</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 mb-1">مجموع حقوق پایه</p>
                    <p className="text-xl font-bold text-blue-800">{formatNumber(payrolls.reduce((s, p) => s + p.baseSalary, 0))} ریال</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-green-600 mb-1">مجموع پاداش‌ها</p>
                    <p className="text-xl font-bold text-green-800">{formatNumber(payrolls.reduce((s, p) => s + p.bonus, 0))} ریال</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-600 mb-1">مجموع کسورات</p>
                    <p className="text-xl font-bold text-red-800">{formatNumber(payrolls.reduce((s, p) => s + p.tax + p.insurance + p.loan + p.otherDeductions, 0))} ریال</p>
                  </div>
                </div>
              </div>

              {/* Department Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">گزارش بر اساس دپارتمان</h3>
                <div className="space-y-3">
                  {departments.map(dept => {
                    const deptEmployees = employees.filter(e => e.department === dept && e.status === 'active');
                    const deptPayroll = payrolls.filter(p => deptEmployees.some(e => e.id === p.employeeId));
                    const total = deptPayroll.reduce((s, p) => s + p.netPay, 0);
                    return (
                      <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 text-xs font-bold">{dept[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{dept}</p>
                            <p className="text-xs text-gray-500">{deptEmployees.length} کارمند</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{formatNumber(total)} ریال</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
