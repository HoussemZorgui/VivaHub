import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

interface Task {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    reminder: boolean;
}

export const TasksScreen = () => {
    const [activeTab, setActiveTab] = useState('À faire');
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Finaliser le rapport financier', category: 'Travail', completed: false, priority: 'high', reminder: true },
        { id: '2', title: 'Séance de sport - 45 min', category: 'Santé', completed: false, priority: 'medium', reminder: false },
        { id: '3', title: 'Acheter des légumes frais', category: 'Personnel', completed: true, priority: 'low', reminder: false },
        { id: '4', title: 'Appeler le designer UI/UX', category: 'Travail', completed: false, priority: 'high', reminder: true },
        { id: '5', title: 'Méditation matinale', category: 'Mental', completed: true, priority: 'low', reminder: false },
    ]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const toggleReminder = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, reminder: !t.reminder } : t));
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            default: return '#10b981';
        }
    };

    const renderTask = ({ item: task, drag, isActive }: RenderItemParams<Task>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.taskCard,
                        isActive && styles.activeTaskCard,
                        { opacity: isActive ? 0.9 : 1 }
                    ]}
                    onPress={() => toggleTask(task.id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <TouchableOpacity
                        style={[styles.checkbox, task.completed && styles.checked]}
                        onPress={() => toggleTask(task.id)}
                    >
                        {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </TouchableOpacity>

                    <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
                            {task.title}
                        </Text>
                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{task.category}</Text>
                            </View>
                            {task.reminder && (
                                <View style={styles.reminderTag}>
                                    <Ionicons name="notifications" size={12} color={theme.colors.primary[400]} />
                                    <Text style={styles.reminderText}>Rappel IA</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.notifBtn}
                        onPress={() => toggleReminder(task.id)}
                    >
                        <Ionicons
                            name={task.reminder ? "notifications" : "notifications-outline"}
                            size={20}
                            color={task.reminder ? theme.colors.primary[400] : "rgba(255,255,255,0.2)"}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    const filteredTasks = tasks.filter(t =>
        activeTab === 'Terminées' ? t.completed : !t.completed
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1a1a2e', '#050505']}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.welcome}>Mes Objectifs</Text>
                            <Text style={styles.date}>Mardi 17 Février</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <LinearGradient
                                colors={[theme.colors.primary[400], theme.colors.primary[600]]}
                                style={styles.profileGradient}
                            >
                                <Ionicons name="add" size={28} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            placeholder="Rechercher une tâche..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            style={styles.searchInput}
                        />
                    </View>

                    <View style={styles.tabBar}>
                        {['À faire', 'Terminées'].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.overviewRow}>
                        <View style={styles.overviewCard}>
                            <Text style={styles.overVal}>{tasks.filter(t => !t.completed).length}</Text>
                            <Text style={styles.overLab}>En cours</Text>
                        </View>
                        <View style={styles.overviewCard}>
                            <Text style={styles.overVal}>{tasks.filter(t => t.completed).length}</Text>
                            <Text style={styles.overLab}>Terminées</Text>
                        </View>
                    </View>

                    <DraggableFlatList
                        data={filteredTasks}
                        onDragEnd={({ data }) => setTasks(data)}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTask}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={<View style={{ height: 120 }} />}
                    />
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    welcome: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    date: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 2,
    },
    profileBtn: {
        width: 50,
        height: 50,
        borderRadius: 18,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    profileGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
        fontSize: 14,
    },
    tabBar: {
        flexDirection: 'row',
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    tabText: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '700',
    },
    activeTabText: {
        color: '#fff',
    },
    content: { flex: 1, paddingHorizontal: 25, paddingTop: 25 },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    overviewCard: {
        width: '47%',
        backgroundColor: '#121212',
        padding: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    overVal: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    overLab: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 5,
        fontWeight: '600',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        padding: 15,
        borderRadius: 22,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        elevation: 5,
    },
    activeTaskCard: {
        borderColor: theme.colors.primary[400],
        borderWidth: 1.5,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    priorityBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    checked: {
        backgroundColor: theme.colors.primary[400],
        borderColor: theme.colors.primary[400],
    },
    taskInfo: { flex: 1 },
    taskTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    taskCompleted: {
        color: 'rgba(255,255,255,0.2)',
        textDecorationLine: 'line-through',
    },
    tagRow: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 8,
    },
    tagText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    reminderTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    reminderText: {
        color: theme.colors.primary[400],
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    notifBtn: {
        padding: 5,
    }
});
