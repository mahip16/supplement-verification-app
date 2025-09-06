import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack'

import Login from './app/Login'

const Stack= createNativeStackNavigator();

const Home = () => {
  return (
   <NavigationContainer>
        <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name='Login' component={Login} options={() => ({ headerShown: false })} 
/>
        </Stack.Navigator>
   </NavigationContainer>
  )
}

export default Home

const styles = StyleSheet.create({})