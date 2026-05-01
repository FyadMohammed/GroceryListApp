import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function RootLayout() {
    const { isLoggedIn } = useAuth();
    console.log('RootLayout rendering, isLoggedIn:', isLoggedIn);
    return (
        //gets the user to the auth stack if not logged in, else to the home stack
        <Stack>
            {!isLoggedIn ? (
                <Stack.Screen name="(auth)" options ={{ headerShown: false}}/>
            ): (
                <Stack.Screen name="(home)" options ={{ headerShown: false}}/>
            )}
        </Stack>
    );
}

export default function Layout() {
    //wraps the app with AuthProvider to provide authentication context
    return (
        <AuthProvider>
            <RootLayout />
        </AuthProvider>
    );
};

