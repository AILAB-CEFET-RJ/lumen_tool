import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  tipoUsuario: string;
  nomeUsuario: string;
  setAuthData: Dispatch<SetStateAction<{
    isLoggedIn: boolean;
    tipoUsuario: string;
    nomeUsuario: string;
  }>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<{
    isLoggedIn: boolean;
    tipoUsuario: string;
    nomeUsuario: string;
  }>({
    isLoggedIn: false,
    tipoUsuario: '',
    nomeUsuario: '',
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('authData');
    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
    }
  }, []);

  useEffect(() => {
    if (authData.isLoggedIn) {
      localStorage.setItem('authData', JSON.stringify(authData));
    } else {
      localStorage.removeItem('authData');
    }
  }, [authData]);

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
