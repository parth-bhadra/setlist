import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, AccessibilityInfo } from 'react-native';

const SetlistCard = ({ setlist, jokeCount, jokes = [], onPress, onEdit, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Setlist',
      'Are you sure you want to delete this setlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const getFullSetlistText = () => {
    let parts = [];
    // Opening without label
    if (setlist.opening) parts.push(setlist.opening);
    
    // Jokes without labels, headings, or tags
    jokes.forEach((joke) => {
      let jokeParts = [];
      if (joke.setup) jokeParts.push(joke.setup);
      if (joke.punchline) jokeParts.push(joke.punchline);
      if (jokeParts.length > 0) parts.push(jokeParts.join(' '));
      if (joke.segueAfter) parts.push(joke.segueAfter);
    });
    
    // Closing without label
    if (setlist.closing) parts.push(setlist.closing);
    return parts.join('. ');
  };

  const getJokeTitles = () => {
    const titles = jokes
      .map((joke, index) => `${index + 1}. ${joke.title || 'Untitled'}`)
      .join('. ');
    return titles || 'No jokes in setlist';
  };

  const handleReadTitles = (e) => {
    e.stopPropagation();
    const titlesText = getJokeTitles();
    AccessibilityInfo.announceForAccessibility(titlesText);
  };

  const handleCardPress = () => {
    // Read the full setlist
    const fullText = getFullSetlistText();
    if (fullText) {
      AccessibilityInfo.announceForAccessibility(fullText);
    }
    
    // Then call the original onPress
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
      accessibilityLabel={`${setlist.name || 'Unnamed Setlist'}, ${jokeCount} jokes`}
      accessibilityRole="button"
      accessibilityHint="Tap to read and view setlist"
    >
      <View style={styles.content}>
        <Text style={styles.title}>{setlist.name || 'Unnamed Setlist'}</Text>
        {setlist.description && (
          <Text style={styles.description} numberOfLines={2}>
            {setlist.description}
          </Text>
        )}
        <Text style={styles.jokeCount}>
          {jokeCount} {jokeCount === 1 ? 'joke' : 'jokes'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.readButton]}
          onPress={handleReadTitles}
          accessibilityLabel="Read joke titles"
          accessibilityRole="button"
          accessibilityHint="Reads all joke titles in this setlist using TalkBack or VoiceOver"
        >
          <Text style={styles.actionButtonText}>🔊 Titles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  jokeCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  readButton: {
    backgroundColor: '#34C759',
    marginRight: 'auto',
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

export default SetlistCard;

