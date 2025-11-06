import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import JokeCard from '../components/JokeCard';

const JokesListScreen = ({ navigation }) => {
  const { jokes, removeJoke, setlists, addJokeToSetlist } = useApp();
  const [selectedJoke, setSelectedJoke] = useState(null);
  const [showSetlistModal, setShowSetlistModal] = useState(false);

  const handleAddToSetlist = (jokeId) => {
    setSelectedJoke(jokeId);
    setShowSetlistModal(true);
  };

  const handleSelectSetlist = async (setlistId) => {
    if (selectedJoke) {
      await addJokeToSetlist(setlistId, selectedJoke);
      setShowSetlistModal(false);
      setSelectedJoke(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Jokes</Text>
        <View style={{ width: 60 }} />
      </View>

      {jokes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No jokes yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to create your first joke
          </Text>
        </View>
      ) : (
        <FlatList
          data={jokes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <JokeCard
                joke={item}
                onPress={() => navigation.navigate('AddEditJoke', { jokeId: item.id })}
                onEdit={() => navigation.navigate('AddEditJoke', { jokeId: item.id })}
                onDelete={() => removeJoke(item.id)}
              />
              <TouchableOpacity
                style={styles.addToSetlistButton}
                onPress={() => handleAddToSetlist(item.id)}
              >
                <Text style={styles.addToSetlistButtonText}>
                  Add to Setlist
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditJoke')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showSetlistModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSetlistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Setlist</Text>
            <ScrollView style={styles.setlistList}>
              {setlists.map((setlist) => (
                <TouchableOpacity
                  key={setlist.id}
                  style={styles.setlistItem}
                  onPress={() => handleSelectSetlist(setlist.id)}
                >
                  <Text style={styles.setlistItemText}>
                    {setlist.name || 'Unnamed Setlist'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSetlistModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
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
  addToSetlistButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: -8,
    marginBottom: 12,
  },
  addToSetlistButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  setlistList: {
    maxHeight: 300,
  },
  setlistItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  setlistItemText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default JokesListScreen;

