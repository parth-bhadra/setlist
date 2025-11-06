import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const JokeCard = ({ joke, onEdit, onDelete, onPress, showActions = true }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Joke',
      'Are you sure you want to delete this joke?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const getFullJokeText = () => {
    let parts = [];
    if (joke.setup) parts.push(joke.setup);
    if (joke.premise) parts.push(joke.premise);
    if (joke.punchline) parts.push(joke.punchline);
    return parts.length > 0 ? parts.join(' ') : 'Empty joke';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={getFullJokeText()}
      accessibilityRole="button"
      accessibilityHint="Tap to edit this joke"
    >
      <View style={styles.content}>
        {joke.setup || joke.premise || joke.punchline ? (
          <Text style={styles.jokeText}>{getFullJokeText()}</Text>
        ) : (
          <Text style={styles.emptyText}>Empty joke</Text>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            accessibilityLabel="Edit joke"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            accessibilityLabel="Delete joke"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    marginBottom: 12,
  },
  jokeText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JokeCard;
