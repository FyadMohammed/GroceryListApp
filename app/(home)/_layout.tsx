import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        //Stack navigator for home screens
        //includes Home screen
        //headerShown: false to hide default header
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Grocery List',
                    headerShown: false,
                }} />
        </Stack>    
    );
};