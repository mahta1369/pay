import React, { useState } from 'react';
import { Employee, PayrollRecord, User } from './types';
import { initialEmployees, initialPayrolls } from './data';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(initialPayrolls);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddEmployee = (emp: Employee) => {
    setEmployees(prev => [...prev, emp]);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setPayrolls(prev => prev.filter(p => p.employeeId !== id));
  };

  const handleAddPayroll = (pr: PayrollRecord) => {
    setPayrolls(prev => [...prev, pr]);
  };

  const handleDeletePayroll = (id: string) => {
    setPayrolls(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePayrollStatus = (id: string, status: 'paid' | 'pending' | 'processing') => {
    setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      employees={employees}
      payrolls={payrolls}
      onLogout={handleLogout}
      onAddEmployee={handleAddEmployee}
      onDeleteEmployee={handleDeleteEmployee}
      onAddPayroll={handleAddPayroll}
      onDeletePayroll={handleDeletePayroll}
      onUpdatePayrollStatus={handleUpdatePayrollStatus}
    />
  );
}

export default App;
