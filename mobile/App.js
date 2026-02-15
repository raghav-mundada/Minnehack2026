import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles, colors } from './styles/theme';
import GroupsScreen from './screens/GroupsScreen';
import ProfileScreen from './screens/ProfileScreen';

import JoinGroupScreen from './screens/JoinGroupScreen';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('groups');
  const [userEmail, setUserEmail] = useState('');
  const [currentGroup, setCurrentGroup] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const group = await AsyncStorage.getItem('currentGroup');
      if (email) setUserEmail(email);
      if (group) setCurrentGroup(JSON.parse(group));
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }

  async function handleSwitchGroup(groupData) {
    try {
      await AsyncStorage.setItem('currentGroup', JSON.stringify(groupData));
      setCurrentGroup(groupData);
      setCurrentScreen('groups');
    } catch (e) {
      console.error('Error switching group:', e);
    }
  }

  async function handleJoinGroup(email, groupData) {
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('currentGroup', JSON.stringify(groupData));
      setUserEmail(email);
      setCurrentGroup(groupData);
      setCurrentScreen('groups');
    } catch (e) {
      console.error('Error saving group data:', e);
    }
  }

  function renderScreen() {
    switch (currentScreen) {
      case 'groups':
        return <GroupsScreen userEmail={userEmail} currentGroup={currentGroup} />;
      case 'profile':
        return (
          <ProfileScreen
            userEmail={userEmail}
            currentGroup={currentGroup}
            onSelectGroup={handleSwitchGroup}
          />
        );
      case 'join':
        return <JoinGroupScreen onJoinSuccess={handleJoinGroup} />;
      default:
        return <GroupsScreen userEmail={userEmail} currentGroup={currentGroup} />;
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.logo}>🏰</Text>
          <View>
            <Text style={styles.kicker}>MENDING &gt; ENDING</Text>
            <Text style={styles.brandTitle}>BRAINROT DEFENDER</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'groups' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('groups')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'groups' && styles.navButtonTextActive]}>
            GROUPS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'profile' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('profile')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'profile' && styles.navButtonTextActive]}>
            PROFILE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'join' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('join')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'join' && styles.navButtonTextActive]}>
            JOIN
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
