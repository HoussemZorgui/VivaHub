import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTaskStore, Task } from '../../store/taskStore';
import { notificationService } from '../../services/notification.service';

const { width, height } = Dimensions.get('window');

export const TasksScreen = () => {
    const [activeTab, setActiveTab] = useState('À faire');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { tasks, addTask, toggleTask, toggleReminder, removeTask, reorderTasks } = useTaskStore();

    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('Travail');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [newTaskReminder, setNewTaskReminder] = useState(false);

    useEffect(() => {
        notificationService.registerForPushNotificationsAsync();
    }, []);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;

        // Default reminder date: 5 mins from now for demo, or 1 hour
        const reminderDate = new Date();
        reminderDate.setMinutes(reminderDate.getMinutes() + 5);

        await addTask({
            title: newTaskTitle,
            category: newTaskCategory,
            priority: newTaskPriority,
            reminder: newTaskReminder,
            reminderDate: newTaskReminder ? reminderDate.toISOString() : undefined,
        });

        // Reset and close
        setNewTaskTitle('');
        setNewTaskReminder(false);
        setIsModalVisible(false);
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
                                    <Text style={styles.reminderText}>Rappel Actif</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.taskActions}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => toggleReminder(task.id)}
                        >
                            <Ionicons
                                name={task.reminder ? "notifications" : "notifications-outline"}
                                size={20}
                                color={task.reminder ? theme.colors.primary[400] : "rgba(255,255,255,0.2)"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => removeTask(task.id)}
                        >
                            <Ionicons name="trash-outline" size={20} color="rgba(255,0,0,0.4)" />
                        </TouchableOpacity>
                    </View>
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
                {/* 3D Background */}
                <LinearGradient colors={['#0a0510', '#050505']} style={StyleSheet.absoluteFill} />

                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.welcome}>Productivité</Text>
                            <Text style={styles.date}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                        </View>
                        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalVisible(true)}>
                            <LinearGradient
                                colors={[theme.colors.primary[400], theme.colors.primary[600]]}
                                style={styles.addBtnGradient}
                            >
                                <Ionicons name="add" size={30} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
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
                </View>

                <View style={styles.content}>
                    <View style={styles.overviewRow}>
                        <Animated.View entering={ZoomIn.delay(200)} style={styles.overviewCard}>
                            <Text style={styles.overVal}>{tasks.filter(t => !t.completed).length}</Text>
                            <Text style={styles.overLab}>En d'attente</Text>
                        </Animated.View>
                        <Animated.View entering={ZoomIn.delay(300)} style={styles.overviewCard}>
                            <Text style={styles.overVal}>{tasks.filter(t => t.completed).length}</Text>
                            <Text style={styles.overLab}>Objectifs atteints</Text>
                        </Animated.View>
                    </View>

                    <DraggableFlatList
                        data={filteredTasks}
                        onDragEnd={({ data }) => reorderTasks(data)}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTask}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={<View style={{ height: 120 }} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="list" size={60} color="rgba(255,255,255,0.05)" />
                                <Text style={styles.emptyText}>Aucune tâche pour le moment</Text>
                            </View>
                        }
                    />
                </View>

                {/* Task Add Modal */}
                <Modal
                    visible={isModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            onPress={() => setIsModalVisible(false)}
                        />
                        <Animated.View entering={FadeInDown} style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Nouvelle Tâche</Text>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Qu'avez-vous prévu d'accomplir ?"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                                autoFocus
                            />

                            <Text style={styles.label}>Catégorie</Text>
                            <View style={styles.categoryGrid}>
                                {['Travail', 'Santé', 'Privé', 'Mental'].map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.catPill, newTaskCategory === cat && styles.activeCatPill]}
                                        onPress={() => setNewTaskCategory(cat)}
                                    >
                                        <Text style={[styles.catText, newTaskCategory === cat && styles.activeCatText]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.reminderRow}>
                                <View>
                                    <Text style={styles.label}>Rappel Intelligent</Text>
                                    <Text style={styles.subLabel}>Notification (dans 5 min pour test)</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.toggle, newTaskReminder && styles.toggleActive]}
                                    onPress={() => setNewTaskReminder(!newTaskReminder)}
                                >
                                    <View style={[styles.toggleBall, newTaskReminder && styles.toggleBallActive]} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddTask}>
                                <LinearGradient
                                    colors={[theme.colors.primary[400], theme.colors.primary[600]]}
                                    style={styles.saveBtnGradient}
                                >
                                    <Text style={styles.saveBtnText}>Créer l'objectif</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 25,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    welcome: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    date: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    addBtn: {
        width: 54,
        height: 54,
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.premium,
    },
    addBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 5,
        borderRadius: 18,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        ...theme.shadows.premium,
    },
    tabText: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '700',
    },
    activeTabText: {
        color: theme.colors.primary[400],
    },
    content: { flex: 1, paddingHorizontal: 25 },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    overviewCard: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.02)',
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
        color: 'rgba(255,255,255,0.3)',
        marginTop: 5,
        fontWeight: '600',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 24,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    activeTaskCard: {
        borderColor: theme.colors.primary[400],
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    priorityBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 10,
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
        fontSize: 17,
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    tagText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    reminderTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    reminderText: {
        color: theme.colors.primary[400],
        fontSize: 10,
        fontWeight: '900',
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    taskActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        padding: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.15)',
        marginTop: 15,
        fontSize: 14,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 30,
        paddingBottom: Platform.OS === 'ios' ? 45 : 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: 20,
        color: '#fff',
        fontSize: 16,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 25,
    },
    catPill: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    activeCatPill: {
        borderColor: theme.colors.primary[400],
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    catText: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '600',
    },
    activeCatText: {
        color: '#fff',
    },
    reminderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 35,
    },
    subLabel: {
        color: theme.colors.primary[400],
        fontSize: 11,
        fontWeight: '500',
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 4,
    },
    toggleActive: {
        backgroundColor: theme.colors.primary[400],
    },
    toggleBall: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    toggleBallActive: {
        alignSelf: 'flex-end',
    },
    saveBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        height: 60,
    },
    saveBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
