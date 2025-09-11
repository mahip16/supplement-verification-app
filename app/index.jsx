// index.js 
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Screens/Login';
import HomeScreen from './Screens/HomeScreen';
import HistoryScreen from './Screens/HistoryScreen';
import FirebaseTestScreen from './Screens/FirebaseTestScreen';
import ScannerScreen from './Screens/ScannerScreen';
import SupplementDetails from './Screens/SupplementDetailsScreen';
import Profile from './Screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          contentStyle: { backgroundColor: '#c9e4ffff' }, // Global background for all screens
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Home'
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
      </Stack.Navigator>
        );
}