// frontend/src/types/user.ts
export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  }