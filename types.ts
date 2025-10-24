export interface UserData {
  uid: string;
  name: string;
  email: string;
  walletAddress: string;
  points: number;
  referrals: number;
  role?: 'admin' | 'user';
  status?: 'active' | 'blocked';
  referredBy?: string;
}

export interface Ad {
  id: string;
  title: string;
  reward: number;
  duration: number;
  url: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail?: string; // For display in admin panel
  userName?: string; // For display in admin panel
  amount: number;
  walletAddress: string;
  date: string;
  status: 'pending' | 'completed' | 'rejected';
}
