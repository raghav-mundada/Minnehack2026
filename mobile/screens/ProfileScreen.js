import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, ScrollView, RefreshControl } from 'react-native';
import { styles, colors } from '../styles/theme';
import { getUserGroups } from '../services/api';

export default function ProfileScreen({ userEmail, currentGroup, onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [profile, setProfile] = useState({
    username: userEmail || '',
    castle_health: 0,
    total_procrastination_minutes: 0,
    streak: 0,
    level: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      loadProfile();
    }
  }, [userEmail]);

  async function loadProfile() {
    if (!userEmail) return;

    setLoading(true);
    try {
      const data = await getUserGroups(userEmail);
      setGroups(data.groups || data || []);

      // Extract profile data if available
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  }

  if (!userEmail) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.h1}>NO USER</Text>
          <Text style={styles.body}>Join a group to create your profile</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadProfile} />
      }
    >
      {/* Profile Header */}
      <View style={styles.card}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={[
              styles.avatar,
              {
                width: 60,
                height: 60,
                marginBottom: 12,
              },
            ]}
          >
            <Text style={[styles.avatarText, { fontSize: 24 }]}>
              {(userEmail || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.h1}>{profile.username}</Text>
          <Text style={styles.muted}>{userEmail}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-around' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.h1, { color: colors.primary }]}>{profile.streak}</Text>
          <Text style={styles.muted}>STREAK</Text>
        </View>
        <View style={{ width: 3, backgroundColor: colors.border }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.h1, { color: colors.success }]}>{profile.level}</Text>
          <Text style={styles.muted}>LEVEL</Text>
        </View>
      </View>

      {/* Castle Health */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CASTLE HEALTH</Text>
        <Text style={[styles.h1, { marginTop: 8, marginBottom: 8 }]}>
          {profile.castle_health}%
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              profile.castle_health < 50 && styles.progressFillDanger,
              { width: `${profile.castle_health}%` },
            ]}
          />
        </View>
      </View>

      {/* Procrastination */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PROCRASTINATION</Text>
        <Text style={[styles.h1, { marginTop: 8, color: colors.danger }]}>
          {profile.total_procrastination_minutes}m
        </Text>
        <Text style={[styles.muted, { marginTop: 4 }]}>
          Time on distracting apps
        </Text>
      </View>

      {/* Groups */}
      {groups.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>MY GROUPS ({groups.length})</Text>
          {groups.map((group, index) => {
            const isActive = currentGroup?.group_code === (group.group_code || group.code);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.memberRow, isActive && { backgroundColor: '#f0f0f0' }]}
                onPress={() => onSelectGroup({
                  group_id: group.group_id,
                  group_code: group.group_code || group.code,
                  group_name: group.group_name || group.name
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.h3}>{group.group_name || group.name}</Text>
                  <Text style={styles.muted}>{group.group_code || group.code}</Text>
                </View>
                {isActive ? (
                  <View style={[styles.badge, { backgroundColor: colors.success }]}>
                    <Text style={styles.badgeText}>ACTIVE</Text>
                  </View>
                ) : (
                  <View style={styles.btnGhostSmall}>
                    <Text style={styles.btnGhostSmallText}>SWITCH</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Tips */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>TIPS</Text>
        <Text style={[styles.body, { marginTop: 8 }]}>
          • Upload screen time daily{'\n'}
          • Set realistic limits{'\n'}
          • Stay accountable{'\n'}
          • Focus on goals
        </Text>
      </View>
    </ScrollView>
  );
}
