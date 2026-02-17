import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { aiService } from '../../services/ai.service';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export const AIScreen = () => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await aiService.getHistory();
            if (response && response.data) {
                const history = response.data.map((msg: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: msg.text,
                    sender: msg.sender,
                    timestamp: new Date(msg.timestamp),
                }));
                setMessages(history);
            }
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response = await aiService.chat(inputText);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Désolé, je rencontre des difficultés techniques avec Hugging Face. Vérifiez votre connexion ou la clé API.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a1a2e', '#050505']} style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.aiBadge}>
                        <Ionicons name="sparkles" size={16} color={theme.colors.primary[400]} />
                        <Text style={styles.aiBadgeText}>Neural AI</Text>
                    </View>
                    <Text style={styles.headerTitle}>Hugging Face</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <Animated.View
                        key={msg.id}
                        entering={FadeInUp.delay(index * 100)}
                        style={[
                            styles.messageWrapper,
                            msg.sender === 'user' ? styles.userWrapper : styles.aiWrapper
                        ]}
                    >
                        <View style={[
                            styles.messageBubble,
                            msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                        ]}>
                            {msg.sender === 'ai' && (
                                <View style={styles.aiIconBox}>
                                    <Ionicons name="hardware-chip-outline" size={14} color="#fff" />
                                </View>
                            )}
                            <Text style={styles.messageText}>{msg.text}</Text>
                        </View>
                        <Text style={styles.timestamp}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </Animated.View>
                ))}
                {loading && (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator color={theme.colors.primary[400]} size="small" />
                        <Text style={styles.loadingText}>Neural AI réfléchit...</Text>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputArea}>
                    <View style={styles.inputGlass}>
                        <TextInput
                            style={styles.input}
                            placeholder="Posez votre question..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
                            <LinearGradient
                                colors={theme.colors.gradients.premium as any}
                                style={styles.sendGradient}
                            >
                                <Ionicons name="send" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    aiBadgeText: {
        color: theme.colors.primary[400],
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    chatContainer: { flex: 1 },
    chatContent: { padding: 20, paddingBottom: 40 },
    messageWrapper: {
        marginBottom: 20,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
    },
    aiWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 15,
        borderRadius: 22,
        ...theme.shadows.glass,
    },
    userBubble: {
        backgroundColor: theme.colors.primary[600],
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderBottomLeftRadius: 4,
    },
    aiIconBox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: theme.colors.primary[400],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 5,
        marginHorizontal: 5,
    },
    loadingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
        marginTop: 10,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginLeft: 10,
        fontWeight: '600',
    },
    inputArea: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    inputGlass: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 28,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        marginLeft: 10,
    },
    sendGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
