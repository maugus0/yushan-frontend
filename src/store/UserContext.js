import React, { createContext, useState, useEffect } from 'react';
import userService from '../services/user';

export const UserContext = createContext({ username: 'Writer', avatarUrl: null });

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ username: 'Writer', avatarUrl: null });

  useEffect(() => {
    userService.getMe().then((fetchedUser) => {
      if (fetchedUser) setUser(fetchedUser);
    });
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
