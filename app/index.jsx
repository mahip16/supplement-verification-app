import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebase/FirebaseConfig';

// Auth Screens
import SplashScreen from './Screens/SplashScreen';
import WelcomeScreen from './Screens/WelcomeScreen';
import LoginScreen from './Screens/Login';
import SignUpScreen from './Screens/SignUpScreen';

// App Screens
import HomeScreen from './Screens/HomeScreen';
import HistoryScreen from './Screens/HistoryScreen';
import FirebaseTestScreen from './Screens/FirebaseTestScreen';
import ScannerScreen from './Screens/ScannerScreen';
import SupplementDetails from './Screens/SupplementDetailsScreen';
import Profile from './Screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#c9e4ffff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
      <Stack.Navigator 
        screenOptions={{
          contentStyle: { backgroundColor: '#c9e4ffff' },
        }}
      >
        {user ? (
          // User is signed in - show app screens
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                title: 'Home',
                headerBackVisible: false,
              }}
            />
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen} 
              options={{ 
                title: 'Scanner'
              }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                title: 'History'
              }}
            />
            <Stack.Screen
              name='SupplementDetails'
              component={SupplementDetails}
              options={{
                title: 'Details'
              }}
            />
            <Stack.Screen
              name='Profile'
              component={Profile}
              options={{
                title: 'Profile'
              }}
            />
            <Stack.Screen 
              name="FirebaseTestScreen" 
              component={FirebaseTestScreen} 
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // User is not signed in - show auth flow
          <>
            <Stack.Screen 
              name="Splash" 
              component={SplashScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ 
                title: 'Login',
                headerBackVisible: true,
              }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen} 
              options={{ 
                title: 'Sign Up',
                headerBackVisible: true,
              }}
            />
            {/* Allow guest access to Home */}
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                title: 'Home (Guest)',
                headerBackVisible: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
  );
}