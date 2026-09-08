// Pure Vanilla JavaScript Logic for Card2Xchange Static Version

const mockTransactions = [
    { id: 'TX-9823', card: 'Amazon Gift Card', amount: '$100.00', status: 'Completed', time: '2 mins ago', icon: 'fa-amazon' },
    { id: 'TX-9824', card: 'Steam Wallet', amount: '$50.00', status: 'Processing', time: '5 mins ago', icon: 'fa-steam' },
    { id: 'TX-9825', card: 'Google Play', amount: '$25.00', status: 'Completed', time: '12 mins ago', icon: 'fa-google-play' },
    { id: 'TX-9826', card: 'iTunes Card', amount: '$200.00', status: 'Rejected', time: '1 hour ago', icon: 'fa-apple' },
];

function renderTransactions() {
    const list = document.getElementById('transaction-list');
    
    if (!list) return;

    list.innerHTML = mockTransactions.map(tx => {
        let statusColor = 'text-orange-500 bg-orange-50';
        let statusDot = 'bg-orange-500';
        
        if (tx.status === 'Completed') {
            statusColor = 'text-green-600 bg-green-50';
            statusDot = 'bg-green-500';
        } else if (tx.status === 'Rejected') {
            statusColor = 'text-red-600 bg-red-50';
            statusDot = 'bg-red-500';
        }

        return `
        <div class="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-brand group-hover:text-white transition-colors flex items-center justify-center text-brand text-xl shadow-sm">
                    <i class="fa-brands ${tx.icon} fa-wallet"></i>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900">${tx.card}</h4>
                    <p class="text-sm text-slate-500 font-medium">${tx.id} &bull; ${tx.time}</p>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-slate-900 text-lg">${tx.amount}</div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${statusColor}">
                    <span class="w-1.5 h-1.5 rounded-full ${statusDot}"></span>
                    ${tx.status}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Modal logic
const modal = document.getElementById('tradeModal');
const modalContent = document.getElementById('modalContent');

function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Tiny delay to allow display block to apply before animating opacity
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
}

function closeModal() {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    
    // Wait for transition to finish before hiding completely
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

function submitTrade() {
    alert("🚀 Perfect! Ye plain HTML form ab backend APIs ya Cloudflare Workers ke sath jodne ke liye ready hai.");
    closeModal();
}

// Initialize components when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
});
