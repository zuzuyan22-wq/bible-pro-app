import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current reading state
  currentTranslation: 'KJV',
  currentBook: 'Matt',
  currentChapter: 1,
  currentVerse: 1,
  
  // User preferences
  fontSize: 16,
  fontFamily: 'Roboto',
  theme: 'light',
  lineHeight: 1.6,
  
  // Navigation
  recentBooks: [],
  recentVerses: [],
  
  // User data
  favorites: [],
  bookmarks: [],
  highlights: {},
  notes: {},
  
  // Search & results
  searchResults: [],
  searchQuery: '',
  recentSearches: [],
  
  // Reading plans
  readingPlans: [],
  currentReadingPlan: null,
  readingProgress: {},
  
  // State flags
  loading: false,
  error: null,
  lastSync: null,
};

const bibleSlice = createSlice({
  name: 'bible',
  initialState,
  reducers: {
    // Navigation
    setCurrentTranslation: (state, action) => {
      state.currentTranslation = action.payload;
    },
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
      if (!state.recentBooks.includes(action.payload)) {
        state.recentBooks.unshift(action.payload);
        state.recentBooks = state.recentBooks.slice(0, 10);
      }
    },
    setCurrentChapter: (state, action) => {
      state.currentChapter = action.payload;
    },
    setCurrentVerse: (state, action) => {
      state.currentVerse = action.payload;
    },
    
    // Preferences
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setFontFamily: (state, action) => {
      state.fontFamily = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLineHeight: (state, action) => {
      state.lineHeight = action.payload;
    },
    
    // Favorites
    addFavorite: (state, action) => {
      const favorite = action.payload;
      if (!state.favorites.find(f => f.osis === favorite.osis)) {
        state.favorites.push(favorite);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(f => f.osis !== action.payload);
    },
    
    // Bookmarks
    addBookmark: (state, action) => {
      const bookmark = action.payload;
      if (!state.bookmarks.find(b => b.osis === bookmark.osis)) {
        state.bookmarks.push(bookmark);
      }
    },
    removeBookmark: (state, action) => {
      state.bookmarks = state.bookmarks.filter(b => b.osis !== action.payload);
    },
    
    // Highlights
    addHighlight: (state, action) => {
      const { osis, color } = action.payload;
      state.highlights[osis] = color;
    },
    removeHighlight: (state, action) => {
      delete state.highlights[action.payload];
    },
    
    // Notes
    addNote: (state, action) => {
      const { osis, note } = action.payload;
      state.notes[osis] = note;
    },
    removeNote: (state, action) => {
      delete state.notes[action.payload];
    },
    
    // Search
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addRecentSearch: (state, action) => {
      const search = action.payload;
      state.recentSearches = [
        search,
        ...state.recentSearches.filter(s => s !== search)
      ].slice(0, 20);
    },
    
    // Reading plans
    setReadingPlans: (state, action) => {
      state.readingPlans = action.payload;
    },
    setCurrentReadingPlan: (state, action) => {
      state.currentReadingPlan = action.payload;
    },
    setReadingProgress: (state, action) => {
      state.readingProgress = action.payload;
    },
    
    // State management
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLastSync: (state, action) => {
      state.lastSync = action.payload;
    },
    
    // Reset
    resetState: () => initialState,
  },
});

export const {
  setCurrentTranslation,
  setCurrentBook,
  setCurrentChapter,
  setCurrentVerse,
  setFontSize,
  setFontFamily,
  setTheme,
  setLineHeight,
  addFavorite,
  removeFavorite,
  addBookmark,
  removeBookmark,
  addHighlight,
  removeHighlight,
  addNote,
  removeNote,
  setSearchResults,
  setSearchQuery,
  addRecentSearch,
  setReadingPlans,
  setCurrentReadingPlan,
  setReadingProgress,
  setLoading,
  setError,
  setLastSync,
  resetState,
} = bibleSlice.actions;

export default bibleSlice.reducer;