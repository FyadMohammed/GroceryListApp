import React, { createContext, useContext, useState } from 'react';


//Defining what auth context will provide
//isLoggedIn: boolean to track login status
//userEmail: string or null to store logged in user's email
//login: function that takes email string and logs in user
//logout: function that logs out user
type AuthContextType = {
    isLoggedIn: boolean;
    userEmail: string | null;
    login: (email: string) => void;
    logout: ()  => void;
}

//Creating auth context with default value undefined
const AuthContext = createContext<AuthContextType | undefined> (undefined);

//Create provider component to wrap app and provide auth state
//AuthProvider takes children prop of the type React.ReactNode
export function AuthProvider({ children}: { children: React.ReactNode}) {
    //State variables to track login status and user email
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null> (null);

    //Handler functions to login and logout
    //Sets isLoggedIn and userEmail states variables accordingly
    const login = (email: string) => {
        setIsLoggedIn(true);
        setUserEmail(email);
    };
    const logout = () => {
        setIsLoggedIn(false);
        setUserEmail(null);
    };

    return(
        //State variables : isLoggedIn , userEmail
        //Handler functions : login, logout
        <AuthContext.Provider value = {{isLoggedIn,userEmail,login,logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if ( !context ) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context
};