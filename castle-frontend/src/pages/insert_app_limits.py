#!/usr/bin/env python3
import re

# Read the original file
with open('GroupDashboard.jsx.backup', 'r') as f:
    content = f.read()

# Add app limits functions after loadGroupData function
load_group_data_end = content.find('  };', content.find('const loadGroupData'))
if load_group_data_end != -1:
    # Find the next line after loadGroupData
    insert_pos = content.find('\n', load_group_data_end + 4) + 1
    
    app_limits_functions = '''
  const loadAppLimitsData = async () => {
    try {
      const [limitsData, usageData] = await Promise.all([
        getAppLimits(groupId),
        getAppUsage(groupId).catch(() => ({ app_usage: [] })),
      ]);
      
      setAppLimits(limitsData.app_limits || []);
      setAppUsage(usageData.app_usage || []);
    } catch (err) {
      console.error('Failed to load app limits:', err);
    }
  };

  const handleAddAppLimit = async (e) => {
    e.preventDefault();
    
    if (!newAppName.trim() || !newAppLimit || parseInt(newAppLimit) <= 0) {
      alert('Please enter a valid app name and time limit');
      return;
    }

    setAppLimitsLoading(true);
    
    try {
      await createAppLimit(groupId, newAppName.trim(), parseInt(newAppLimit));
      setNewAppName('');
      setNewAppLimit('');
      await loadAppLimitsData();
    } catch (err) {
      alert('Failed to add app limit: ' + err.message);
    } finally {
      setAppLimitsLoading(false);
    }
  };

  const handleDeleteAppLimit = async (appName) => {
    if (!confirm(\`Delete limit for "\${appName}"?\`)) {
      return;
    }

    setAppLimitsLoading(true);
    
    try {
      await deleteAppLimit(groupId, appName);
      await loadAppLimitsData();
    } catch (err) {
      alert('Failed to delete app limit: ' + err.message);
    } finally {
      setAppLimitsLoading(false);
    }
  };

  const getAppUsageData = (appName) => {
    return appUsage.find(app => app.app_name === appName) || {
      used_minutes: 0,
      usage_percent: 0,
      exceeded: false
    };
  };
'''
    
    # Also need to add loadAppLimitsData() call in loadGroupData
    content = content.replace(
        '      setStatus(statusData);\n      setStreak(streakData);',
        '      setStatus(statusData);\n      setStreak(streakData);\n      \n      // Load app limits data\n      loadAppLimitsData();'
    )
    
    content = content[:insert_pos] + app_limits_functions + content[insert_pos:]

# Write the modified content
with open('GroupDashboard.jsx', 'w') as f:
    f.write(content)

print("Successfully added app limits functions to GroupDashboard.jsx")
