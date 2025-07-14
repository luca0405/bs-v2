import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { InsertUser, User } from "@shared/schema";
import { apiRequest, getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define simplified type for login data
type LoginData = {
  username: string;
  password: string;
};

// Define a simpler AuthContext type that doesn't rely on complex generics
export type AuthContextType = {
  user: any | null;
  isLoading: boolean;
  error: Error | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  isLoginPending: boolean;
  isRegisterPending: boolean;
  isLogoutPending: boolean;
  loginMutation: {
    mutate: (data: LoginData) => void;
    mutateAsync: (data: LoginData) => Promise<any>;
    isPending: boolean;
  };
  registerMutation: {
    mutate: (data: InsertUser) => void;
    mutateAsync: (data: InsertUser) => Promise<any>;
    isPending: boolean;
  };
};

// Create a default context with minimal implementation
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isLoginPending: false,
  isRegisterPending: false,
  isLogoutPending: false,
  loginMutation: {
    mutate: () => {},
    mutateAsync: async () => ({}),
    isPending: false,
  },
  registerMutation: {
    mutate: () => {},
    mutateAsync: async () => ({}),
    isPending: false,
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutationObj = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/user"], userData);
      // Scroll to top after successful login
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: Error) => {
      let title = "Sign In Failed";
      let description = "Please check your credentials and try again";

      // Handle specific error cases
      if (error.message.includes("Invalid credentials")) {
        title = "Invalid Username or Password";
        description = "Please check your username and password are correct";
      } else if (error.message.includes("Network")) {
        title = "Connection Error";
        description = "Please check your internet connection and try again";
      } else if (error.message.includes("Server")) {
        title = "Server Error";
        description = "Our servers are temporarily unavailable. Please try again later";
      } else if (error.message.includes("Unauthorized")) {
        title = "Account Access Denied";
        description = "Your account may be inactive. Please contact support";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutationObj = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      let title = "Registration Failed";
      let description = "Unable to create your account. Please try again";

      // Handle specific error cases
      if (error.message.includes("Username already exists") || error.message.includes("already taken")) {
        title = "Username Not Available";
        description = "This username is already taken. Please choose a different one";
      } else if (error.message.includes("Email already exists") || error.message.includes("email")) {
        title = "Email Already Registered";
        description = "An account with this email already exists. Try signing in instead";
      } else if (error.message.includes("Password")) {
        title = "Password Requirements";
        description = "Please ensure your password meets the security requirements";
      } else if (error.message.includes("Payment") || error.message.includes("Purchase")) {
        title = "Payment Processing Error";
        description = "Unable to process your premium membership payment. Please try again";
      } else if (error.message.includes("Network")) {
        title = "Connection Error";
        description = "Please check your internet connection and try again";
      } else if (error.message.includes("Server")) {
        title = "Server Error";
        description = "Our servers are temporarily unavailable. Please try again later";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutationObj = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Simplified interface for authentication actions
  const login = async (credentials: LoginData) => {
    await loginMutationObj.mutateAsync(credentials);
  };

  const register = async (userData: InsertUser) => {
    await registerMutationObj.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutationObj.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        login,
        register,
        logout,
        isLoginPending: loginMutationObj.isPending,
        isRegisterPending: registerMutationObj.isPending,
        isLogoutPending: logoutMutationObj.isPending,
        loginMutation: {
          mutate: loginMutationObj.mutate,
          mutateAsync: loginMutationObj.mutateAsync,
          isPending: loginMutationObj.isPending,
        },
        registerMutation: {
          mutate: registerMutationObj.mutate,
          mutateAsync: registerMutationObj.mutateAsync,
          isPending: registerMutationObj.isPending,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // Force cache refresh: v1.0.2
  return context;
}
