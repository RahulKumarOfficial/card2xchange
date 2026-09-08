import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, XCircle, Download, Key, DollarSign, Clock, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const { currentUser, users, transactions, updateUserStatus, editUserPassword, updateTransactionStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState<'transactions' | 'users'>('transactions');
  const [dateFilter, setDateFilter] = useState('');
  const [cardFilter, setCardFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  // Filter out admin from users list
  const normalUsers = users.filter(u => u.role === 'user' && (u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch)));

  const filteredTransactions = transactions.filter(t => {
    const matchDate = dateFilter ? t.date.startsWith(dateFilter) : true;
    const matchCard = cardFilter ? t.cardName === cardFilter : true;
    return matchDate && matchCard;
  });

  // Calculate totals across all transactions
  const totalCompleted = transactions.reduce((sum, t) => sum + (t.status === 'completed' ? (t.amount * (t.quantity || 1)) : 0), 0);
  const totalApproved = transactions.reduce((sum, t) => sum + (t.status === 'approved' ? (t.amount * (t.quantity || 1)) : 0), 0);
  const totalPending = transactions.reduce((sum, t) => sum + (t.status === 'pending' ? (t.amount * (t.quantity || 1)) : 0), 0);

  // Calculate counts across all transactions
  const countCompleted = transactions.reduce((sum, t) => sum + (t.status === 'completed' ? (t.quantity || 1) : 0), 0);
  const countApproved = transactions.reduce((sum, t) => sum + (t.status === 'approved' ? (t.quantity || 1) : 0), 0);
  const countPending = transactions.reduce((sum, t) => sum + (t.status === 'pending' ? (t.quantity || 1) : 0), 0);

  const handleEditPassword = (userId: string, currentPass?: string) => {
    Swal.fire({
      title: 'Edit User Password',
      input: 'text',
      inputValue: currentPass || '',
      inputLabel: 'New Password',
      showCancelButton: true,
      confirmButtonText: 'Save',
      inputValidator: (value) => {
        if (!value) return 'Password cannot be empty!';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        editUserPassword(userId, result.value);
      }
    });
  };

  const handleStatusChange = (txId: string, status: 'pending' | 'approved' | 'completed' | 'rejected') => {
    if (status === 'rejected') {
      Swal.fire({
        title: 'Reject Transaction',
        input: 'textarea',
        inputLabel: 'Reason for rejection',
        inputPlaceholder: 'e.g. Code is invalid or already redeemed',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Reject',
        inputValidator: (value) => {
          if (!value) return 'Please provide a reason for rejection!';
        }
      }).then((result) => {
        if (result.isConfirmed) {
          updateTransactionStatus(txId, 'rejected', result.value);
          Swal.fire('Rejected!', 'The transaction has been rejected.', 'success');
        }
      });
    } else {
      updateTransactionStatus(txId, status);
    }
  };

  const handleExportCSV = () => {
    // Basic CSV export
    const headers = ['ID', 'User Email', 'Card Name', 'Quantity', 'Code', 'Amount (Each)', 'Total', 'Date', 'Status'];
    const rows = filteredTransactions.map(t => {
      const user = users.find(u => u.id === t.userId);
      const qty = t.quantity || 1;
      return [
        t.id,
        user?.email || 'Unknown',
        t.cardName,
        qty,
        `"${t.code.replace(/"/g, '""')}"`, // Handle newlines and quotes in codes
        t.amount,
        t.amount * qty,
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.status
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cardxchange_report_${dateFilter || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-600">Manage users and process gift card submissions.</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Pending Payments</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Clock className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{totalPending.toFixed(2)}
            <span className="text-sm text-gray-500 font-medium ml-2">({countPending} cards)</span>
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Approved (Unpaid)</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CheckSquare className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{totalApproved.toFixed(2)}
            <span className="text-sm text-gray-500 font-medium ml-2">({countApproved} cards)</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Completed Payments</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{totalCompleted.toFixed(2)}
            <span className="text-sm text-gray-500 font-medium ml-2">({countCompleted} cards)</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`py-3 px-6 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'transactions' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          <FileText className="h-4 w-4" /> Submitted Codes
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="h-4 w-4" /> Manage Users
        </button>
      </div>

      {/* Content */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">Submitted Gift Cards</h2>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <select
                value={cardFilter}
                onChange={(e) => setCardFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white min-w-[150px]"
              >
                <option value="">All Cards</option>
                <option value="Amazon Gift Card">Amazon</option>
                <option value="Steam Wallet">Steam</option>
                <option value="Google Play Store">Google Play</option>
                <option value="App Store">App Store</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Roblox">Roblox</option>
                <option value="League of Legends">League of Legends</option>
                <option value="Overwatch">Overwatch</option>
                <option value="Sea of Thieves">Sea of Thieves</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Croma">Croma</option>
                <option value="PVR">PVR</option>
                <option value="Other Card">Other Card</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-medium border-b border-gray-200">Date</th>
                  <th className="p-4 font-medium border-b border-gray-200">User Email</th>
                  <th className="p-4 font-medium border-b border-gray-200">Card Name</th>
                  <th className="p-4 font-medium border-b border-gray-200">Code(s)</th>
                  <th className="p-4 font-medium border-b border-gray-200">Qty</th>
                  <th className="p-4 font-medium border-b border-gray-200">Amount (Total)</th>
                  <th className="p-4 font-medium border-b border-gray-200">Status</th>
                  <th className="p-4 font-medium border-b border-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">No submissions found for the selected criteria.</td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => {
                    const user = users.find(u => u.id === tx.userId);
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-900 whitespace-nowrap">{format(new Date(tx.date), 'MMM dd, yyyy')}</td>
                        <td className="p-4 text-sm text-gray-900">
                          {user?.email}
                          <br/>
                          <span className="text-xs text-blue-600 font-medium">Pay: {user?.paymentMethod || 'Not added'}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-900 font-medium">
                          {tx.cardName}
                          {tx.expiryDate && (
                            <div className="text-xs text-gray-500 font-normal mt-1">Exp: {tx.expiryDate}</div>
                          )}
                        </td>
                        <td className="p-4 text-sm font-mono text-gray-600 bg-gray-50 rounded select-all whitespace-pre-wrap">{tx.code}</td>
                        <td className="p-4 text-sm text-gray-900">{tx.quantity || 1}</td>
                        <td className="p-4 text-sm text-gray-900">
                          ₹{(tx.amount * (tx.quantity || 1)).toFixed(2)}
                          <br />
                          <span className="text-xs text-gray-500">(₹{tx.amount}/ea)</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                            tx.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select 
                            value={tx.status} 
                            onChange={(e) => handleStatusChange(tx.id, e.target.value as any)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search email or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-medium border-b border-gray-200">Name</th>
                  <th className="p-4 font-medium border-b border-gray-200">Email</th>
                  <th className="p-4 font-medium border-b border-gray-200">Phone</th>
                  <th className="p-4 font-medium border-b border-gray-200">Status</th>
                  <th className="p-4 font-medium border-b border-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {normalUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="p-4 text-sm text-gray-500">{user.email}</td>
                    <td className="p-4 text-sm text-gray-500">{user.phone}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleEditPassword(user.id, user.password)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          title="Edit Password"
                        >
                          <Key className="h-4 w-4" /> Edit Pass
                        </button>
                        
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => updateUserStatus(user.id, 'blocked')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Block
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {normalUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
