
'use client';

import React, { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';
import { type UserData } from '@/lib/types';

interface UserDataContextProps {
  userData: UserData;
  setUserData: Dispatch<SetStateAction<UserData>>;
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    height: undefined,
    weight: undefined,
    age: undefined,
    insulinBrand: '',
  });

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
