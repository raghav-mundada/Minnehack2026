import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { styles, colors } from '../styles/theme';
import { joinGroup, createGroup } from '../services/api';

export default function JoinGroupScreen({ onJoinSuccess }) {
  const [email, setEmail] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [mode, setMode] = useState('join');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  function showMessage(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  }

  async function handleJoinGroup() {
    const trimmedEmail = email.trim();
    const trimmedCode = groupCode.trim().toUpperCase();

    if (!trimmedEmail || !trimmedCode) {
      Alert.alert('Error', 'Enter email and group code');
      return;
    }

    setLoading(true);
    try {
      const data = await joinGroup(trimmedEmail, trimmedCode);
      showMessage('JOINED!', 'success');

      setTimeout(() => {
        onJoinSuccess(trimmedEmail, {
          group_id: data.group_id, // Store Supabase 15-char ID
          group_code: trimmedCode,
          group_name: data.group_name || 'My Group',
          daily_limit_minutes: data.daily_limit_minutes || 300,
        });
      }, 1000);
    } catch (error) {
      console.error('Join error:', error);
      showMessage(error.message || 'Failed to join', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup() {
    const trimmedEmail = email.trim();
    const trimmedName = groupName.trim();

    if (!trimmedEmail || !trimmedName) {
      Alert.alert('Error', 'Enter email and group name');
      return;
    }

    setLoading(true);
    try {
      const data = await createGroup(trimmedEmail, trimmedName);
      showMessage(`CODE: ${data.group_code}`, 'success');

      setTimeout(() => {
        onJoinSuccess(trimmedEmail, {
          group_id: data.group_id, // Store Supabase 15-char ID
          group_code: data.group_code,
          group_name: trimmedName,
          daily_limit_minutes: data.daily_limit_minutes || 300,
        });
      }, 1500);
    } catch (error) {
      console.error('Create error:', error);
      showMessage(error.message || 'Failed to create', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {message.text ? (
          <View
            style={[
              styles.alert,
              message.type === 'success' ? styles.alertSuccess : styles.alertError,
            ]}
          >
            <Text style={styles.alertText}>{message.text}</Text>
          </View>
        ) : null}

        {/* Mode Toggle */}
        <View style={[styles.card, { flexDirection: 'row', padding: 8 }]}>
          <TouchableOpacity
            style={[
              styles.btn,
              mode === 'join' ? null : styles.btnOutline,
              { flex: 1, marginRight: 4, marginBottom: 0 },
            ]}
            onPress={() => setMode('join')}
          >
            <Text
              style={[
                styles.btnText,
                mode === 'join' ? null : styles.btnOutlineText,
              ]}
            >
              JOIN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btn,
              mode === 'create' ? null : styles.btnOutline,
              { flex: 1, marginLeft: 4, marginBottom: 0 },
            ]}
            onPress={() => setMode('create')}
          >
            <Text
              style={[
                styles.btnText,
                mode === 'create' ? null : styles.btnOutlineText,
              ]}
            >
              CREATE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'join' ? 'JOIN GROUP' : 'CREATE GROUP'}
          </Text>

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {mode === 'join' ? (
            <>
              <Text style={styles.label}>GROUP CODE</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC123"
                value={groupCode}
                onChangeText={(text) => setGroupCode(text.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleJoinGroup}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? 'JOINING...' : 'JOIN'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>GROUP NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="My Squad"
                value={groupName}
                onChangeText={setGroupName}
                autoCapitalize="words"
              />

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleCreateGroup}
                disabled={loading}
              >
                <Text style={styles.btnText}>
                  {loading ? 'CREATING...' : 'CREATE'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>HOW IT WORKS</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            • Set daily time limits{'\n'}
            • Stay under limits{'\n'}
            • Keep castle healthy{'\n'}
            • Defend against zombies
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
