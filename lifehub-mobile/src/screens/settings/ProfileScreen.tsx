import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

import { useAuthStore } from '../../store/authStore';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuthStore();

    const menuItems = [
        { icon: 'person-outline', label: 'Nom complet', value: `${user?.firstName} ${user?.lastName}` },
        { icon: 'mail-outline', label: 'Email', value: user?.email },
        { icon: 'call-outline', label: 'Téléphone', value: user?.phoneNumber || 'Non renseigné' },
        { icon: 'notifications-outline', label: 'Notifications', value: 'Activées' },
        { icon: 'shield-checkmark-outline', label: 'Sécurité', value: 'MFA Activé' },
        { icon: 'help-circle-outline', label: 'Aide & Support', value: '' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#1a1a2e', '#050505']}
                style={styles.header}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Animated.View entering={FadeInUp.delay(200)} style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                    <Text style={styles.userRole}>Membre Premium</Text>

                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <LinearGradient
                            colors={theme.colors.gradients.premium as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.editBtnGradient}
                        >
                            <Text style={styles.editBtnText}>Modifier le profil</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>

            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(400)} style={styles.statsCard}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>12</Text>
                        <Text style={styles.statLab}>Tâches</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>85%</Text>
                        <Text style={styles.statLab}>Santé</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>2.4k</Text>
                        <Text style={styles.statLab}>Points</Text>
                    </View>
                </Animated.View>

                {menuItems.map((item, index) => (
                    <Animated.View key={index} entering={FadeInDown.delay(500 + index * 100)}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuIconBox}>
                                <Ionicons name={item.icon as any} size={22} color={theme.colors.primary[400]} />
                            </View>
                            <View style={styles.menuLabelBox}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                {item.value !== '' && <Text style={styles.menuValue}>{item.value}</Text>}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <Animated.View entering={FadeInDown.delay(1200)}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                        <Text style={styles.logoutText}>Déconnexion</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileInfo: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary[400],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#050505',
    },
    userName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    userRole: {
        fontSize: 14,
        color: theme.colors.primary[400],
        fontWeight: '700',
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    editBtn: {
        marginTop: 25,
        width: 200,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    editBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    content: { padding: 25 },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        borderRadius: 30,
        padding: 25,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...theme.shadows.glass,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    statLab: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 18,
        borderRadius: 22,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    menuIconBox: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuLabelBox: {
        flex: 1,
    },
    menuLabel: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    menuValue: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 20,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 10,
    }
});
