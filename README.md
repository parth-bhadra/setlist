# Setlist

A React Native mobile application designed for comedians to organize and manage their jokes and setlists with full accessibility support.

## Features

### 📝 Joke Management
- Create, edit, and delete jokes
- Each joke includes:
  - **Title** (required)
  - **Setup** (optional)
  - **Punchline** (optional)
  - **Tags/Callbacks** (optional) - Additional lines that follow the punchline
- Organized, searchable joke library

### 🎭 Setlist Management
- Create custom setlists for different shows
- Add opening and closing material
- Arrange jokes in your preferred order
- Add segues between jokes for smooth transitions
- Reorder jokes with up/down controls
- View all your setlists at a glance

### ♿ Accessibility Features
Built with accessibility as a core feature:
- **TalkBack/VoiceOver Support** - Full screen reader compatibility
- **Smart Reading**:
  - Joke cards read full content on All Jokes screen
  - Joke cards read title only on Setlist view
  - Opening/Closing/Segue cards read content immediately on focus
- **🔊 Titles Button** - Read all joke titles in a setlist sequentially
- No manual double-tapping required - content is read on focus

### 💾 Data Management
- **Export to JSON** - Backup all your jokes and setlists
- **Import from JSON** - Restore from backup (merge or replace)
- **Share Setlist as Text** - Export formatted setlists to share
- **Cloud Backup** - Save to iCloud Drive or Google Drive
- All data stored locally using AsyncStorage

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) ~54.0.0
- **Runtime**: React Native 0.81.5
- **Language**: JavaScript (React 19.1.0)
- **Navigation**: React Navigation 7.x
- **Storage**: AsyncStorage
- **Architecture**: React Native New Architecture (Fabric + TurboModules)

## Installation

### Prerequisites
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Setup

```bash
# Clone the repository
git clone https://github.com/parth-bhadra/setlist.git
cd setlist

# Install dependencies
npm install

# iOS: Install CocoaPods dependencies
cd ios && pod install && cd ..

# Start the development server
npm start
```

## Running the App

### Development Mode

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Building

```bash
# Development build for iOS
eas build --profile development --platform ios

# Development build for Android
eas build --profile development --platform android

# Preview build
eas build --profile preview --platform all
```

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── JokeCard.js     # Joke display card with accessibility
│   │   └── SetlistCard.js  # Setlist display card
│   ├── context/
│   │   └── AppContext.js   # Global state management
│   ├── navigation/
│   │   └── AppNavigator.js # Navigation configuration
│   ├── screens/            # App screens
│   │   ├── AddEditJokeScreen.js
│   │   ├── AddEditSetlistScreen.js
│   │   ├── HomeScreen.js
│   │   ├── JokesListScreen.js
│   │   ├── SetlistDetailScreen.js
│   │   └── SettingsScreen.js
│   ├── storage/
│   │   └── storage.js      # AsyncStorage operations
│   └── voice/              # Voice/accessibility utilities
├── assets/                 # Images and app icons
├── android/               # Android native project
├── ios/                   # iOS native project
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Key Features in Detail

### Joke Structure
```javascript
{
  id: "unique-id",
  title: "Joke Title",           // Required
  setup: "Why did the...",       // Optional
  punchline: "Punchline here",   // Optional
  tags: ["tag1", "tag2"],        // Optional - callbacks/tags
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

### Setlist Structure
```javascript
{
  id: "unique-id",
  name: "Show Name",
  description: "Show description",
  opening: "Opening material",
  closing: "Closing material",
  jokes: [
    { jokeId: "joke-id", segueAfter: "Transition text" }
  ],
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

## Accessibility Support

The app is designed with accessibility as a first-class feature:

- All interactive elements have proper accessibility labels
- Smart content reading based on context
- No unnecessary navigation required
- TalkBack (Android) and VoiceOver (iOS) fully supported
- Cards announce content immediately on focus
- Keyboard navigation optimized

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

This project is private and not licensed for public use.

## Author

**Parth Bhadra**
- GitHub: [@parth-bhadra](https://github.com/parth-bhadra)

## Acknowledgments

Built with ❤️ for comedians who need accessible tools to organize their material.

---

**Version**: 1.0.0  
**Last Updated**: November 2025

