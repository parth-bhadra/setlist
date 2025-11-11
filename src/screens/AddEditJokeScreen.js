import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useApp } from '../context/AppContext';

const AddEditJokeScreen = ({ navigation, route }) => {
  const { jokeId } = route.params || {};
  const { createJoke, editJoke, getJokeById } = useApp();
  
  const [title, setTitle] = useState('');
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (jokeId) {
      const joke = getJokeById(jokeId);
      if (joke) {
        setTitle(joke.title || '');
        setSetup(joke.setup || '');
        setPunchline(joke.punchline || '');
        setTags(joke.tags ? joke.tags.join(', ') : '');
      }
    }
  }, [jokeId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title for the joke');
      return;
    }

    if (!setup && !punchline) {
      Alert.alert('Empty Joke', 'Please add at least setup or punchline');
      return;
    }

    try {
      // Parse tags from comma-separated string
      const tagsList = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const jokeData = {
        title: title.trim(),
        setup: setup.trim(),
        punchline: punchline.trim(),
        tags: tagsList,
      };

      if (jokeId) {
        await editJoke(jokeId, jokeData);
      } else {
        await createJoke(jokeData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save joke');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {jokeId ? 'Edit Joke' : 'New Joke'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
      >
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter joke title..."
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Setup (Optional)</Text>
          <TextInput
            style={styles.input}
            value={setup}
            onChangeText={setSetup}
            placeholder="Enter the setup..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Punchline (Optional)</Text>
          <TextInput
            style={styles.input}
            value={punchline}
            onChangeText={setPunchline}
            placeholder="Enter the punchline..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tags/Callbacks (Optional)</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="Enter tag lines or callbacks after the punchline (separate with commas)"
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.hint}>
            Add tag lines or callbacks that follow the punchline (each separated by comma)
          </Text>
        </View>

        <Text style={styles.hint}>
          Note: Segues between jokes are added when you arrange jokes in a setlist.
        </Text>
      </ScrollView>
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
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default AddEditJokeScreen;

