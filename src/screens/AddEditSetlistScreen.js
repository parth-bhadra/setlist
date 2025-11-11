import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useApp } from '../context/AppContext';

const AddEditSetlistScreen = ({ navigation, route }) => {
  const { setlistId, preselectedJokeId } = route.params || {};
  const { createSetlist, editSetlist, getSetlistById, jokes, getJokeById, reorderJokesInSetlist, addJokeToSetlist, removeJokeFromSetlist } = useApp();
  
  const scrollViewRef = useRef(null);
  const segueInputRefs = useRef({});
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [opening, setOpening] = useState('');
  const [closing, setClosing] = useState('');
  const [setlistJokes, setSetlistJokes] = useState([]); // Array of { jokeId, segueAfter }
  const [showJokeModal, setShowJokeModal] = useState(false);

  useEffect(() => {
    if (setlistId) {
      const setlist = getSetlistById(setlistId);
      if (setlist) {
        setName(setlist.name || '');
        setDescription(setlist.description || '');
        setOpening(setlist.opening || '');
        setClosing(setlist.closing || '');
        setSetlistJokes(setlist.jokes || []);
      }
    } else if (preselectedJokeId) {
      // If creating a new setlist with a preselected joke, add it
      setSetlistJokes([{ jokeId: preselectedJokeId, segueAfter: '' }]);
    }
  }, [setlistId, preselectedJokeId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the setlist');
      return;
    }

    try {
      const setlistData = {
        name: name.trim(),
        description: description.trim(),
        opening: opening.trim(),
        closing: closing.trim(),
        jokes: setlistJokes,
      };

      if (setlistId) {
        await editSetlist(setlistId, setlistData);
      } else {
        await createSetlist(setlistData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save setlist');
    }
  };

  const handleAddJoke = (jokeId) => {
    // Check if joke already exists
    if (setlistJokes.some(item => item.jokeId === jokeId)) {
      Alert.alert('Already Added', 'This joke is already in the setlist');
      return;
    }
    
    setSetlistJokes([...setlistJokes, { jokeId, segueAfter: '' }]);
    setShowJokeModal(false);
  };

  const handleRemoveJoke = (jokeId) => {
    setSetlistJokes(setlistJokes.filter(item => item.jokeId !== jokeId));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newJokes = [...setlistJokes];
    [newJokes[index - 1], newJokes[index]] = [newJokes[index], newJokes[index - 1]];
    setSetlistJokes(newJokes);
  };

  const handleMoveDown = (index) => {
    if (index === setlistJokes.length - 1) return;
    const newJokes = [...setlistJokes];
    [newJokes[index], newJokes[index + 1]] = [newJokes[index + 1], newJokes[index]];
    setSetlistJokes(newJokes);
  };

  const handleSegueChange = (jokeId, segueText) => {
    setSetlistJokes(setlistJokes.map(item => 
      item.jokeId === jokeId ? { ...item, segueAfter: segueText } : item
    ));
  };

  const handleSegueFocus = (jokeId) => {
    // Scroll to the segue input when focused
    setTimeout(() => {
      const inputView = segueInputRefs.current[jokeId];
      if (inputView && scrollViewRef.current) {
        inputView.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({
              y: y - 100, // Offset to keep input visible above keyboard
              animated: true
            });
          },
          () => {} // Error callback
        );
      }
    }, 100);
  };

  const getJokePreview = (jokeId) => {
    const joke = getJokeById(jokeId);
    if (!joke) return 'Unknown joke';
    
    if (joke.title) return joke.title;
    
    let parts = [];
    if (joke.setup) parts.push(joke.setup);
    if (joke.punchline) parts.push(joke.punchline);
    const text = parts.join(' ');
    return text.length > 80 ? text.substring(0, 80) + '...' : text || 'Untitled joke';
  };

  // Available jokes (not already in setlist)
  const availableJokes = jokes.filter(
    joke => !setlistJokes.some(item => item.jokeId === joke.id)
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {setlistId ? 'Edit Setlist' : 'New Setlist'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
      >
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter setlist name..."
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Opening (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={opening}
            onChangeText={setOpening}
            placeholder="Enter your opening material..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Closing (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={closing}
            onChangeText={setClosing}
            placeholder="Enter your closing material..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.jokesSection}>
          <View style={styles.jokesSectionHeader}>
            <Text style={styles.jokesLabel}>Jokes in Setlist</Text>
            <TouchableOpacity
              style={styles.addJokeButton}
              onPress={() => setShowJokeModal(true)}
            >
              <Text style={styles.addJokeButtonText}>+ Add Joke</Text>
            </TouchableOpacity>
          </View>

          {setlistJokes.length === 0 ? (
            <Text style={styles.noJokesText}>No jokes added yet</Text>
          ) : (
            setlistJokes.map((item, index) => (
              <View key={item.jokeId} style={styles.jokeItem}>
                <View style={styles.jokeItemHeader}>
                  <Text style={styles.jokeNumber}>#{index + 1}</Text>
                  <View style={styles.jokeActions}>
                    <TouchableOpacity
                      onPress={() => handleMoveUp(index)}
                      disabled={index === 0}
                      style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                    >
                      <Text style={styles.moveButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMoveDown(index)}
                      disabled={index === setlistJokes.length - 1}
                      style={[styles.moveButton, index === setlistJokes.length - 1 && styles.moveButtonDisabled]}
                    >
                      <Text style={styles.moveButtonText}>↓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveJoke(item.jokeId)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('AddEditJoke', { jokeId: item.jokeId })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.jokePreview}>{getJokePreview(item.jokeId)}</Text>
                </TouchableOpacity>
                
                <View 
                  style={styles.segueInputContainer}
                  ref={(ref) => segueInputRefs.current[item.jokeId] = ref}
                  collapsable={false}
                >
                  <Text style={styles.segueLabel}>Segue to next (optional):</Text>
                  <TextInput
                    style={styles.segueInput}
                    value={item.segueAfter || ''}
                    onChangeText={(text) => handleSegueChange(item.jokeId, text)}
                    onFocus={() => handleSegueFocus(item.jokeId)}
                    placeholder="Enter segue to next joke..."
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showJokeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJokeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Joke to Setlist</Text>
            
            <TouchableOpacity
              style={styles.viewAllJokesButton}
              onPress={() => {
                setShowJokeModal(false);
                navigation.navigate('JokesList');
              }}
            >
              <Text style={styles.viewAllJokesButtonText}>
                📝 View All Jokes / Create New Joke
              </Text>
            </TouchableOpacity>

            {availableJokes.length === 0 ? (
              <View style={styles.noAvailableJokes}>
                <Text style={styles.noAvailableJokesText}>
                  No more jokes available
                </Text>
                <Text style={styles.noAvailableJokesSubtext}>
                  All your jokes are already in this setlist
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableJokes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.availableJokeItem}
                    onPress={() => handleAddJoke(item.id)}
                  >
                    <Text style={styles.availableJokeText} numberOfLines={2}>
                      {getJokePreview(item.id)}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.jokesList}
              />
            )}
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowJokeModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 400, // Extra padding for keyboard
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jokesSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  jokesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jokesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addJokeButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addJokeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noJokesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  jokeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jokeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jokeNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  jokeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  moveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  jokePreview: {
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  segueInputContainer: {
    marginTop: 12,
  },
  segueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  segueInput: {
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#333',
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#FFE0B2',
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
  viewAllJokesButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllJokesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  jokesList: {
    maxHeight: 400,
  },
  availableJokeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  availableJokeText: {
    fontSize: 16,
    color: '#333',
  },
  noAvailableJokes: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noAvailableJokesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noAvailableJokesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  cancelModalButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default AddEditSetlistScreen;
