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
  
  const [setup, setSetup] = useState('');
  const [premise, setPremise] = useState('');
  const [punchline, setPunchline] = useState('');

  useEffect(() => {
    if (jokeId) {
      const joke = getJokeById(jokeId);
      if (joke) {
        setSetup(joke.setup || '');
        setPremise(joke.premise || '');
        setPunchline(joke.punchline || '');
      }
    }
  }, [jokeId]);

  const handleSave = async () => {
    if (!setup && !premise && !punchline) {
      Alert.alert('Empty Joke', 'Please add at least one part to the joke');
      return;
    }

    try {
      const jokeData = {
        setup: setup.trim(),
        premise: premise.trim(),
        punchline: punchline.trim(),
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

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
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
          <Text style={styles.label}>Premise (Optional)</Text>
          <TextInput
            style={styles.input}
            value={premise}
            onChangeText={setPremise}
            placeholder="Enter the premise..."
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

