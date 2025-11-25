import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    
    //useState('') returns an array with current state and function to update it
    //name is initally empty string
    //setName function updates name state variable
    /*
        User types "Fyad Mohammed" in the name input field
        → onChangeText event fires
        → setName("Fyad Mohammed") is called
        → name state variable updates to "Fyad Mohammed"
    */
    const [name, setName] = useState(''); 
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');

    // Get navigation router and auth context
    const router = useRouter();
    const { login } = useAuth();

    
    const handleRegister = () => {
        // Registration Logic Here
        if(password !== confirmPassword) {
            Alert.alert('Passwords do not match, please try again.');
            return;
        }
        if(password.length < 6) {
            Alert.alert('Password must be at least 6 characters long.');
            return;
        }
        if(!email) {
            Alert.alert('Please enter your email.');
            return;
        }
        if(!name) {
            Alert.alert('Please enter your name.');
            return;
        }
        if(!password) {
            Alert.alert('Please enter your password.');
            return;
        }
        if(!confirmPassword) {
            Alert.alert('Please confirm your password.');
            return;
        }
        console.log('Name: ', name);
        console.log('Email:', email);  
        //console.log('Password:', password);
        alert('Login attempt with Email: ' + email);
        
        // Call login function from AuthContext
        login(email);
        
        // Clear input fields after registration
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <KeyboardAvoidingView
            style = {styles.container}
            behavior={Platform.select({ios: 'padding',android:undefined})} >
            
            <View style = {styles.card}>
                <Text style={styles.title}>Register</Text>
                <Text style={styles.subtitle}> Create A new Account </Text>

                <TextInput
                    style = {styles.input} // Input field styling
                    placeholder = "Enter your name" // Placeholder text for name input
                    autoCapitalize = 'words' //Capitalizes the first letter of each word 
                    autoCorrect = {false} //Prevents auto correction
                    keyboardType = "name-phone-pad" //specifies keyboard type
                    onChangeText = {(text) => setName(text)} //updates name state variable on text change
                    value = {name}
                />
                <TextInput
                    style = {styles.input}
                    placeholder='Enter your email'
                    autoCapitalize = "none"
                    autoCorrect = {false}
                    keyboardType = "email-address"
                    onChangeText = {(text) => setEmail(text)}
                    value = {email}
                />
                <TextInput
                    style = {styles.input}
                    placeholder='Enter your password'
                    secureTextEntry = {true}
                    onChangeText={(text) => setPassword(text)}
                    value = {password}
                />

                <TextInput
                    style = {styles.input}
                    placeholder = 'Confirm your password'
                    secureTextEntry = {true}
                    onChangeText = {(text) => setConfirmPassword(text)}
                    value = {confirmPassword}
                />
                
                <Pressable style= {styles.registerButton} onPress = {handleRegister}>
                    <Text style = {styles.registerButtonText}>Register</Text>
                </Pressable>

                <View style = {styles.loginContainer}>
                    <Text style = {styles.loginText}>Already have an account?</Text>
                    <Pressable onPress={() => router.push('./login')}>
                        <Text style={styles.loginLink}> Login</Text>
                    </Pressable>
                </View>
            </View>
            
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor : '#f5f5f5',
        justifyContent: 'center',
        padding: 20,

    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color : '#111',
        marginBottom: 18,
    },
    input:{
        backgroundColor : '#fbfbfb',
        borderWidth : 1,
        borderColor : '#e6e6e6',
        borderRadius : 8,
        padding : 12,
        paddingVertical : 12,
        paddingHorizontal : 14,
        marginBottom : 12,
        fontSize : 15,
    },
    registerButton: {
        backgroundColor : '#007AFF',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 6,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 14,
    },

    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});