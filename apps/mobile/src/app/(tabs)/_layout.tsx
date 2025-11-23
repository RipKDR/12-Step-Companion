/**
 * Tab Navigation Layout
 *
 * Bottom tab navigation for main app screens
 */

import { Tabs } from "expo-router";
import { Home, BookOpen, BookMarked, MapPin, MoreHorizontal, Target } from "lucide-react-native";

// Note: lucide-react-native icons may need to be replaced with react-native-vector-icons
// or expo-icons if lucide-react-native is not available

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="steps"
        options={{
          title: "Steps",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: "Meetings",
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
        }}
      />
      {/* Hide nested routes from tab bar */}
      <Tabs.Screen
        name="steps/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="journal/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="action-plans/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routines/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sponsor/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="support/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="streaks/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/_layout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="challenges/_layout"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

