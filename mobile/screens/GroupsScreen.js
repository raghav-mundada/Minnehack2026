import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { styles, colors } from '../styles/theme';
import { getGroupStatus, getLeaderboard, getGroup } from '../services/api';

export default function GroupsScreen({ userEmail, currentGroup }) {
  const [castleHealth, setCastleHealth] = useState(100);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentGroup) {
      loadGroupData();
    }
  }, [currentGroup]);

  async function loadGroupData() {
    if (!currentGroup?.group_code) return;

    setLoading(true);
    setError('');
    try {
      let group_id = currentGroup.group_id;

      // Fallback: if we don't have the 15-char ID, fetch it using the code
      if (!group_id) {
        const groupInfo = await getGroup(currentGroup.group_code);
        group_id = groupInfo.group_id;
      }

      if (!group_id) throw new Error('Could not resolve Group ID');

      // Get group status (includes health_percent) using the 15-char ID
      const status = await getGroupStatus(group_id);
      setCastleHealth(status.health_percent || 100);

      // Use members from status response if available
      if (status.members && status.members.length > 0) {
        setMembers(status.members);
      } else {
        // Fallback to global leaderboard endpoint
        const leaderboard = await getLeaderboard();
        setMembers(leaderboard.members || leaderboard || []);
      }
    } catch (e) {
      console.error('Error loading group data:', e);
      setError(e.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  }

  function getCastleEmoji() {
    if (castleHealth > 75) return '🏰';
    if (castleHealth > 50) return '🏚️';
    if (castleHealth > 25) return '🧱';
    return '💀';
  }

  function getZombieCount() {
    return Math.max(0, Math.floor((100 - castleHealth) / 25));
  }

  if (!currentGroup) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.h1}>BRAINROT DEFENDER</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            Join or create a group to start defending against procrastination zombies.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GET STARTED</Text>
          <Text style={styles.muted}>Tap "JOIN" below</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadGroupData} />
      }
    >
      {error ? (
        <View style={[styles.alert, styles.alertError]}>
          <Text style={styles.alertText}>{error}</Text>
        </View>
      ) : null}

      {/* Castle Health */}
      <View style={styles.castleContainer}>
        <Text style={styles.castleEmoji}>{getCastleEmoji()}</Text>
        <Text style={styles.h1}>{castleHealth}%</Text>

        <View style={[styles.progressBar, { width: '100%', marginTop: 12 }]}>
          <View
            style={[
              styles.progressFill,
              castleHealth < 50 && styles.progressFillDanger,
              { width: `${castleHealth}%` },
            ]}
          />
        </View>

        {getZombieCount() > 0 && (
          <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[...Array(getZombieCount())].map((_, i) => (
              <Text key={i} style={{ fontSize: 28, marginHorizontal: 4 }}>
                🧟
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Group Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{currentGroup.group_name || 'MY GROUP'}</Text>
        <Text style={styles.muted}>CODE: {currentGroup.group_code}</Text>
      </View>

      {castleHealth === 0 && (
        <View style={[styles.card, { backgroundColor: '#ffebee', borderColor: colors.danger }]}>
          <Text style={[styles.cardTitle, { color: colors.danger }]}>
            CASTLE DESTROYED
          </Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>
            Reduce procrastination to rebuild
          </Text>
        </View>
      )}

      {/* Members */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SQUAD ({members.length})</Text>

        {members.length > 0 ? (
          members.map((member, index) => {
            const initial = (member.email || member.name || '?')[0].toUpperCase();
            const isYou = member.email === userEmail;
            return (
              <View key={index} style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.h3}>{member.email || member.name}</Text>
                  <Text style={styles.muted}>
                    {member.total_minutes ? `${member.total_minutes}m` : `Score: ${member.score || 0}`}
                  </Text>
                </View>
                {isYou && (
                  <Text style={[styles.tiny, { color: colors.primary }]}>YOU</Text>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.muted}>No members yet</Text>
        )}
      </View>
    </ScrollView>
  );
}
