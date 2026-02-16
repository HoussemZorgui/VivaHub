import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const HealthScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Santé & Fitness</Text>
                <Text style={styles.subtitle}>Suivez votre forme, votre sommeil et votre nutrition.</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Ionicons name="heart-outline" size={48} color="#ef4444" />
                    <Text style={styles.cardTitle}>Tracker Santé</Text>
                    <Text style={styles.cardText}>L'intégration Google Fit et Nutritionix est en cours de développement.</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: { padding: 30, paddingTop: 60, backgroundColor: '#121212' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: theme.colors.text.secondary, marginTop: 5 },
    content: { padding: 25 },
    card: {
        backgroundColor: '#121212',
        padding: 40,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.glass
    },
    cardTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#fff' },
    cardText: { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', marginTop: 10 },
});
