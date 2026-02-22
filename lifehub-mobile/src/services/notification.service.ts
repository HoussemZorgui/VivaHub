import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL HANDLER — show notifications even when app is in foreground
// ─────────────────────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const TASK_CHANNEL_ID = 'task-reminders';
const URGENT_CHANNEL_ID = 'task-urgent';

export interface ReminderLeadTime {
    days: number;
    hours: number;
    minutes: number;
    label?: string;
}

export const DEFAULT_LEAD_TIMES: ReminderLeadTime[] = [
    { days: 1, hours: 0, minutes: 0, label: '1 jour avant' },
    { days: 0, hours: 1, minutes: 0, label: '1 heure avant' },
    { days: 0, hours: 0, minutes: 15, label: '15 min avant' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Emoji set per lead context
// ─────────────────────────────────────────────────────────────────────────────
function getLeadEmoji(lead: ReminderLeadTime): string {
    if (lead.days >= 7) return '📅';
    if (lead.days >= 2) return '🗓️';
    if (lead.days >= 1) return '🌅';
    if (lead.hours >= 3) return '⏳';
    if (lead.hours >= 1) return '🕐';
    if (lead.minutes >= 30) return '⚡';
    if (lead.minutes >= 15) return '🔔';
    return '🚨';
}

function getPriorityEmoji(priority?: string): string {
    switch (priority) {
        case 'urgent': return '🔴';
        case 'high': return '🟠';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '🎯';
    }
}

function buildLeadLabel(lead: ReminderLeadTime): string {
    if (lead.label) return lead.label;
    const parts: string[] = [];
    if (lead.days) parts.push(`${lead.days} jour${lead.days > 1 ? 's' : ''}`);
    if (lead.hours) parts.push(`${lead.hours}h`);
    if (lead.minutes) parts.push(`${lead.minutes} min`);
    return parts.length ? parts.join(' ') + ' avant l\'échéance' : 'À l\'échéance';
}

// ─────────────────────────────────────────────────────────────────────────────
//  Motivational subtitles (shown on iOS, ignored on Android)
// ─────────────────────────────────────────────────────────────────────────────
const MOTIVATIONAL = [
    'Tu peux le faire ! 💪',
    'Reste concentré, tu es presque là !',
    'Chaque effort compte. En avant !',
    'La discipline crée la liberté.',
    'Un pas à la fois — tu avances !',
];
function randomMotivation() {
    return MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
class NotificationService {
    private _permissionGranted = false;

    async init() {
        await this._requestPermissions();
        await this._setupChannels();
    }

    /** @deprecated use init() */
    async registerForPushNotificationsAsync() { await this.init(); }

    // ── Permissions ──────────────────────────────────────────────────────────
    private async _requestPermissions() {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') { this._permissionGranted = true; return; }
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowCriticalAlerts: true,
            },
        });
        this._permissionGranted = status === 'granted';
    }

    // ── Android channels ─────────────────────────────────────────────────────
    private async _setupChannels() {
        if (Platform.OS !== 'android') return;

        // Regular reminders
        await Notifications.setNotificationChannelAsync(TASK_CHANNEL_ID, {
            name: '📋 Rappels de tâches',
            description: 'Notifications de rappel pour vos tâches et objectifs.',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 200, 100, 200],
            lightColor: '#a78bfa',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
        });

        // Urgent / at-due-date
        await Notifications.setNotificationChannelAsync(URGENT_CHANNEL_ID, {
            name: '🚨 Tâches urgentes',
            description: 'Alerte pour les tâches arrivant à échéance.',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 400, 200, 400, 200, 400],
            lightColor: '#f43f5e',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'default',
            enableVibrate: true,
            bypassDnd: false,
            showBadge: true,
        });
    }

    // ── Schedule ─────────────────────────────────────────────────────────────
    async scheduleTaskReminders(
        taskId: string,
        title: string,
        dueDate: Date,
        leadTimes: ReminderLeadTime[] = DEFAULT_LEAD_TIMES,
        priority?: string,
        category?: string,
    ): Promise<string[]> {
        if (!this._permissionGranted) await this._requestPermissions();
        if (!this._permissionGranted) return [];

        const ids: string[] = [];
        const now = Date.now();
        const prioEmoji = getPriorityEmoji(priority);

        for (const lead of leadTimes) {
            const offsetMs =
                lead.days * 86_400_000 +
                lead.hours * 3_600_000 +
                lead.minutes * 60_000;

            const triggerDate = new Date(dueDate.getTime() - offsetMs);
            if (triggerDate.getTime() <= now + 5_000) continue;

            const emoji = getLeadEmoji(lead);
            const leadLabel = buildLeadLabel(lead);

            try {
                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        // ── Title / body ──────────────────────────────────
                        title: `${emoji} ${prioEmoji} ${title}`,
                        body: `${leadLabel} — ne laisse rien au hasard.`,
                        subtitle: randomMotivation(),       // iOS only

                        // ── Data payload for navigation ───────────────────
                        data: { taskId, lead, priority, category },

                        // ── Sound & badge ─────────────────────────────────
                        sound: 'default',
                        badge: 1,

                        // ── Android extras ────────────────────────────────
                        ...(Platform.OS === 'android' && {
                            channelId: TASK_CHANNEL_ID,
                            color: '#a78bfa',
                            largeIcon: 'notification_icon',
                            smallIcon: 'notification_icon',
                        }),
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: triggerDate,
                    },
                });
                ids.push(id);
            } catch (e) {
                console.warn('[Notif] Failed to schedule lead reminder:', e);
            }
        }

        // ── Exact due-date notification (urgent style) ────────────────────
        if (dueDate.getTime() > now + 5_000) {
            try {
                const exactId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `🎯 ${prioEmoji} C'est maintenant — ${title}`,
                        body: `L'heure est venue. Lance-toi maintenant !`,
                        subtitle: 'Appuie pour ouvrir la tâche →',
                        data: { taskId, dueNow: true, priority, category },
                        sound: 'default',
                        badge: 1,
                        ...(Platform.OS === 'android' && {
                            channelId: URGENT_CHANNEL_ID,
                            color: '#f43f5e',
                        }),
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: dueDate,
                    },
                });
                ids.push(exactId);
            } catch (e) {
                console.warn('[Notif] Failed to schedule exact trigger:', e);
            }
        }

        return ids;
    }

    /** @deprecated kept for backward compat */
    async scheduleTaskReminder(taskId: string, title: string, date: Date): Promise<string | null> {
        const ids = await this.scheduleTaskReminders(taskId, title, date);
        return ids[0] ?? null;
    }

    async cancelNotifications(ids: string[]) {
        for (const id of ids) {
            try { await Notifications.cancelScheduledNotificationAsync(id); } catch (_) { }
        }
    }

    /** @deprecated */
    async cancelNotification(id: string) { await this.cancelNotifications([id]); }

    async cancelAllForTask(notificationIds: string[]) {
        await this.cancelNotifications(notificationIds);
    }

    async listScheduled() {
        return Notifications.getAllScheduledNotificationsAsync();
    }
}

export const notificationService = new NotificationService();
