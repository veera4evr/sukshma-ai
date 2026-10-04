import React, { createContext, useContext, useState, useEffect } from "react";
import { panchayats } from "./demo/data";

export type UserRole = "farmer" | "officer" | "admin" | "panchayat_head";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  panchayatId?: string;
  gpsLat?: number;
  gpsLon?: number;
  lgdCode?: string;
}

export interface FarmerRegistration {
  name: string;
  phone: string;
  pin: string;
  panchayatId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginAsFarmer: (phone: string, pin: string) => Promise<void>;
  loginAsHead: (loginId: string, password: string) => Promise<void>;
  loginAsAdmin: (username: string, password: string) => Promise<void>;
  registerFarmer: (data: FarmerRegistration) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sukshma_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("sukshma_user");
      }
    }
    setIsLoading(false);
  }, []);

  const loginAsFarmer = async (phone: string, pin: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check localStorage for registered farmers
    const storedRaw = localStorage.getItem("sukshma_farmers");
    const storedFarmers = storedRaw ? JSON.parse(storedRaw) : [];
    const found = storedFarmers.find((f: any) => f.phone === phone && f.pin === pin);

    let mockUser: User;
    if (found) {
      mockUser = {
        id: found.id,
        name: found.name,
        role: "farmer",
        phone,
        panchayatId: found.panchayatId,
      };
    } else {
      // Fallback demo users
      if (pin !== "1234") {
        setIsLoading(false);
        throw new Error("Invalid PIN. Use 1234 for demo.");
      }
      mockUser = {
        id: "u-farmer",
        name: "Local Farmer",
        role: "farmer",
        phone,
        panchayatId: "kandiyur",
        gpsLat: 10.8162,
        gpsLon: 79.1318,
      };
    }

    setUser(mockUser);
    localStorage.setItem("sukshma_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginAsHead = async (loginId: string, password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // For demo purposes, we accept specific format or demo credentials
    if (loginId !== "TN-TNJ-110234" || password !== "110234@sukshma") {
      setIsLoading(false);
      throw new Error("Invalid Head credentials. Use TN-TNJ-110234 / 110234@sukshma");
    }

    const mockUser: User = {
      id: "u-phead",
      name: "Murugan (Head)",
      role: "panchayat_head",
      phone: loginId,
      panchayatId: "kandiyur",
      lgdCode: "110234",
    };

    setUser(mockUser);
    localStorage.setItem("sukshma_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginAsAdmin = async (username: string, password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (username !== "admin" || password !== "sukshma2026") {
      setIsLoading(false);
      throw new Error("Invalid admin credentials. Use admin / sukshma2026");
    }
    const mockUser: User = { id: "u-admin", name: "System Admin", role: "admin" };
    setUser(mockUser);
    localStorage.setItem("sukshma_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const registerFarmer = async (data: FarmerRegistration) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const storedRaw = localStorage.getItem("sukshma_farmers");
    const storedFarmers = storedRaw ? JSON.parse(storedRaw) : [];
    
    const newFarmer = {
      id: `f-${Date.now()}`,
      ...data,
      registeredOn: new Date().toISOString(),
      primaryCrop: "paddy",
    };
    
    storedFarmers.push(newFarmer);
    localStorage.setItem("sukshma_farmers", JSON.stringify(storedFarmers));
    
    const mockUser: User = {
      id: newFarmer.id,
      name: data.name,
      role: "farmer",
      phone: data.phone,
      panchayatId: data.panchayatId,
    };
    
    setUser(mockUser);
    localStorage.setItem("sukshma_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sukshma_user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, isAuthenticated: !!user, 
      loginAsFarmer, loginAsHead, loginAsAdmin, registerFarmer, 
      logout, isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


