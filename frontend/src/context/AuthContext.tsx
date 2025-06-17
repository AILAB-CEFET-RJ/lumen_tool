import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  tipoUsuario: string;
  nomeUsuario: string;
  setAuthData: Dispatch<SetStateAction<{ isLoggedIn: boolean; tipoUsuario: string, nomeUsuario: string }>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<{ isLoggedIn: boolean; tipoUsuario: string; nomeUsuario: string }>({
    isLoggedIn: false,
    tipoUsuario: '',
    nomeUsuario: '',
  });

  return (
    <AuthContext.Provider value={{ ...authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};