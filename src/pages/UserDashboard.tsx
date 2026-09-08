import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navigate } from 'react-router-dom';
import { DollarSign, CreditCard, Activity, Clock, PlusCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

export default function UserDashboard() {
  const { currentUser, transactions, addTransaction, updatePaymentMethod } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ cardName: '', code: '', amount: '', expiryDate: '', quantity: '1' });

  if (!currentUser || currentUser.role !== 'user') {
    return <Navigate to="/login" />;
  }

  const handleAddPayment = () => {
    Swal.fire({
      title: 'Add Payment Method',
      input: 'text',
      inputLabel: 'Enter UPI ID or Bank Details',
      inputPlaceholder: 'e.g. user@upi or Bank A/C...',
      showCancelButton: true,
      confirmButtonText: 'Save',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide your payment details!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updatePaymentMethod(currentUser.id, result.value);
        Swal.fire('Saved!', 'Your payment method has been saved.', 'success');
      }
    });
  };

  const userTransactions = transactions.filter(t => t.userId === currentUser.id);
  
  const totalAmount = userTransactions.reduce((sum, t) => sum + (t.status === 'completed' ? (t.amount * (t.quantity || 1)) : 0), 0);
  const pendingAmount = userTransactions.reduce((sum, t) => sum + (t.status === 'pending' ? (t.amount * (t.quantity || 1)) : 0), 0);
  const countCompleted = userTransactions.reduce((sum, t) => sum + (t.status === 'completed' ? (t.quantity || 1) : 0), 0);
  const countPending = userTransactions.reduce((sum, t) => sum + (t.status === 'pending' ? (t.quantity || 1) : 0), 0);

  // Group transactions for chart
  const chartData = useMemo(() => {
    const data = [...userTransactions]
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => ({
        date: format(new Date(t.date), 'MMM dd'),
        amount: t.amount * (t.quantity || 1)
      }));
    
    // If no data, return dummy data for empty chart
    if (data.length === 0) {
      return [
        { date: 'Mon', amount: 0 },
        { date: 'Tue', amount: 0 },
        { date: 'Wed', amount: 0 }
      ];
    }
    return data;
  }, [userTransactions]);

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardName || !newCard.code || !newCard.amount) return;
    
    const codes = newCard.code.trim();
    if (!codes) return;
    
    addTransaction({
      userId: currentUser.id,
      cardName: newCard.cardName,
      code: codes,
      amount: parseFloat(newCard.amount),
      quantity: parseInt(newCard.quantity) || 1,
      expiryDate: newCard.expiryDate || undefined
    });
    
    setNewCard({ cardName: '', code: '', amount: '', expiryDate: '', quantity: '1' });
    setShowAddForm(false);
    Swal.fire('Submitted!', `Your card(s) have been submitted successfully.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser.name}</h1>
          <p className="text-gray-600">Here is what's happening with your gift cards today.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          Sell New Card
        </button>
      </div>

      {!currentUser.paymentMethod ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-8 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-yellow-800 font-bold">Add Payment Method</h3>
            <p className="text-yellow-700 text-sm">Please add your payment method to receive payments from the admin.</p>
          </div>
          <button onClick={handleAddPayment} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 transition-colors font-medium">Add Now</button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl mb-8 flex justify-between items-center border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Your Payment Method</p>
            <p className="font-medium text-gray-900">{currentUser.paymentMethod}</p>
          </div>
          <button onClick={handleAddPayment} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">Edit</button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Gift Card Details</h2>
          <form onSubmit={handleSubmitCard} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Brand</label>
              <select 
                value={newCard.cardName}
                onChange={e => setNewCard({...newCard, cardName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Brand</option>
                <option value="Roblox">Roblox</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Overwatch">Overwatch</option>
                <option value="Amazon">Amazon</option>
                <option value="Croma">Croma</option>
                <option value="League of Legends">League of Legends</option>
                <option value="Sea of Thieves">Sea of Thieves</option>
                <option value="Flipkart">Flipkart</option>
                <option value="PVR">PVR</option>
                <option value="App Store">App Store</option>
                <option value="Google Play Store">Google Play Store</option>
                <option value="Other Card">Other Card</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
              <input 
                type="month" 
                value={newCard.expiryDate}
                onChange={e => setNewCard({...newCard, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Value (₹)</label>
              <input 
                type="number" 
                value={newCard.amount}
                onChange={e => setNewCard({...newCard, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                placeholder="100"
                min="1"
                required
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                value={newCard.quantity}
                onChange={e => setNewCard({...newCard, quantity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                min="1"
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Code(s)</label>
              <textarea 
                value={newCard.code}
                onChange={e => setNewCard({...newCard, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y" 
                placeholder="ek row me 1 card add karo value same ho"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-6 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">
                Submit Card(s)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Exchanged</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{totalAmount.toFixed(2)}
            <span className="text-sm text-gray-500 font-medium ml-2">({countCompleted} cards)</span>
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Pending Balance</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Clock className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{pendingAmount.toFixed(2)}
            <span className="text-sm text-gray-500 font-medium ml-2">({countPending} cards)</span>
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Cards Sold</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userTransactions.filter(t => t.status === 'completed').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Profit Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `₹${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value}`, 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
          </div>
          
          <div className="space-y-4">
            {userTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet.</p>
            ) : (
              userTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{tx.cardName} <span className="text-sm font-normal text-gray-500">(x{tx.quantity || 1})</span></p>
                      <p className="text-sm text-gray-500">{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{(tx.amount * (tx.quantity || 1)).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {tx.status === 'rejected' && tx.rejectionReason && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <span className="font-semibold">Reason:</span> {tx.rejectionReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
