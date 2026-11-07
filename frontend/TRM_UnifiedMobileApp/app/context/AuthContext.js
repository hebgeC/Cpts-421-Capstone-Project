//
//  AuthContext.js
//  
//
//  Created by ethan frazier on 4/5/26.
//  Modified by Connor Chase on 4/8/26.

import React, { createContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);

	return (
		<AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthContext;