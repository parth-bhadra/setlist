import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, AccessibilityInfo } from 'react-native';

const JokeCard = ({ joke, onEdit, onDelete, onPress, showActions = true, readTitleOnly = false }) => {
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
    // Include setup, punchline, and tags all together
    let parts = [];
    if (joke.setup) parts.push(joke.setup);
    if (joke.punchline) parts.push(joke.punchline);
    if (joke.tags && joke.tags.length > 0) parts.push(joke.tags.join(' '));
    return parts.length > 0 ? parts.join(' ') : '';
  };

  const handleCardPress = () => {
    // Read the joke when clicked
    if (readTitleOnly) {
      // On setlist view, read only title
      const titleText = joke.title || 'Untitled joke';
      AccessibilityInfo.announceForAccessibility(titleText);
    } else {
      // On all jokes screen, read full joke including tags
      const fullText = getFullJokeText();
      AccessibilityInfo.announceForAccessibility(fullText || joke.title || 'Empty joke');
    }
    
    // Then call the original onPress if provided
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCardPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={joke.title || 'Untitled joke'}
      accessibilityRole="button"
      accessibilityHint="Tap to read and edit this joke"
    >
      <View style={styles.content}>
        {joke.title ? (
          <>
            <Text style={styles.jokeTitle}>{joke.title}</Text>
            {(joke.setup || joke.punchline || (joke.tags && joke.tags.length > 0)) && (
              <Text style={styles.jokeText} numberOfLines={3}>
                {getFullJokeText()}
              </Text>
            )}
          </>
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
  jokeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  jokeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
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
