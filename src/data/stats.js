export const clientStats = {
  activeDeals: 3,
  completedDeals: 12,
  amountHeld: 75000,
  amountReleased: 145000,
  recentActivity: [
    { id: 1, action: 'Payment Released', amount: 12000, date: '2023-10-25T10:00:00Z' },
    { id: 2, action: 'Escrow Funded', amount: 35000, date: '2023-10-24T14:30:00Z' },
    { id: 3, action: 'Deal Accepted', amount: 0, date: '2023-10-22T09:15:00Z' }
  ],
  monthlySpending: [
    { month: 'May', value: 15000 },
    { month: 'Jun', value: 25000 },
    { month: 'Jul', value: 10000 },
    { month: 'Aug', value: 45000 },
    { month: 'Sep', value: 30000 },
    { month: 'Oct', value: 75000 }
  ]
};

export const freelancerStats = {
  activeOrders: 4,
  completedOrders: 32,
  amountHeld: 85000,
  releasedEarnings: 420000,
  averageRating: 4.8,
  monthlyEarnings: [
    { month: 'May', value: 45000 },
    { month: 'Jun', value: 35000 },
    { month: 'Jul', value: 60000 },
    { month: 'Aug', value: 55000 },
    { month: 'Sep', value: 80000 },
    { month: 'Oct', value: 95000 }
  ],
  completedOrdersChart: [
    { month: 'May', value: 3 },
    { month: 'Jun', value: 4 },
    { month: 'Jul', value: 5 },
    { month: 'Aug', value: 4 },
    { month: 'Sep', value: 7 },
    { month: 'Oct', value: 9 }
  ]
};

export const adminStats = {
  totalUsers: 1450,
  clients: 850,
  freelancers: 600,
  activeDeals: 124,
  totalTransactionValue: 4500000,
  heldAmount: 850000,
  openDisputes: 5,
  userGrowth: [
    { month: 'May', users: 100 },
    { month: 'Jun', users: 150 },
    { month: 'Jul', users: 220 },
    { month: 'Aug', users: 350 },
    { month: 'Sep', users: 480 },
    { month: 'Oct', users: 650 }
  ],
  dealVolume: [
    { month: 'May', deals: 45 },
    { month: 'Jun', deals: 60 },
    { month: 'Jul', deals: 85 },
    { month: 'Aug', deals: 110 },
    { month: 'Sep', deals: 140 },
    { month: 'Oct', deals: 185 }
  ],
  transactionValue: [
    { month: 'May', amount: 450000 },
    { month: 'Jun', amount: 600000 },
    { month: 'Jul', amount: 850000 },
    { month: 'Aug', amount: 1100000 },
    { month: 'Sep', amount: 1400000 },
    { month: 'Oct', amount: 1850000 }
  ]
};
