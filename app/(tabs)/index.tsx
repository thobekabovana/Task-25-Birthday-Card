import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';


export default function BirthdayCardScreen() {
  const [message, setMessage] = useState('Happy Birthday!');
  const [image, setImage] = useState(null);
  const [cards, setCards] = useState([]);
  const cardRef = useRef();

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Save card to phone's storage

  const saveCard = async () => {
    if (Platform.OS === 'web') {
      alert('Saving is not available on the web. Please download the image manually.');
      return;
    }
  
    if (cardRef.current) {
      try {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 0.8,
        });
  
        // Save to media library (gallery)
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('Birthday Cards', asset, false);
  
        alert('Card saved to gallery successfully! 🎉');
  
        // Update the state with saved card details
        setCards([...cards, { message, image, fileUri: uri }]);
      } catch (error) {
        console.error('Error saving card:', error);
      }
    }
  };
console.log('Message:', message);
console.log('Image:', image);
console.log('Cards:', cards);  

const requestPermissions = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access media library is required!');
  }
};

// Call this function inside useEffect() when the component mounts
useEffect(() => {
  requestPermissions();
}, []);


  // Share card
  const shareCard = async (fileUri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      alert('Sharing is not available on this device.');
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.cardContainer} ref={cardRef}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.cardImage} />
          ) : (
            <Text style={styles.imagePlaceholder}>Tap to add image</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          onChangeText={setMessage}
          value={message}
          placeholder="Enter birthday message"
        />
      </View>

      <TouchableOpacity onPress={saveCard} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save Card</Text>
      </TouchableOpacity>

      <View style={styles.savedCardsContainer}>
        {cards.map((card, index) => (
          <View key={index} style={styles.savedCard}>
            <Image source={{ uri: card.image }} style={styles.cardImage} />
            <Text>{card.message}</Text>
            <TouchableOpacity onPress={() => shareCard(card.fileUri)} style={styles.shareButton}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  cardContainer: {
    width: 300,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    padding: 10,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  textInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  saveButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  savedCardsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  savedCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  shareButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
});
