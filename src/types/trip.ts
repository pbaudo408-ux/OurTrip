export interface Trip {
  id: string;
  name: string;
  participants: string[];
  createdAt: Date;
  pointsOfInterest: PointOfInterest[];
  expenses: Expense[];
}

export interface PointOfInterest {
  id: string;
  name: string;
  address: string;
  order: number;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface Expense {
  id: string;
  amount: number;
  paidBy: string;
  description: string;
  date: Date;
  participants: string[];
}

export interface ExpenseBalance {
  person: string;
  balance: number; // positive = owes money, negative = is owed money
}

export const calculateBalances = (expenses: Expense[], participants: string[]): ExpenseBalance[] => {
  const balances: { [key: string]: number } = {};
  
  // Initialize all participants with 0 balance
  participants.forEach(participant => {
    balances[participant] = 0;
  });

  expenses.forEach(expense => {
    const perPersonAmount = expense.amount / expense.participants.length;
    
    // Add what the payer paid
    balances[expense.paidBy] -= expense.amount;
    
    // Add what each participant owes
    expense.participants.forEach(participant => {
      balances[participant] += perPersonAmount;
    });
  });

  return Object.entries(balances).map(([person, balance]) => ({
    person,
    balance: Math.round(balance * 100) / 100 // Round to 2 decimal places
  }));
};

export const saveTripsToStorage = (trips: Trip[]) => {
  localStorage.setItem('ourtrip-trips', JSON.stringify(trips));
};

export const loadTripsFromStorage = (): Trip[] => {
  const saved = localStorage.getItem('ourtrip-trips');
  if (!saved) return [];
  
  return JSON.parse(saved).map((trip: any) => ({
    ...trip,
    createdAt: new Date(trip.createdAt),
    expenses: trip.expenses?.map((expense: any) => ({
      ...expense,
      date: new Date(expense.date)
    })) || []
  }));
};