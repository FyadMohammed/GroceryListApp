import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    // Email and Password state variables
    const [email, setEmail] = useState(''); // currently stores email input
    const [password, setPassword] = useState(''); // currently stores password input

    // Get navigation router and auth context
    const router = useRouter();
    const { login } = useAuth();
    
    //Handler function for login button press
    const handleLogin = () => {
      if(!email) {
        Alert.alert('Please enter  your email.');
        return;
      }
      if(!password) {
        Alert.alert('Please enter your password.');
        return;
      }

      //Call login function from AuthContext
      login(email);
      
      //Clear input fields after login attempt
      setEmail('');
      setPassword('');

      console.log('Email:', email);  
      console.log('Password:', password);
      alert('Login attempt with Email: ' + email);
    }; 
    
    return (
      <KeyboardAvoidingView
      /*
        A container that moves content up when the keyboard appears
        to prevent input fields from being hidden by the keyboard.
      */
        style = {styles.container}
        behavior={Platform.select({ios: 'padding',android:undefined})}
      >
        <View style = {styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please login to your account</Text>

          <TextInput
            style = {styles.input}
            placeholder = "Enter your email"
            keyboardType = "email-address"
            autoCapitalize = "none"
            autoCorrect = {false}
            value =  {email}
            onChangeText = {setEmail}
          />

          <TextInput
            style = {styles.input}
            placeholder='Enter your password'
            secureTextEntry = {true}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          <View style = {styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('./register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>

          </View>
        </View>
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex : 1,
    backgroundColor : '#f5f5f5',
    justifyContent : 'center',
    padding : 20,
  },
  card : {
    backgroundColor : "#fff",
    borderRadius : 10,
    padding : 20, 

    shadowColor : "#000",
    shadowOpacity : 0.1, 
    shadowRadius : 10, 
    shadowOffset : { width : 0, height : 5 }, 
    elevation : 6,
  },
  title: {
    fontSize : 24, 
    fontWeight : 'bold', 
    color : '#111',
    marginBottom : 6,
  },
  subtitle: {
    fontSize : 14, 
    color : '#666',
    marginBottom : 18,
  },

  input: {
    backgroundColor : '#fbfbfb',
    borderWidth : 1,
    borderColor : '#e6e6e6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  loginButton: {
    backgroundColor : '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});