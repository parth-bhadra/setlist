import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useApp } from '../context/AppContext';
import JokeCard from '../components/JokeCard';

const SetlistDetailScreen = ({ navigation, route }) => {
  const { setlistId } = route.params;
  const { getSetlistById, getJokesForSetlist, removeJokeFromSetlist, updateSegueInSetlist } = useApp();
  
  const [editingSegue, setEditingSegue] = useState(null); // { jokeId, currentSegue }
  const [segueText, setSegueText] = useState('');

  const setlist = getSetlistById(setlistId);
  const jokes = getJokesForSetlist(setlistId);

  if (!setlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Setlist not found</Text>
      </View>
    );
  }

  const handleRemoveJoke = (jokeId) => {
    Alert.alert(
      'Remove Joke',
      'Remove this joke from the setlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeJokeFromSetlist(setlistId, jokeId),
        },
      ]
    );
  };

  const openSegueEditor = (jokeId, currentSegue) => {
    setEditingSegue({ jokeId });
    setSegueText(currentSegue || '');
  };

  const saveSegue = async () => {
    if (editingSegue) {
      await updateSegueInSetlist(setlistId, editingSegue.jokeId, segueText);
      setEditingSegue(null);
      setSegueText('');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {setlist.name || 'Unnamed Setlist'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEditSetlist', { setlistId })}
        >
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      {setlist.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{setlist.description}</Text>
        </View>
      )}

      {jokes.length === 0 && !setlist.opening && !setlist.closing ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No content in this setlist</Text>
          <Text style={styles.emptySubtext}>
            Add an opening, jokes, or closing to get started
          </Text>
          <TouchableOpacity
            style={styles.allJokesButton}
            onPress={() => navigation.navigate('JokesList')}
          >
            <Text style={styles.allJokesButtonText}>View All Jokes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[
            { type: 'opening' },
            ...jokes.map((joke, index) => ({ type: 'joke', joke, index })),
            { type: 'closing' },
          ]}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'opening' && setlist.opening) {
              return (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionLabel}>Opening</Text>
                  <View style={styles.textCard}>
                    <Text style={styles.sectionText}>{setlist.opening}</Text>
                  </View>
                </View>
              );
            }

            if (item.type === 'closing' && setlist.closing) {
              return (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionLabel}>Closing</Text>
                  <View style={styles.textCard}>
                    <Text style={styles.sectionText}>{setlist.closing}</Text>
                  </View>
                </View>
              );
            }

            if (item.type === 'joke') {
              const { joke, index } = item;
              return (
                <View>
                  <View style={styles.jokeNumber}>
                    <Text style={styles.jokeNumberText}>Joke #{index + 1}</Text>
                  </View>
                  <JokeCard
                    joke={joke}
                    onPress={() => navigation.navigate('AddEditJoke', { jokeId: joke.id })}
                    onEdit={() => navigation.navigate('AddEditJoke', { jokeId: joke.id })}
                    onDelete={() => handleRemoveJoke(joke.id)}
                    showActions={true}
                  />
                  <View style={styles.segueContainer}>
                    <Text style={styles.segueLabel}>Segue to next:</Text>
                    {joke.segueAfter ? (
                      <View style={styles.segueTextContainer}>
                        <Text style={styles.segueText}>{joke.segueAfter}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noSegueText}>No segue</Text>
                    )}
                    <TouchableOpacity
                      style={styles.editSegueButton}
                      onPress={() => openSegueEditor(joke.id, joke.segueAfter)}
                    >
                      <Text style={styles.editSegueButtonText}>
                        {joke.segueAfter ? 'Edit Segue' : 'Add Segue'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            return null;
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={!!editingSegue}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingSegue(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Segue</Text>
            <TextInput
              style={styles.segueInput}
              value={segueText}
              onChangeText={setSegueText}
              placeholder="Enter segue to next joke..."
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setEditingSegue(null)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={saveSegue}
              >
                <Text style={styles.saveModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginHorizontal: 12,
    textAlign: 'center',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  textCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  jokeNumber: {
    marginBottom: 8,
    marginTop: 8,
  },
  jokeNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  segueContainer: {
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 16,
  },
  segueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  segueTextContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  segueText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  noSegueText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  editSegueButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editSegueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  allJokesButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  allJokesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 100,
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
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  segueInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f0f0f0',
  },
  saveModalButton: {
    backgroundColor: '#007AFF',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SetlistDetailScreen;
