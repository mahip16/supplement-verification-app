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

// Tab Navigator (contains Home, Scanner, History, Profile)
import MainTabs from './Screens/MainTabs';

// Other Screens
import FirebaseTestScreen from './Screens/FirebaseTestScreen';
import SupplementDetails from './Screens/SupplementDetailsScreen';
import FavouritesScreen from './Screens/FavouritesScreen';

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
              name='MainTabs'
              component={MainTabs}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name='Favourites'
              component={FavouritesScreen}
              options={{
              title: 'Favourites'
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
            {/* Allow guest access to Tabs */}
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ 
                title: 'Guest Mode',
                headerBackVisible: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
  );
}