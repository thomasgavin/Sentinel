import React, { useEffect, Component, ErrorInfo } from 'react';
import { StatusBar, View, Text, ScrollView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen }     from './src/screens/HomeScreen';
import { FeedScreen }     from './src/screens/FeedScreen';
import { ActivityScreen } from './src/screens/ActivityScreen';
import { ChatScreen }     from './src/screens/ChatScreen';
import { ProfileScreen }  from './src/screens/ProfileScreen';
import { startEngine }    from './src/engine';
import { useStore }       from './src/store';
import { getColors }      from './src/theme';

enableScreens(false);

// ── ERROR BOUNDARY ────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null };
  componentDidCatch(e: Error, info: ErrorInfo) {
    this.setState({
      error: `${e.message}\n\n${e.stack ?? ''}\n\nComponent stack:\n${info.componentStack ?? ''}`,
    });
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#080808', padding: 24 }}>
          <Text style={{ color: '#FF3357', fontSize: 15, fontWeight: '700', marginBottom: 10 }}>
            Sentinel — Runtime Error
          </Text>
          <Text style={{ color: '#cccccc', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 }}>
            {this.state.error}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home:     { active: 'home',                inactive: 'home-outline' },
  Feed:     { active: 'videocam',            inactive: 'videocam-outline' },
  Activity: { active: 'time',                inactive: 'time-outline' },
  Chat:     { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Profile:  { active: 'people',             inactive: 'people-outline' },
};

function TabNavigator() {
  const { unreadCount, isDark } = useStore();
  const col = getColors(isDark);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background:   col.bg,
      card:         col.s1,
      text:         col.text,
      border:       col.border,
      primary:      col.accent,
      notification: col.red,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: col.s1,
            borderTopColor:  col.border,
            borderTopWidth:  1,
            elevation: 0,
            height: Platform.OS === 'web' ? 52 : 56,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarActiveTintColor:   col.accent,
          tabBarInactiveTintColor: col.t3,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
          tabBarIcon: ({ focused, color }) => {
            const icons = TAB_ICONS[route.name];
            if (!icons) return null;
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
    </NavigationContainer>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────

export default function App() {
  const isDark = useStore(s => s.isDark);
  const col    = getColors(isDark);

  useEffect(() => { startEngine(); }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: col.bg }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={col.bg}
          />
          <View style={{ flex: 1, backgroundColor: col.bg }}>
            <TabNavigator />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
