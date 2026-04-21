import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen }     from './src/screens/HomeScreen';
import { FeedScreen }     from './src/screens/FeedScreen';
import { ActivityScreen } from './src/screens/ActivityScreen';
import { ChatScreen }     from './src/screens/ChatScreen';
import { ProfileScreen }  from './src/screens/ProfileScreen';
import { NotificationBanner } from './src/components/NotificationBanner';

import { startEngine } from './src/engine';
import { useStore }    from './src/store';
import { C }           from './src/theme';

const Tab = createBottomTabNavigator();

const NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: C.bg,
    card: C.s1,
    text: C.text,
    border: C.border,
    primary: C.accent,
    notification: C.red,
  },
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home:     { active: 'home',              inactive: 'home-outline' },
  Feed:     { active: 'videocam',          inactive: 'videocam-outline' },
  Activity: { active: 'time',              inactive: 'time-outline' },
  Chat:     { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Profile:  { active: 'people',            inactive: 'people-outline' },
};

function TabNavigator() {
  const { unreadCount } = useStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.s1,
          borderTopColor: C.border,
          borderTopWidth: 1,
          elevation: 0,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.t3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={focused ? 22 : 20}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Feed"     component={FeedScreen} />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
      />
      <Tab.Screen name="Chat"    component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    startEngine();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <NavigationContainer theme={NAV_THEME}>
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <TabNavigator />
          <NotificationBanner />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
