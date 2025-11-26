import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebaseConfig';

//Defining what auth context will provide
//isLoggedIn: boolean to track login status
//userEmail: string or null to store logged in user's email
//login: function that takes email and password, signs in with Firebase
//register: function that takes email and password, creates new user
//logout: function that signs out user from Firebase
type AuthContextType = {
    isLoggedIn: boolean;
    userEmail: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

//Creating auth context with default value undefined
const AuthContext = createContext<AuthContextType | undefined> (undefined);

//Create provider component to wrap app and provide auth state
//AuthProvider takes children prop of the type React.ReactNode
export function AuthProvider({ children}: { children: React.ReactNode}) {
    //State variables to track login status and user email
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null> (null);

    //useEffect hook to listen to Firebase authentication state changes
    //onAuthStateChanged fires whenever user logs in/out
    //This keeps the app's auth state in sync with Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                //User is logged in, update state
                setIsLoggedIn(true);
                setUserEmail(user.email || null);
            } else {
                //User is logged out, clear state
                setIsLoggedIn(false);
                setUserEmail(null);
            }
        });

        //Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    //Handler function to register new user with email and password
    //createUserWithEmailAndPassword is Firebase function that creates new user
    const register = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            //Firebase automatically logs in user after creation, state will update via onAuthStateChanged listener
        } catch (error) {
            throw error;
        }
    };

    //Handler function to login user with email and password
    //signInWithEmailAndPassword is Firebase function that signs in existing user
    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            //Firebase updates user state, which triggers onAuthStateChanged listener
        } catch (error) {
            throw error;
        }
    };

    //Handler function to logout user
    //signOut is Firebase function that signs out current user
    const logout = async () => {
        try {
            await signOut(auth);
            //Firebase clears user state, which triggers onAuthStateChanged listener to update our state
        } catch (error) {
            throw error;
        }
    };

    return(
        //State variables : isLoggedIn , userEmail
        //Handler functions : login, register, logout
        <AuthContext.Provider value = {{isLoggedIn,userEmail,login,register,logout}}>
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