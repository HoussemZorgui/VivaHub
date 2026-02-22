import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Modal, ScrollView, Platform, Alert, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTaskStore, Task, ReminderLeadTime } from '../../store/taskStore';
import { notificationService, DEFAULT_LEAD_TIMES } from '../../services/notification.service';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useNotificationNavStore } from '../../store/notificationNavStore';

// ─── Preset lead-time options ────────────────────────────────────────────────
const LEAD_TIME_PRESETS: { label: string; lead: ReminderLeadTime }[] = [
    { label: '5 min', lead: { days: 0, hours: 0, minutes: 5 } },
    { label: '15 min', lead: { days: 0, hours: 0, minutes: 15 } },
    { label: '30 min', lead: { days: 0, hours: 0, minutes: 30 } },
    { label: '1 heure', lead: { days: 0, hours: 1, minutes: 0 } },
    { label: '3 heures', lead: { days: 0, hours: 3, minutes: 0 } },
    { label: '1 jour', lead: { days: 1, hours: 0, minutes: 0 } },
    { label: '2 jours', lead: { days: 2, hours: 0, minutes: 0 } },
    { label: '1 semaine', lead: { days: 7, hours: 0, minutes: 0 } },
];

function isSameLead(a: ReminderLeadTime, b: ReminderLeadTime) {
    return a.days === b.days && a.hours === b.hours && a.minutes === b.minutes;
}

function leadLabel(l: ReminderLeadTime): string {
    const preset = LEAD_TIME_PRESETS.find(p => isSameLead(p.lead, l));
    if (preset) return preset.label;
    const parts: string[] = [];
    if (l.days) parts.push(`${l.days}j`);
    if (l.hours) parts.push(`${l.hours}h`);
    if (l.minutes) parts.push(`${l.minutes}min`);
    return parts.join(' ') || 'maintenant';
}

