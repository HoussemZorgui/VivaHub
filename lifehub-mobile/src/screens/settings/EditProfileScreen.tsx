import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useToastStore } from '../../store/toastStore';

import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export const EditProfileScreen = () => {
    const navigation = useNavigation<any>();
    const showToast = useToastStore(state => state.showToast);
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        bio: user?.bio || '',
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await authService.updateProfile({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phoneNumber: formData.phone.trim(),
                bio: formData.bio.trim(),
            });

            if (response.success) {
                updateUser(response.data.user);
                showToast('Profil mis à jour avec succès !', 'success');
                setTimeout(() => navigation.goBack(), 1500);
            }
        } catch (error: any) {
            showToast(error.message || 'Erreur lors de la mise à jour.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, field: keyof typeof formData, icon: any, multiline = false) => (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, multiline && styles.textAreaWrapper]}>
                <Ionicons name={icon} size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    value={formData[field]}
                    onChangeText={(val) => setFormData({ ...formData, [field]: val })}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    multiline={multiline}
                />
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#050505']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier le Profil</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary[400]} />
                        ) : (
                            <Text style={styles.saveBtn}>Enregistrer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.changePicBtn}>
                                <LinearGradient
                                    colors={theme.colors.gradients.premium as any}
                                    style={styles.changePicGradient}
                                >
                                    <Ionicons name="camera" size={18} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.changePicText}>Changer la photo</Text>
                    </View>

                    <View style={styles.form}>
                        {renderInput('Prénom', 'firstName', 'person-outline')}
                        {renderInput('Nom', 'lastName', 'person-outline')}
                        {renderInput('Email', 'email', 'mail-outline')}
                        {renderInput('Téléphone', 'phone', 'call-outline')}
                        {renderInput('Bio', 'bio', 'book-outline', true)}
                    </View>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 25,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    saveBtn: {
        color: theme.colors.primary[400],
        fontSize: 16,
        fontWeight: '700',
    },
    content: { padding: 25 },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    changePicBtn: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#050505',
    },
    changePicGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePicText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginTop: 15,
        fontWeight: '600',
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 8,
        marginLeft: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 18,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textAreaWrapper: {
        height: 120,
        alignItems: 'flex-start',
        paddingTop: 15,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
    }
});
