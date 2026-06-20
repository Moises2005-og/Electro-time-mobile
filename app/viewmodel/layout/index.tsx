import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "@/app/view/screens/home";
import Finances from "@/app/view/screens/finances";
import Calendar from "@/app/view/screens/calendar";
import Documents from "@/app/view/screens/documents";
import Profile from "@/app/view/screens/profile";
import { COLORS } from '../constants/theme';

const Tabs = createBottomTabNavigator();

export default function Layout() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textGrey,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.borderGrey,
          backgroundColor: COLORS.white,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tabs.Screen 
        name="Home" 
        component={Home} 
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Finances" 
        component={Finances} 
        options={{
          title: "Finanças",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Calendar" 
        component={Calendar} 
        options={{
          title: "Calendário",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Documents" 
        component={Documents} 
        options={{
          title: "Documentos",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Profile" 
        component={Profile} 
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} />
          ),
        }} 
      />
    </Tabs.Navigator>
  );
}