import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../context/AppContext';
import * as Storage from '../storage/storage';

const SettingsScreen = ({ navigation }) => {
  const { jokes, setlists } = useApp();
  const [loading, setLoading] = useState(false);

  // 1. Export to JSON
  const handleExportToJSON = async () => {
    try {
      setLoading(true);
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        jokes: jokes,
        setlists: setlists,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `blind-comic-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Jokes & Setlists',
          UTI: 'public.json',
        });
        
        Alert.alert(
          'Export Successful',
          `Your data has been exported to ${fileName}`,
        );
      } else {
        Alert.alert('Success', `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Import from JSON
  const handleImportFromJSON = async () => {
    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importData = JSON.parse(fileContent);

      // Validate the data structure
      if (!importData.jokes || !importData.setlists) {
        throw new Error('Invalid backup file format');
      }

      Alert.alert(
        'Import Data',
        `Found ${importData.jokes.length} jokes and ${importData.setlists.length} setlists.\n\nHow would you like to import?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Replace All',
            style: 'destructive',
            onPress: async () => {
              await Storage.saveJokes(importData.jokes);
              await Storage.saveSetlists(importData.setlists);
              Alert.alert(
                'Import Complete',
                'All data has been replaced. Restart the app to see changes.',
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            },
          },
          {
            text: 'Merge',
            onPress: async () => {
              // Merge jokes
              const existingJokes = await Storage.loadJokes();
              const mergedJokes = [...existingJokes];
              
              importData.jokes.forEach(importedJoke => {
                if (!existingJokes.find(j => j.id === importedJoke.id)) {
                  mergedJokes.push(importedJoke);
                }
              });

              // Merge setlists
              const existingSetlists = await Storage.loadSetlists();
              const mergedSetlists = [...existingSetlists];
              
              importData.setlists.forEach(importedSetlist => {
                if (!existingSetlists.find(s => s.id === importedSetlist.id)) {
                  mergedSetlists.push(importedSetlist);
                }
              });

              await Storage.saveJokes(mergedJokes);
              await Storage.saveSetlists(mergedSetlists);
              
              Alert.alert(
                'Import Complete',
                `Imported ${mergedJokes.length - existingJokes.length} new jokes and ${mergedSetlists.length - existingSetlists.length} new setlists. Restart the app to see changes.`,
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Could not import the file. Please make sure it\'s a valid backup file.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Share Setlist as Text
  const handleShareSetlist = () => {
    if (setlists.length === 0) {
      Alert.alert('No Setlists', 'You don\'t have any setlists to share yet.');
      return;
    }

    // Show setlist picker
    Alert.alert(
      'Share Setlist',
      'Choose a setlist to share as text',
      [
        { text: 'Cancel', style: 'cancel' },
        ...setlists.map(setlist => ({
          text: setlist.name || 'Unnamed Setlist',
          onPress: () => shareSetlistAsText(setlist),
        })),
      ]
    );
  };

  const shareSetlistAsText = async (setlist) => {
    try {
      setLoading(true);
      
      let text = `🎤 ${setlist.name || 'My Setlist'}\n`;
      text += '═'.repeat(40) + '\n\n';

      if (setlist.description) {
        text += `📝 ${setlist.description}\n\n`;
      }

      if (setlist.opening) {
        text += `🎭 OPENING:\n${setlist.opening}\n\n`;
      }

      if (setlist.jokes && setlist.jokes.length > 0) {
        text += `📋 JOKES (${setlist.jokes.length}):\n\n`;
        
        setlist.jokes.forEach((jokeItem, index) => {
          const joke = jokes.find(j => j.id === jokeItem.jokeId);
          if (joke) {
            text += `${index + 1}. `;
            if (joke.setup) text += `Setup: ${joke.setup}\n   `;
            if (joke.premise) text += `Premise: ${joke.premise}\n   `;
            if (joke.punchline) text += `Punchline: ${joke.punchline}\n`;
            
            if (jokeItem.segueAfter) {
              text += `   ↪ Segue: ${jokeItem.segueAfter}\n`;
            }
            text += '\n';
          }
        });
      }

      if (setlist.closing) {
        text += `🎭 CLOSING:\n${setlist.closing}\n\n`;
      }

      text += '═'.repeat(40) + '\n';
      text += `Created with Blind Comic Setlist 📱\n`;

      const fileName = `setlist-${setlist.name?.replace(/\s+/g, '-') || 'unnamed'}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, text);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Setlist',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Could not share the setlist.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Cloud Backup (simplified version - uses the OS share sheet to save to iCloud/Drive)
  const handleCloudBackup = async () => {
    Alert.alert(
      'Cloud Backup',
      Platform.OS === 'ios' 
        ? 'This will create a backup file that you can save to iCloud Drive.'
        : 'This will create a backup file that you can save to Google Drive.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              setLoading(true);
              
              const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                jokes: jokes,
                setlists: setlists,
              };

              const jsonString = JSON.stringify(exportData, null, 2);
              const fileName = `blind-comic-cloud-backup-${new Date().toISOString().split('T')[0]}.json`;
              const fileUri = FileSystem.documentDirectory + fileName;

              await FileSystem.writeAsStringAsync(fileUri, jsonString);

              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                  mimeType: 'application/json',
                  dialogTitle: Platform.OS === 'ios' ? 'Save to iCloud Drive' : 'Save to Google Drive',
                  UTI: 'public.json',
                });
                
                Alert.alert(
                  'Backup Created',
                  Platform.OS === 'ios'
                    ? 'Use the share sheet to save to "Files" → "iCloud Drive"'
                    : 'Use the share dialog to save to Google Drive',
                );
              }
            } catch (error) {
              console.error('Cloud backup error:', error);
              Alert.alert('Backup Failed', 'Could not create cloud backup.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getDataStats = () => {
    const jokesCount = jokes.length;
    const setlistsCount = setlists.length;
    const totalJokesInSetlists = setlists.reduce((sum, setlist) => sum + (setlist.jokes?.length || 0), 0);
    
    return { jokesCount, setlistsCount, totalJokesInSetlists };
  };

  const stats = getDataStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings & Backup</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Your Data</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.jokesCount}</Text>
              <Text style={styles.statLabel}>Jokes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.setlistsCount}</Text>
              <Text style={styles.statLabel}>Setlists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalJokesInSetlists}</Text>
              <Text style={styles.statLabel}>In Setlists</Text>
            </View>
          </View>
        </View>

        {/* Export/Import Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data Management</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportToJSON}
            disabled={loading}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Export to JSON</Text>
              <Text style={styles.actionDescription}>
                Save all your jokes and setlists to a file
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImportFromJSON}
            disabled={loading}
          >
            <Text style={styles.actionIcon}>📥</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Import from JSON</Text>
              <Text style={styles.actionDescription}>
                Restore from a backup file
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Share Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Sharing</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareSetlist}
            disabled={loading || setlists.length === 0}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Share Setlist as Text</Text>
              <Text style={styles.actionDescription}>
                Export a formatted setlist to share
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Cloud Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☁️ Cloud Backup</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCloudBackup}
            disabled={loading}
          >
            <Text style={styles.actionIcon}>
              {Platform.OS === 'ios' ? '☁️' : '💾'}
            </Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                {Platform.OS === 'ios' ? 'Backup to iCloud' : 'Backup to Google Drive'}
              </Text>
              <Text style={styles.actionDescription}>
                Save your data to the cloud
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ About Backups</Text>
          <Text style={styles.infoText}>
            • Export your data regularly to prevent loss{'\n'}
            • JSON backups can be imported later{'\n'}
            • Share setlists with other comics or venues{'\n'}
            • Cloud backups help you switch devices
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;