// ─── Component ───────────────────────────────────────────────────────────────
export const TasksScreen = () => {
    // tabs
    const [activeTab, setActiveTab] = useState<'todo' | 'in-progress' | 'completed' | 'urgent'>('todo');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const { tasks, addTask, updateTask, removeTask, reorderTasks, toggleSubTask, addSubTask } = useTaskStore();

    // Always derive from the store so subtask toggles, etc. are reflected live
    const liveTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) ?? null : null;

    // ── form fields ──────────────────────────────────────────────────────────
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Personnel');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>('todo');
    const [reminder, setReminder] = useState(false);
    const [reminderDate, setReminderDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // default: +1h
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [leadTimes, setLeadTimes] = useState<ReminderLeadTime[]>(DEFAULT_LEAD_TIMES);
    const [newSubTask, setNewSubTask] = useState('');
    const [localSubtasks, setLocalSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

    useEffect(() => {
        notificationService.init();
    }, []);

    // ── Handle notification deep-link: open the task that was tapped ─────────
    const { pendingTaskId, setPendingTaskId } = useNotificationNavStore();
    useEffect(() => {
        if (!pendingTaskId) return;
        const task = tasks.find(t => t.id === pendingTaskId);
        if (task) {
            handleEditTask(task);
        }
        setPendingTaskId(null);
    }, [pendingTaskId, tasks]);

    // ── date picker ──────────────────────────────────────────────────────────
    const openDatePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: reminderDate,
                mode: 'date',
                is24Hour: true,
                minimumDate: new Date(),
                onChange: (event, date) => {
                    if (event.type === 'set' && date) {
                        const d = date;
                        DateTimePickerAndroid.open({
                            value: d,
                            mode: 'time',
                            is24Hour: true,
                            onChange: (timeEvent, timeDate) => {
                                if (timeEvent.type === 'set' && timeDate) {
                                    setReminderDate(timeDate);
                                }
                            },
                        });
                    }
                },
            });
        } else {
            setShowDatePicker(true);
        }
    };

    // ── lead time toggle ─────────────────────────────────────────────────────
    const toggleLeadTime = (lead: ReminderLeadTime) => {
        setLeadTimes(prev => {
            const exists = prev.some(l => isSameLead(l, lead));
            if (exists) return prev.filter(l => !isSameLead(l, lead));
            return [...prev, lead];
        });
    };

    // ── form helpers ─────────────────────────────────────────────────────────
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('Personnel');
        setPriority('medium');
        setStatus('todo');
        setReminder(false);
        setReminderDate(new Date(Date.now() + 60 * 60 * 1000));
        setLeadTimes(DEFAULT_LEAD_TIMES);
        setNewSubTask('');
        setLocalSubtasks([]);
        setSelectedTaskId(null);
    };

    const handleSaveTask = async () => {
        if (!title.trim()) return;

        if (reminder && leadTimes.length === 0) {
            Alert.alert('Rappel', 'Sélectionne au moins un délai de rappel.');
            return;
        }

        const taskData = {
            title: title.trim(),
            description,
            category,
            priority,
            status,
            reminder,
            reminderDate: reminder ? reminderDate.toISOString() : undefined,
            leadTimes: reminder ? leadTimes : DEFAULT_LEAD_TIMES,
            subtasks: localSubtasks,
            tags: [],
        };

        if (selectedTaskId) {
            await updateTask(selectedTaskId, taskData);
        } else {
            await addTask(taskData);
        }

        setIsAddModalVisible(false);
        resetForm();
    };

    const handleEditTask = (task: Task) => {
        setSelectedTaskId(task.id);
        setTitle(task.title);
        setDescription(task.description || '');
        setCategory(task.category);
        setPriority(task.priority);
        setStatus(task.status);
        setReminder(task.reminder);
        setLeadTimes(task.leadTimes ?? DEFAULT_LEAD_TIMES);
        setLocalSubtasks(task.subtasks || []);
        if (task.reminderDate) setReminderDate(new Date(task.reminderDate));
        setIsAddModalVisible(true);
    };

    const handleAddSubTask = () => {
        if (!newSubTask.trim()) return;
        setLocalSubtasks(prev => [
            ...prev,
            { id: Math.random().toString(36).substr(2, 5), title: newSubTask.trim(), completed: false }
        ]);
        setNewSubTask('');
    };

    const toggleLocalSubTask = (id: string) => {
        setLocalSubtasks(prev => prev.map(st =>
            st.id === id ? { ...st, completed: !st.completed } : st
        ));
    };

    // ── style helpers ────────────────────────────────────────────────────────
    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'urgent': return '#f43f5e';
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6366f1';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return 'checkmark-circle';
            case 'in-progress': return 'play-circle';
            default: return 'ellipse-outline';
        }
    };

    // ── task card ────────────────────────────────────────────────────────────
    const renderTask = ({ item: task, drag, isActive }: RenderItemParams<Task>) => {
        const completedSubtasks = task.subtasks.filter(s => s.completed).length;
        const totalSubtasks = task.subtasks.length;
        const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

        return (
            <ScaleDecorator activeScale={0.97}>
                <Pressable
                    onPress={() => handleEditTask(task)}
                    onLongPress={drag}
                    delayLongPress={250}
                    style={({ pressed }) => [
                        styles.taskCard,
                        isActive && styles.activeTaskCard,
                        pressed && !isActive && { opacity: 0.85 },
                        { borderLeftColor: getPriorityColor(task.priority), borderLeftWidth: 4 }
                    ]}
                >
                    <View style={styles.taskMain}>
                        {/* Status toggle — stopPropagation so it doesn't also open the modal */}
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                updateTask(task.id, {
                                    status: task.status === 'completed' ? 'todo' : 'completed'
                                });
                            }}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}
                            style={styles.statusTrigger}
                        >
                            <Ionicons
                                name={getStatusIcon(task.status)}
                                size={28}
                                color={task.status === 'completed' ? '#10b981' : 'rgba(255,255,255,0.2)'}
                            />
                        </TouchableOpacity>

                        <View style={styles.taskContent}>
                            <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskCompletedText]}>
                                {task.title}
                            </Text>
                            {task.description ? (
                                <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>
                            ) : null}

                            <View style={styles.taskMeta}>
                                <View style={styles.metaBadge}>
                                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                                    <Text style={styles.metaText}>{task.category}</Text>
                                </View>
                                {totalSubtasks > 0 && (
                                    <View style={styles.metaBadge}>
                                        <Ionicons name="list" size={12} color="rgba(255,255,255,0.4)" />
                                        <Text style={styles.metaText}>{completedSubtasks}/{totalSubtasks}</Text>
                                    </View>
                                )}
                                {task.reminder && (
                                    <View style={styles.metaBadge}>
                                        <Ionicons name="notifications" size={13} color={theme.colors.primary[400]} />
                                        <Text style={[styles.metaText, { color: theme.colors.primary[400] }]}>
                                            {(task.notificationIds ?? []).length} rappels
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {totalSubtasks > 0 && (
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${progress * 100}%` as any,
                                                backgroundColor: progress === 1 ? '#10b981' : theme.colors.primary[400]
                                            }
                                        ]}
                                    />
                                </View>
                            )}
                        </View>

                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.15)" />
                    </View>
                </Pressable>
            </ScaleDecorator>
        );
    };

    const filteredTasks = tasks.filter(t => {
        if (activeTab === 'urgent') return t.priority === 'urgent' && t.status !== 'completed';
        return t.status === activeTab;
    });

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <LinearGradient colors={['#0f172a', '#020617']} style={StyleSheet.absoluteFill} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.greeting}>Mes Objectifs</Text>
                        <Text style={styles.subGreeting}>
                            {tasks.filter(t => t.status !== 'completed').length} tâches actives
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.mainAddBtn}
                        onPress={() => { resetForm(); setIsAddModalVisible(true); }}
                    >
                        <LinearGradient colors={[theme.colors.primary[400], theme.colors.primary[600]]} style={styles.addIconBg}>
                            <Ionicons name="add" size={32} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Tab Bar */}
                <View style={styles.tabScrollContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                        {[
                            { id: 'todo', label: 'À faire', icon: 'list' },
                            { id: 'in-progress', label: 'En cours', icon: 'sync' },
                            { id: 'urgent', label: 'Urgent', icon: 'flame' },
                            { id: 'completed', label: 'Terminées', icon: 'checkmark-done' },
                        ].map(t => (
                            <TouchableOpacity
                                key={t.id}
                                onPress={() => setActiveTab(t.id as any)}
                                style={[styles.tabItem, activeTab === t.id && styles.tabItemActive]}
                            >
                                <Ionicons
                                    name={t.icon as any}
                                    size={18}
                                    color={activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.4)'}
                                />
                                <Text style={[styles.tabLabel, activeTab === t.id && styles.tabLabelActive]}>{t.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Task List */}
                <View style={styles.mainContent}>
                    <DraggableFlatList
                        data={filteredTasks}
                        onDragEnd={({ data }) => reorderTasks(data)}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTask}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <Animated.View entering={FadeInUp} style={styles.emptyWrap}>
                                <View style={styles.emptyIconBg}>
                                    <Ionicons name="sparkles-outline" size={60} color="rgba(255,255,255,0.05)" />
                                </View>
                                <Text style={styles.emptyTitle}>Tout est à jour !</Text>
                                <Text style={styles.emptyDesc}>Profitez de votre temps libre ou créez un nouvel objectif.</Text>
                            </Animated.View>
                        }
                    />
                </View>

                {/* ── Add / Edit Modal ────────────────────────────────── */}
                <Modal
                    visible={isAddModalVisible}
                    transparent
                    animationType="slide"
                    statusBarTranslucent
                    onRequestClose={() => setIsAddModalVisible(false)}
                >
                    {/* Backdrop - only covers the TOP area (above the sheet) */}
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={() => setIsAddModalVisible(false)}
                        />

                        {/* Sheet content */}
                        <View style={styles.modalContent}>
                            <View style={styles.modalIndicator} />

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{liveTask ? '✏️ Modifier' : '✨ Nouveau Projet'}</Text>
                                <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                    <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.2)" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.modalScroll}
                                contentContainerStyle={{ paddingBottom: 40 }}
                                keyboardShouldPersistTaps="handled"
                            >

                                {/* Title */}
                                <TextInput
                                    style={styles.titleInput}
                                    placeholder="Nom de l'objectif..."
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                {/* Description */}
                                <TextInput
                                    style={styles.descInput}
                                    placeholder="Ajouter une description détaillée..."
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                />

                                {/* Category */}
                                <Text style={styles.fieldLabel}>Catégorie</Text>
                                <View style={styles.optionRow}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 10 }}
                                    >
                                        {['Personnel', 'Travail', 'Santé', 'Finance', 'Social'].map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setCategory(cat)}
                                                style={[styles.pill, category === cat && styles.pillActive]}
                                            >
                                                <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Priority */}
                                <Text style={styles.fieldLabel}>Priorité</Text>
                                <View style={styles.priorityGrid}>
                                    {[
                                        { id: 'low', label: 'Basique', color: '#10b981' },
                                        { id: 'medium', label: 'Important', color: '#f59e0b' },
                                        { id: 'high', label: 'Haute', color: '#ef4444' },
                                        { id: 'urgent', label: 'Urgent', color: '#f43f5e' },
                                    ].map(p => (
                                        <TouchableOpacity
                                            key={p.id}
                                            onPress={() => setPriority(p.id as any)}
                                            style={[
                                                styles.prioBtn,
                                                priority === p.id && { backgroundColor: p.color + '20', borderColor: p.color }
                                            ]}
                                        >
                                            <View style={[styles.prioDot, { backgroundColor: p.color }]} />
                                            <Text style={[styles.prioLabel, priority === p.id && { color: '#fff' }]}>{p.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Status */}
                                <Text style={styles.fieldLabel}>Statut</Text>
                                <View style={styles.optionRow}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 10 }}
                                    >
                                        {[
                                            { id: 'todo', label: 'À faire', icon: 'list' },
                                            { id: 'in-progress', label: 'En cours', icon: 'sync' },
                                            { id: 'completed', label: 'Terminée', icon: 'checkmark-done' },
                                        ].map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                onPress={() => setStatus(s.id as any)}
                                                style={[styles.pill, status === s.id && styles.pillActive]}
                                            >
                                                <Ionicons
                                                    name={s.icon as any}
                                                    size={16}
                                                    color={status === s.id ? '#fff' : 'rgba(255,255,255,0.4)'}
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text style={[styles.pillText, status === s.id && styles.pillTextActive]}>{s.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Subtasks */}
                                <Text style={styles.fieldLabel}>Sous-tâches</Text>
                                <View style={styles.subtasksContainer}>
                                    {localSubtasks.map(st => (
                                        <TouchableOpacity
                                            key={st.id}
                                            onPress={() => toggleLocalSubTask(st.id)}
                                            style={styles.subtaskItem}
                                        >
                                            <Ionicons
                                                name={st.completed ? 'checkmark-circle' : 'ellipse-outline'}
                                                size={22}
                                                color={st.completed ? '#10b981' : 'rgba(255,255,255,0.2)'}
                                            />
                                            <Text style={[styles.subtaskTitle, st.completed && styles.taskCompletedText]}>
                                                {st.title}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => setLocalSubtasks(prev => prev.filter(item => item.id !== st.id))}
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.2)" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                    <View style={styles.addSubtaskRow}>
                                        <TextInput
                                            style={styles.subtaskInput}
                                            placeholder="Ajouter une étape..."
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            value={newSubTask}
                                            onChangeText={setNewSubTask}
                                            onSubmitEditing={handleAddSubTask}
                                        />
                                        <TouchableOpacity onPress={handleAddSubTask} style={styles.miniAddBtn}>
                                            <Ionicons name="add" size={24} color={theme.colors.primary[400]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* ── REMINDER SECTION ─────────────────────── */}
                                <View style={styles.reminderSection}>

                                    {/* Toggle header */}
                                    <View style={styles.reminderHeader}>
                                        <View>
                                            <Text style={styles.fieldLabel}>🔔 Rappels intelligents</Text>
                                            <Text style={styles.reminderSubtitle}>
                                                Reçus même app fermée & hors ligne
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setReminder(!reminder)}
                                            style={[styles.toggleWrap, reminder && styles.toggleWrapActive]}
                                        >
                                            <View style={[styles.toggleDot, reminder && styles.toggleDotActive]} />
                                        </TouchableOpacity>
                                    </View>

                                    {reminder && (
                                        <>
                                            {/* Due date button */}
                                            <TouchableOpacity style={styles.datePickerTrigger} onPress={openDatePicker}>
                                                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary[400]} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.triggerLabel}>Date d'échéance</Text>
                                                    <Text style={styles.triggerDate}>
                                                        {reminderDate.toLocaleDateString('fr-FR', {
                                                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                                        })} à {reminderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                                            </TouchableOpacity>

                                            {/* iOS inline picker */}
                                            {showDatePicker && Platform.OS === 'ios' && (
                                                <DateTimePicker
                                                    value={reminderDate}
                                                    mode="datetime"
                                                    is24Hour={true}
                                                    display="spinner"
                                                    minimumDate={new Date()}
                                                    onChange={(event, date) => {
                                                        setShowDatePicker(false);
                                                        if (date) setReminderDate(date);
                                                    }}
                                                    themeVariant="dark"
                                                />
                                            )}

                                            {/* Lead time grid */}
                                            <Text style={styles.leadTimesTitle}>Notifier avant l'échéance :</Text>
                                            <View style={styles.leadTimesGrid}>
                                                {LEAD_TIME_PRESETS.map(({ label, lead }) => {
                                                    const active = leadTimes.some(l => isSameLead(l, lead));
                                                    return (
                                                        <TouchableOpacity
                                                            key={label}
                                                            onPress={() => toggleLeadTime(lead)}
                                                            style={[
                                                                styles.leadPill,
                                                                active && styles.leadPillActive,
                                                            ]}
                                                        >
                                                            {active && (
                                                                <Ionicons name="checkmark" size={13} color={theme.colors.primary[300]} style={{ marginRight: 4 }} />
                                                            )}
                                                            <Text style={[styles.leadPillText, active && styles.leadPillTextActive]}>
                                                                {label}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>

                                            {/* Summary */}
                                            {leadTimes.length > 0 && (
                                                <View style={styles.notifSummary}>
                                                    <Ionicons name="notifications" size={14} color="#10b981" />
                                                    <Text style={styles.notifSummaryText}>
                                                        {leadTimes.length + 1} notification{leadTimes.length > 0 ? 's' : ''} planifiée{leadTimes.length > 0 ? 's' : ''}
                                                        {' '}({leadTimes.map(leadLabel).join(', ')} + à l'échéance)
                                                    </Text>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>

                                {/* Actions */}
                                <View style={styles.modalActions}>
                                    {liveTask && (
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => {
                                                Alert.alert('Supprimer', 'Retirer cet objectif ?', [
                                                    { text: 'Annuler', style: 'cancel' },
                                                    {
                                                        text: 'Supprimer', style: 'destructive',
                                                        onPress: () => {
                                                            removeTask(liveTask.id);
                                                            setIsAddModalVisible(false);
                                                            resetForm();
                                                        }
                                                    },
                                                ]);
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={24} color="#f43f5e" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.mainSaveBtn} onPress={handleSaveTask}>
                                        <LinearGradient
                                            colors={[theme.colors.primary[400], theme.colors.primary[600]]}
                                            style={styles.saveBtnGrad}
                                        >
                                            <Text style={styles.saveBtnTxt}>
                                                {liveTask ? '✅ Mettre à jour' : '🚀 Lancer le projet'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ height: 50 }} />
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </GestureHandlerRootView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 65,
        paddingHorizontal: 25,
        paddingBottom: 15,
    },
    headerInfo: { flex: 1 },
    greeting: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    subGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    mainAddBtn: { width: 56, height: 56, borderRadius: 20, overflow: 'hidden', ...theme.shadows.premium },
    addIconBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    tabScrollContainer: { marginVertical: 15 },
    tabContainer: { paddingHorizontal: 25, gap: 12 },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tabItemActive: { backgroundColor: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)' },
    tabLabel: { marginLeft: 8, fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
    tabLabelActive: { color: '#fff' },

    mainContent: { flex: 1, paddingHorizontal: 25 },

    taskCard: {
        backgroundColor: '#0f172a',
        borderRadius: 24,
        marginBottom: 16,
        padding: 20,
        ...theme.shadows.glass,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    activeTaskCard: { borderColor: theme.colors.primary[400], elevation: 10 },
    taskMain: { flexDirection: 'row', alignItems: 'center' },
    statusTrigger: { marginRight: 15 },
    taskContent: { flex: 1 },
    taskTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
    taskCompletedText: { color: 'rgba(255,255,255,0.2)', textDecorationLine: 'line-through' },
    taskDesc: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10, flexWrap: 'wrap' },
    metaBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 5,
    },
    priorityDot: { width: 6, height: 6, borderRadius: 3 },
    metaText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
    progressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 15, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 2 },

    emptyWrap: { flex: 1, alignItems: 'center', marginTop: 100 },
    emptyIconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.01)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    emptyDesc: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 28,
        paddingTop: 16,
        paddingBottom: 0,
        maxHeight: '88%',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalIndicator: { width: 44, height: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 4 },
    modalTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },
    modalScroll: { flexGrow: 1 },
    titleInput: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
    descInput: { fontSize: 15, color: 'rgba(255,255,255,0.5)', minHeight: 50, marginBottom: 20, marginTop: 6 },
    fieldLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.primary[400], textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 },
    optionRow: { marginBottom: 25 },
    pill: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginRight: 10 },
    pillActive: { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: theme.colors.primary[400] },
    pillText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
    pillTextActive: { color: '#fff' },

    priorityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
    prioBtn: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    prioDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    prioLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },

    subtasksContainer: { marginBottom: 30, gap: 10 },
    subtaskItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 14, gap: 12 },
    subtaskTitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    addSubtaskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    subtaskInput: { flex: 1, fontSize: 15, color: '#fff', paddingVertical: 10 },
    miniAddBtn: { padding: 8 },

    // Reminder Section
    reminderSection: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 20, borderRadius: 24,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
    reminderSubtitle: { fontSize: 11, color: '#10b981', marginTop: 2, fontWeight: '600' },
    toggleWrap: { width: 50, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', padding: 4, marginTop: 2 },
    toggleWrapActive: { backgroundColor: theme.colors.primary[500] },
    toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
    toggleDotActive: { alignSelf: 'flex-end' },

    datePickerTrigger: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: 16, gap: 12,
        backgroundColor: 'rgba(167,139,250,0.08)',
        padding: 14, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
    },
    triggerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    triggerDate: { fontSize: 15, color: '#fff', fontWeight: '700', marginTop: 2 },

    leadTimesTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    leadTimesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    leadPill: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 9,
        borderRadius: 12, borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
    },
    leadPillActive: {
        backgroundColor: 'rgba(167,139,250,0.12)',
        borderColor: theme.colors.primary[400],
    },
    leadPillText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
    leadPillTextActive: { color: '#fff' },

    notifSummary: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        marginTop: 16, backgroundColor: 'rgba(16,185,129,0.08)',
        padding: 12, borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    },
    notifSummaryText: { flex: 1, fontSize: 12, color: '#10b981', fontWeight: '600', lineHeight: 18 },

    modalActions: { flexDirection: 'row', gap: 15 },
    deleteBtn: {
        width: 60, height: 60, borderRadius: 20,
        backgroundColor: 'rgba(244,63,94,0.1)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)',
    },
    mainSaveBtn: { flex: 1, height: 60, borderRadius: 20, overflow: 'hidden' },
    saveBtnGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    saveBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
