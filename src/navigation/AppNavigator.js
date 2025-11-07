import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import JokesListScreen from '../screens/JokesListScreen';
import AddEditJokeScreen from '../screens/AddEditJokeScreen';
import SetlistDetailScreen from '../screens/SetlistDetailScreen';
import AddEditSetlistScreen from '../screens/AddEditSetlistScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="JokesList" component={JokesListScreen} />
        <Stack.Screen name="AddEditJoke" component={AddEditJokeScreen} />
        <Stack.Screen name="SetlistDetail" component={SetlistDetailScreen} />
        <Stack.Screen name="AddEditSetlist" component={AddEditSetlistScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

