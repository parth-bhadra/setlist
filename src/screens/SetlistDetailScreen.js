import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { useApp } from '../context/AppContext';
import JokeCard from '../components/JokeCard';

const SetlistDetailScreen = ({ navigation, route }) => {
  const { setlistId } = route.params;
  const { getSetlistById, getJokesForSetlist, removeJokeFromSetlist } = useApp();

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


  // Build flat list data including opening, jokes with segues, and closing
  const buildListData = () => {
    const data = [];
    
    // Add opening if exists
    if (setlist.opening) {
      data.push({ type: 'opening', content: setlist.opening });
    }
    
    // Add jokes with their segues
    jokes.forEach((joke, index) => {
      data.push({ type: 'joke', joke, index });
      
      // Add segue if it exists
      if (joke.segueAfter) {
        data.push({ type: 'segue', content: joke.segueAfter, jokeId: joke.id });
      }
    });
    
    // Add closing if exists
    if (setlist.closing) {
      data.push({ type: 'closing', content: setlist.closing });
    }
    
    return data;
  };

  const renderCard = ({ item }) => {
    if (item.type === 'opening') {
      return (
        <TouchableOpacity
          style={styles.textCard}
          onPress={() => AccessibilityInfo.announceForAccessibility(item.content)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Opening"
          accessibilityHint="Tap to read the opening"
        >
          <Text style={styles.cardText}>{item.content}</Text>
        </TouchableOpacity>
      );
    }

    if (item.type === 'closing') {
      return (
        <TouchableOpacity
          style={styles.textCard}
          onPress={() => AccessibilityInfo.announceForAccessibility(item.content)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Closing"
          accessibilityHint="Tap to read the closing"
        >
          <Text style={styles.cardText}>{item.content}</Text>
        </TouchableOpacity>
      );
    }

    if (item.type === 'segue') {
      return (
        <TouchableOpacity
          style={styles.segueCard}
          onPress={() => AccessibilityInfo.announceForAccessibility(item.content)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Segue"
          accessibilityHint="Tap to read the segue"
        >
          <Text style={styles.segueCardText}>{item.content}</Text>
        </TouchableOpacity>
      );
    }

    if (item.type === 'joke') {
      return (
        <JokeCard
          joke={item.joke}
          onPress={() => {}} // Just read the title, no navigation
          onEdit={() => navigation.navigate('AddEditJoke', { jokeId: item.joke.id })}
          onDelete={() => handleRemoveJoke(item.joke.id)}
          showActions={false}
          readTitleOnly={true}
        />
      );
    }

    return null;
  };

  const listData = buildListData();

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

      {listData.length === 0 ? (
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
          data={listData}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
        />
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
  textCard: {
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
  cardText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  segueCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginLeft: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segueCardText: {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 22,
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
});

export default SetlistDetailScreen;
