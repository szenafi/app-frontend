import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import PartnerSelector from '../components/PartnerSelector';
import ConsentCard from '../components/ConsentCard';
import { COLORS, SIZES } from '../constants';
import { api } from '../utils/api';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';

const steps = [
  'PARTNER',
  'PREVIEW',
];

export default function ConsentWizard() {
  const [step, setStep] = useState(0);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validation biométrique obligatoire avant création
      const biometric = await LocalAuthentication.authenticateAsync({ promptMessage: 'Validez avec votre empreinte digitale' });
      if (!biometric.success) {
        setLoading(false);
        Alert.alert('Erreur', 'Validation biométrique requise pour signer le consentement.');
        return;
      }
      const consentData = {
        partnerEmail: partner.email,
        consentData: {
          message: `Je consens à avoir une relation sexuelle avec ${partner.firstName || partner.email}`,
        },
      };
      await api.post('/api/consent', consentData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.replace('/dashboard');
      }, 1800);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création du consentement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === 0 ? (
        <PartnerSelector value={partner} onSelect={setPartner} onNext={handleNext} />
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.title}>Consentement sexuel</Text>
          {/* Card designer ergonomique et moderne */}
          <ConsentCard
            consent={{
              user: { firstName: 'Moi', avatarUrl: '' },
              partner: partner && typeof partner === 'object' ? partner : { firstName: '', avatarUrl: '' },
              message: partner && partner.firstName ? `Je consens à avoir une relation sexuelle avec ${partner.firstName}.` : '',
              createdAt: new Date().toISOString(),
              status: 'PENDING',
            }}
            userId={-1}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Signer avec empreinte digitale'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontLarge,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  label: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 4,
  },
  partner: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  message: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.radius,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: SIZES.fontMedium,
    fontFamily: 'Poppins-Bold',
  },
});
