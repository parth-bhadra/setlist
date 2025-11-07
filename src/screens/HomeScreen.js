import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import SetlistCard from '../components/SetlistCard';

const HomeScreen = ({ navigation }) => {
  const { setlists, loading, removeSetlist, getJokesForSetlist } = useApp();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Setlists</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.allJokesButton}
            onPress={() => navigation.navigate('JokesList')}
          >
            <Text style={styles.allJokesButtonText}>All Jokes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {setlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No setlists yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to create your first setlist
          </Text>
        </View>
      ) : (
        <FlatList
          data={setlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SetlistCard
              setlist={item}
              jokeCount={(item.jokes || []).length}
              jokes={getJokesForSetlist(item.id)}
              onPress={() => navigation.navigate('SetlistDetail', { setlistId: item.id })}
              onEdit={() => navigation.navigate('AddEditSetlist', { setlistId: item.id })}
              onDelete={() => removeSetlist(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditSetlist')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  allJokesButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  allJokesButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default HomeScreen;

