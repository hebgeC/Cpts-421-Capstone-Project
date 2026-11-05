import { colors } from './src/theme/colors';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import EventsScreen from './src/screens/EventsScreen';
import VolunteerScreen from './src/screens/VolunteerScreen';
import ArticleScreen from './src/screens/ArticleScreen';
import PageDetailScreen from './src/screens/PageDetailScreen';
import DonationScreen from './src/screens/DonationScreen';
import WebViewScreen from './src/screens/WebViewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.warm,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 76,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: route.name === 'Donate' ? colors.donate : colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Explore') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Events') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Volunteer') iconName = focused ? 'hand-left' : 'hand-left-outline';
          else if (route.name === 'Donate') iconName = focused ? 'heart' : 'heart-outline';
          return <Icon name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Volunteer" component={VolunteerScreen} />
      <Tab.Screen name="Donate" component={DonationScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Article"
          component={ArticleScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="PageDetail"
          component={PageDetailScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="WebView"
          component={WebViewScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
