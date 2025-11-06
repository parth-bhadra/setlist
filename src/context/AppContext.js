import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Storage from '../storage/storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [jokes, setJokes] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedJokes, loadedSetlists] = await Promise.all([
        Storage.loadJokes(),
        Storage.loadSetlists(),
      ]);
      setJokes(loadedJokes);
      setSetlists(loadedSetlists);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Joke operations
  const createJoke = async (jokeData) => {
    try {
      const newJoke = await Storage.addJoke(jokeData);
      setJokes([...jokes, newJoke]);
      return newJoke;
    } catch (error) {
      console.error('Error creating joke:', error);
      throw error;
    }
  };

  const editJoke = async (id, jokeData) => {
    try {
      const updatedJoke = await Storage.updateJoke(id, jokeData);
      setJokes(jokes.map(j => j.id === id ? updatedJoke : j));
      return updatedJoke;
    } catch (error) {
      console.error('Error editing joke:', error);
      throw error;
    }
  };

  const removeJoke = async (id) => {
    try {
      await Storage.deleteJoke(id);
      setJokes(jokes.filter(j => j.id !== id));
      // Update setlists to remove the joke
      const updatedSetlists = setlists.map(setlist => ({
        ...setlist,
        jokes: (setlist.jokes || []).filter(item => item.jokeId !== id),
      }));
      setSetlists(updatedSetlists);
    } catch (error) {
      console.error('Error removing joke:', error);
      throw error;
    }
  };

  // Setlist operations
  const createSetlist = async (setlistData) => {
    try {
      const newSetlist = await Storage.addSetlist(setlistData);
      setSetlists([...setlists, newSetlist]);
      return newSetlist;
    } catch (error) {
      console.error('Error creating setlist:', error);
      throw error;
    }
  };

  const editSetlist = async (id, setlistData) => {
    try {
      const updatedSetlist = await Storage.updateSetlist(id, setlistData);
      setSetlists(setlists.map(s => s.id === id ? updatedSetlist : s));
      return updatedSetlist;
    } catch (error) {
      console.error('Error editing setlist:', error);
      throw error;
    }
  };

  const removeSetlist = async (id) => {
    try {
      await Storage.deleteSetlist(id);
      setSetlists(setlists.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error removing setlist:', error);
      throw error;
    }
  };

  const addJokeToSetlist = async (setlistId, jokeId) => {
    try {
      const updatedSetlist = await Storage.addJokeToSetlist(setlistId, jokeId);
      setSetlists(setlists.map(s => s.id === setlistId ? updatedSetlist : s));
    } catch (error) {
      console.error('Error adding joke to setlist:', error);
      throw error;
    }
  };

  const removeJokeFromSetlist = async (setlistId, jokeId) => {
    try {
      const updatedSetlist = await Storage.removeJokeFromSetlist(setlistId, jokeId);
      setSetlists(setlists.map(s => s.id === setlistId ? updatedSetlist : s));
    } catch (error) {
      console.error('Error removing joke from setlist:', error);
      throw error;
    }
  };

  const reorderJokesInSetlist = async (setlistId, newJokes) => {
    try {
      const updatedSetlist = await Storage.updateSetlist(setlistId, { jokes: newJokes });
      setSetlists(setlists.map(s => s.id === setlistId ? updatedSetlist : s));
    } catch (error) {
      console.error('Error reordering jokes in setlist:', error);
      throw error;
    }
  };

  const updateSegueInSetlist = async (setlistId, jokeId, segueAfter) => {
    try {
      const updatedSetlist = await Storage.updateSegueInSetlist(setlistId, jokeId, segueAfter);
      setSetlists(setlists.map(s => s.id === setlistId ? updatedSetlist : s));
    } catch (error) {
      console.error('Error updating segue:', error);
      throw error;
    }
  };

  const getJokeById = (id) => {
    return jokes.find(j => j.id === id);
  };

  const getSetlistById = (id) => {
    return setlists.find(s => s.id === id);
  };

  const getJokesForSetlist = (setlistId) => {
    const setlist = getSetlistById(setlistId);
    if (!setlist) return [];
    return (setlist.jokes || []).map(item => ({
      ...getJokeById(item.jokeId),
      segueAfter: item.segueAfter,
    })).filter(joke => joke.id); // Filter out jokes that don't exist
  };

  const value = {
    jokes,
    setlists,
    loading,
    createJoke,
    editJoke,
    removeJoke,
    createSetlist,
    editSetlist,
    removeSetlist,
    addJokeToSetlist,
    removeJokeFromSetlist,
    reorderJokesInSetlist,
    updateSegueInSetlist,
    getJokeById,
    getSetlistById,
    getJokesForSetlist,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

