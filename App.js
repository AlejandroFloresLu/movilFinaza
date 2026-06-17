import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import CuentasScreen from './src/screens/CuentasScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reportes') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Cuentas') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: '#FFFFFF'
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} />
      <Tab.Screen name="Reportes" component={ReportsScreen} />
      <Tab.Screen name="Cuentas" component={CuentasScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* We name the Tab Navigator "Dashboard" so LoginScreen.js still works without changes */}
          <Stack.Screen name="Dashboard" component={MainTabs} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ headerShown: true, title: 'Registrar Movimiento' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
