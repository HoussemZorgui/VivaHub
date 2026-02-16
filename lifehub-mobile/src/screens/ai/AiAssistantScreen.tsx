import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const AiAssistantScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Assistant AI</Text>
                <Text style={styles.subtitle}>Votre assistant personnel intelligent.</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Ionicons name="sparkles-outline" size={48} color="#a855f7" />
                    <Text style={styles.cardTitle}>Intelligence Artificielle</Text>
                    <Text style={styles.cardText}>Préparez-vous à une interaction fluide avec GPT-4 et HuggingFace.</Text>
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
