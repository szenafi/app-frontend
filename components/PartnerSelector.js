import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { api } from '../utils/api';

export default function PartnerSelector({ value, onSelect, onNext }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await api.get('/api/user/contacts');
        setContacts(res.data || []); // Correction : le backend retourne un tableau directement
      } catch {
        setContacts([]);
      }
    }
    fetchContacts();
  }, []);

  const filtered = contacts.filter(c =>
    c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choisir un partenaire</Text>
      <TextInput
        style={styles.input}
        placeholder="Recherche par nom ou email"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.contactRow, value?.id === item.id && styles.selected]}
            onPress={() => {
              onSelect(item);
              setTimeout(onNext, 350);
            }}
          >
            <Image source={{ uri: item.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.avatar} />
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding * 2,
  },
  label: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f9fafb',
  },
  selected: {
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#22223b',
    flex: 1,
  },
  email: {
    fontSize: 13,
    color: '#64748b',
  },
});
