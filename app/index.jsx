// index.jsx
import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './Screens/Login';
import FirebaseTestScreen from './Screens/FirebaseTestScreen';

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ headerShown: false }}
      />
      {/* FirebaseTestScreen still here but not the initial screen */}
      <Stack.Screen 
        name="FirebaseTestScreen" 
        component={FirebaseTestScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default Home;

const styles = StyleSheet.create({});
