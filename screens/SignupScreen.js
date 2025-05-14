// /ConsentApp/screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { API_URL, COLORS, SIZES } from '../constants';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        firstName,
        lastName,
      });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('authToken', token);
      await login(email, password);
      Alert.alert('Succès', 'Inscription réussie !');
    } catch (error) {
      console.error('Erreur lors de l’inscription :', error.response?.data || error.message);
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Inscription...' : 'S’inscrire'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLoginNavigation}>
        <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontLarge,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontMedium,
    color: '#fff',
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});