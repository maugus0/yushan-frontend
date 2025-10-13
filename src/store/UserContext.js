import React, { createContext, useState, useEffect } from 'react';
import userService from '../services/user';

export const UserContext = createContext({
  username: 'Writer',
  avatarUrl: null,
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: 'Writer',
    avatarUrl: null,
  });

  useEffect(() => {
    userService.getMe().then((fetchedUser) => {
      if (fetchedUser) {
        console.log('Fetched user:', fetchedUser.avatarUrl);
        setUser({
          username: fetchedUser.username,
          avatarUrl: fetchedUser.avatarUrl,
        });
      }
    });
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
