import AsyncStorage from '@react-native-async-storage/async-storage';

const JOKES_KEY = '@jokes';
const SETLISTS_KEY = '@setlists';

// Joke operations
export const saveJokes = async (jokes) => {
  try {
    await AsyncStorage.setItem(JOKES_KEY, JSON.stringify(jokes));
  } catch (error) {
    console.error('Error saving jokes:', error);
    throw error;
  }
};

export const loadJokes = async () => {
  try {
    const jokesJson = await AsyncStorage.getItem(JOKES_KEY);
    return jokesJson ? JSON.parse(jokesJson) : [];
  } catch (error) {
    console.error('Error loading jokes:', error);
    return [];
  }
};

export const addJoke = async (joke) => {
  try {
    const jokes = await loadJokes();
    const newJoke = {
      id: Date.now().toString(),
      ...joke,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jokes.push(newJoke);
    await saveJokes(jokes);
    return newJoke;
  } catch (error) {
    console.error('Error adding joke:', error);
    throw error;
  }
};

export const updateJoke = async (id, updatedJoke) => {
  try {
    const jokes = await loadJokes();
    const index = jokes.findIndex(j => j.id === id);
    if (index !== -1) {
      jokes[index] = {
        ...jokes[index],
        ...updatedJoke,
        updatedAt: new Date().toISOString(),
      };
      await saveJokes(jokes);
      return jokes[index];
    }
    throw new Error('Joke not found');
  } catch (error) {
    console.error('Error updating joke:', error);
    throw error;
  }
};

export const deleteJoke = async (id) => {
  try {
    const jokes = await loadJokes();
    const filteredJokes = jokes.filter(j => j.id !== id);
    await saveJokes(filteredJokes);
    
    // Also remove from all setlists
    const setlists = await loadSetlists();
    const updatedSetlists = setlists.map(setlist => ({
      ...setlist,
      jokes: (setlist.jokes || []).filter(item => item.jokeId !== id),
    }));
    await saveSetlists(updatedSetlists);
  } catch (error) {
    console.error('Error deleting joke:', error);
    throw error;
  }
};

// Setlist operations
export const saveSetlists = async (setlists) => {
  try {
    await AsyncStorage.setItem(SETLISTS_KEY, JSON.stringify(setlists));
  } catch (error) {
    console.error('Error saving setlists:', error);
    throw error;
  }
};

export const loadSetlists = async () => {
  try {
    const setlistsJson = await AsyncStorage.getItem(SETLISTS_KEY);
    return setlistsJson ? JSON.parse(setlistsJson) : [];
  } catch (error) {
    console.error('Error loading setlists:', error);
    return [];
  }
};

export const addSetlist = async (setlist) => {
  try {
    const setlists = await loadSetlists();
    const newSetlist = {
      id: Date.now().toString(),
      ...setlist,
      opening: setlist.opening || '',
      closing: setlist.closing || '',
      jokes: setlist.jokes || [], // Array of { jokeId, segueAfter }
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setlists.push(newSetlist);
    await saveSetlists(setlists);
    return newSetlist;
  } catch (error) {
    console.error('Error adding setlist:', error);
    throw error;
  }
};

export const updateSetlist = async (id, updatedSetlist) => {
  try {
    const setlists = await loadSetlists();
    const index = setlists.findIndex(s => s.id === id);
    if (index !== -1) {
      setlists[index] = {
        ...setlists[index],
        ...updatedSetlist,
        updatedAt: new Date().toISOString(),
      };
      await saveSetlists(setlists);
      return setlists[index];
    }
    throw new Error('Setlist not found');
  } catch (error) {
    console.error('Error updating setlist:', error);
    throw error;
  }
};

export const deleteSetlist = async (id) => {
  try {
    const setlists = await loadSetlists();
    const filteredSetlists = setlists.filter(s => s.id !== id);
    await saveSetlists(filteredSetlists);
  } catch (error) {
    console.error('Error deleting setlist:', error);
    throw error;
  }
};

export const addJokeToSetlist = async (setlistId, jokeId) => {
  try {
    const setlists = await loadSetlists();
    const index = setlists.findIndex(s => s.id === setlistId);
    if (index !== -1) {
      // Initialize jokes array if it doesn't exist or is old format (jokeIds)
      if (!setlists[index].jokes || Array.isArray(setlists[index].jokes) && setlists[index].jokes.length > 0 && typeof setlists[index].jokes[0] === 'string') {
        setlists[index].jokes = [];
      }
      
      // Check if joke already exists
      const jokeExists = setlists[index].jokes.some(item => item.jokeId === jokeId);
      if (!jokeExists) {
        setlists[index].jokes.push({ jokeId, segueAfter: '' });
        setlists[index].updatedAt = new Date().toISOString();
        await saveSetlists(setlists);
      }
      return setlists[index];
    }
    throw new Error('Setlist not found');
  } catch (error) {
    console.error('Error adding joke to setlist:', error);
    throw error;
  }
};

export const removeJokeFromSetlist = async (setlistId, jokeId) => {
  try {
    const setlists = await loadSetlists();
    const index = setlists.findIndex(s => s.id === setlistId);
    if (index !== -1) {
      setlists[index].jokes = (setlists[index].jokes || []).filter(item => item.jokeId !== jokeId);
      setlists[index].updatedAt = new Date().toISOString();
      await saveSetlists(setlists);
      return setlists[index];
    }
    throw new Error('Setlist not found');
  } catch (error) {
    console.error('Error removing joke from setlist:', error);
    throw error;
  }
};

export const updateSegueInSetlist = async (setlistId, jokeId, segueAfter) => {
  try {
    const setlists = await loadSetlists();
    const index = setlists.findIndex(s => s.id === setlistId);
    if (index !== -1) {
      const jokeIndex = setlists[index].jokes.findIndex(item => item.jokeId === jokeId);
      if (jokeIndex !== -1) {
        setlists[index].jokes[jokeIndex].segueAfter = segueAfter;
        setlists[index].updatedAt = new Date().toISOString();
        await saveSetlists(setlists);
        return setlists[index];
      }
    }
    throw new Error('Setlist or joke not found');
  } catch (error) {
    console.error('Error updating segue in setlist:', error);
    throw error;
  }
};

