import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Tentative de connexion avec :', { email, password });
      const { token, user } = await login(email, password);
      console.log('Connexion réussie');
      if (token && user) {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error.message, error);
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupNavigation = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignupNavigation}>
        <Text style={styles.signupText}>Pas de compte ? S'inscrire</Text>
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
  signupText: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});
