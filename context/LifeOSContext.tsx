import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
    AppData, Task, Goal, Transaction, Habit, LearningLog, Reminder,
    JobApplication, Project, PortfolioItem, Certification, Skill, SocialLink, UserProfile,
    HifzItem, HifzStatus, AzkarItem, TasbihWidget, PrayerTracker
} from '../types';
import { generateId } from '../utils';
import { auth, db, googleProvider } from '../firebase';
import {
    signOut,
    onAuthStateChanged,
    User,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const DEFAULT_AZKAR: AzkarItem[] = [
    { id: 'azk_1', text: 'Ayat al-Kursi', category: 'morning', count: 0, target: 1, completed: false },
    { id: 'azk_2', text: 'SubhanAllah', category: 'morning', count: 0, target: 33, completed: false },
    { id: 'azk_3', text: 'Alhamdulillah', category: 'morning', count: 0, target: 33, completed: false },
    { id: 'azk_4', text: 'Allahu Akbar', category: 'morning', count: 0, target: 33, completed: false },
    { id: 'azk_5', text: 'Ayat al-Kursi', category: 'evening', count: 0, target: 1, completed: false },
    { id: 'azk_6', text: 'Amanar-Rasul (Surah Baqarah last 2 verses)', category: 'evening', count: 0, target: 1, completed: false },
    { id: 'azk_7', text: 'Surah Al-Mulk', category: 'sleep', count: 0, target: 1, completed: false },
    { id: 'azk_8', text: 'SubhanAllah wa bihamdihi', category: 'general', count: 0, target: 100, completed: false },
];

const DEFAULT_TASBIH: TasbihWidget[] = [
    { id: 'tsb_1', label: 'General Tasbih', count: 0, target: 100 },
    { id: 'tsb_2', label: 'Istighfar', count: 0, target: 1000 },
];

const DEFAULT_DATA: AppData = {
    profile: { name: 'User', title: 'LifeOS Explorer' },
    tasks: [],
    goals: [],
    learnings: [],
    health: { workouts: [], habits: [], weight: [], energy: [] },
    finance: { transactions: [], budgets: [], savings: [] },
    career: { applications: [], interviews: [], goals: [] },
    freelance: { projects: [], clients: [], timeEntries: [] },
    portfolio: { items: [], certifications: [], skills: [], links: [] },
    islam: {
        quran: { currentJuz: 1, currentPage: 1, totalKhatams: 0, lastReadDate: new Date().toISOString() },
        hifz: [],
        dailyAzkar: DEFAULT_AZKAR,
        tasbihs: DEFAULT_TASBIH,
        prayerTracker: {
            date: new Date().toDateString(),
            fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false
        },
        prayerHistory: []
    },
    reminders: [],
    settings: { theme: 'dark' }
};

interface LifeOSContextType {
    data: AppData;
    user: User | null;
    loading: boolean;
    login: () => void;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    registerWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    activeNotification: Reminder | null;
    clearActiveNotification: () => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    importData: (jsonData: string) => boolean;
    clearData: () => void;

    addTask: (task: Partial<Task>) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    addGoal: (goal: Partial<Goal>) => void;
    updateGoal: (goal: Goal) => void;
    deleteGoal: (id: string) => void;
    addTransaction: (transaction: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addLearning: (log: Partial<LearningLog>) => void;
    deleteLearning: (id: string) => void;

    // Health
    addHabit: (habit: Partial<Habit>) => void;
    toggleHabit: (id: string) => void;
    deleteHabit: (id: string) => void;
    addWorkout: (workout: any) => void;
    deleteWorkout: (id: string) => void;
    addWeightEntry: (entry: any) => void;
    deleteWeightEntry: (id: string) => void;

    // Reminders
    addReminder: (reminder: Partial<Reminder>) => void;
    deleteReminder: (id: string) => void;
    dismissReminder: (id: string) => void;

    addApplication: (app: Partial<JobApplication>) => void;
    updateApplicationStatus: (id: string, status: JobApplication['status']) => void;
    deleteApplication: (id: string) => void;
    addProject: (project: Partial<Project>) => void;
    updateProject: (project: Project) => void;
    deleteProject: (id: string) => void;

    // Portfolio
    addPortfolioItem: (item: Partial<PortfolioItem>) => void;
    deletePortfolioItem: (id: string) => void;
    addCertification: (cert: Partial<Certification>) => void;
    deleteCertification: (id: string) => void;
    addSkill: (skill: Partial<Skill>) => void;
    deleteSkill: (id: string) => void;
    addLink: (link: Partial<SocialLink>) => void;
    deleteLink: (id: string) => void;

    // Islam
    updateQuranProgress: (page: number, juz: number) => void;
    addHifzItem: (item: Partial<HifzItem>) => void;
    updateHifzStatus: (id: string, status: HifzStatus) => void;
    deleteHifzItem: (id: string) => void;
    togglePrayer: (prayer: keyof Omit<PrayerTracker, 'date'>) => void;
    incrementAzkar: (id: string, amount?: number) => void;
    addAzkarItem: (item: Partial<AzkarItem>) => void;
    deleteAzkarItem: (id: string) => void;
    resetAzkar: () => void;
    updateTasbih: (id: string, count: number) => void;
    addTasbih: (label: string, target: number) => void;
    deleteTasbih: (id: string) => void;
    resetTasbih: (id: string) => void;

    toggleTheme: (theme?: 'dark' | 'light') => void;
    saveData: () => void;
}

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

export const LifeOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData>(DEFAULT_DATA);
    const [user, setUser] = useState<User | null>(null);
    const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);
    const [loading, setLoading] = useState(true);
    const isRemoteUpdate = useRef(false);

    // Authentication & Data Sync
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Load from Firestore with Realtime Listener
                const unsubDoc = onSnapshot(
                    doc(db, "users", currentUser.uid),
                    {
                        next: (docSnap) => {
                            if (docSnap.exists()) {
                                const remoteData = docSnap.data() as AppData;
                                // Deep Merge defaults
                                const merged = {
                                    ...DEFAULT_DATA,
                                    ...remoteData,
                                    settings: { ...DEFAULT_DATA.settings, ...remoteData.settings },
                                    islam: {
                                        ...DEFAULT_DATA.islam,
                                        ...remoteData.islam,
                                        dailyAzkar: remoteData.islam?.dailyAzkar || DEFAULT_AZKAR,
                                        tasbihs: remoteData.islam?.tasbihs || DEFAULT_TASBIH
                                    }
                                };

                                isRemoteUpdate.current = true;
                                setData(merged);
                            } else {
                                // New user, save default
                                saveDataToFirestore(DEFAULT_DATA, currentUser.uid);
                            }
                            setLoading(false);
                        },
                        error: (error) => {
                            console.error("Firestore Error:", error);
                            // Fallback to local default data on permission error to prevent infinite loading
                            setLoading(false);
                        }
                    }
                );
                return () => unsubDoc();
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const loginWithEmail = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const registerWithEmail = async (email: string, pass: string) => {
        await createUserWithEmailAndPassword(auth, email, pass);
    };

    const logout = () => signOut(auth);

    const saveDataToFirestore = async (newData: AppData, uid: string) => {
        try {
            await setDoc(doc(db, "users", uid), newData, { merge: true });
        } catch (e) {
            console.error("Error saving data: ", e);
        }
    };

    const saveData = () => {
        if (user) {
            saveDataToFirestore(data, user.uid);
        }
    };

    // Auto-Save Effect
    useEffect(() => {
        if (user && !loading) {
            if (isRemoteUpdate.current) {
                isRemoteUpdate.current = false;
                return;
            }
            const timeoutId = setTimeout(() => {
                saveDataToFirestore(data, user.uid);
            }, 1000); // Debounce saves by 1s
            return () => clearTimeout(timeoutId);
        }
    }, [data, user, loading]);

    useEffect(() => {
        if (data.settings.theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [data.settings.theme]);

    // --- Notification Polling Logic ---
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            let needsUpdate = false;
            let newReminders = [...data.reminders];

            newReminders = newReminders.map(r => {
                if (!r.notified && !r.dismissed && new Date(r.time) <= now) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification("LifeOS Reminder", { body: r.text, icon: '/favicon.ico' });
                    }
                    setActiveNotification(r);
                    needsUpdate = true;
                    return { ...r, notified: true };
                }
                return r;
            });

            if (needsUpdate) {
                setData(prev => ({ ...prev, reminders: newReminders }));
            }
        };

        const interval = setInterval(checkReminders, 30000);
        return () => clearInterval(interval);
    }, [data.reminders]);

    const clearActiveNotification = () => setActiveNotification(null);

    const updateProfile = (profile: Partial<UserProfile>) => {
        setData(prev => ({ ...prev, profile: { ...prev.profile, ...profile } }));
    };

    const importData = (jsonData: string): boolean => {
        try {
            const parsed = JSON.parse(jsonData);
            if (!parsed.tasks || !parsed.settings) throw new Error("Invalid format");
            const newData = {
                ...DEFAULT_DATA,
                ...parsed,
            };
            setData(newData);
            return true;
        } catch (e) {
            console.error("Import failed", e);
            return false;
        }
    };

    const clearData = () => setData({ ...DEFAULT_DATA, settings: data.settings });

    // --- CRUD Methods with Automated Reminder Sync ---

    const addTask = (task: Partial<Task>) => {
        const id = generateId();
        const newTask: Task = {
            id,
            title: task.title!,
            description: task.description || '',
            priority: task.priority || 'low',
            dueDate: task.dueDate || null,
            goalId: task.goalId || null,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        let newReminder: Reminder | null = null;
        if (newTask.dueDate) {
            newReminder = {
                id: generateId(),
                text: `Task Due: ${newTask.title}`,
                time: newTask.dueDate,
                type: 'deadline',
                priority: newTask.priority,
                notified: false,
                dismissed: false,
                link: 'tasks',
                relatedId: id
            };
        }

        setData(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask],
            reminders: newReminder ? [...prev.reminders, newReminder] : prev.reminders
        }));
    };

    const toggleTask = (id: string) => {
        setData(prev => {
            const task = prev.tasks.find(t => t.id === id);
            if (!task) return prev;
            const isCompleted = !task.completed;

            return {
                ...prev,
                tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: isCompleted, completedAt: isCompleted ? new Date().toISOString() : null } : t),
                reminders: isCompleted
                    ? prev.reminders.map(r => r.relatedId === id ? { ...r, dismissed: true } : r)
                    : prev.reminders
            };
        });
    };

    const deleteTask = (id: string) => {
        setData(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id),
            reminders: prev.reminders.filter(r => r.relatedId !== id)
        }));
    };

    const addGoal = (goal: Partial<Goal>) => {
        const id = generateId();
        const newGoal: Goal = {
            id,
            title: goal.title!,
            description: goal.description || '',
            category: goal.category || 'personal',
            timeframe: goal.timeframe || 'monthly',
            deadline: goal.deadline || null,
            checklistItems: [],
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        let newReminder: Reminder | null = null;
        if (newGoal.deadline) {
            newReminder = {
                id: generateId(),
                text: `Goal Deadline: ${newGoal.title}`,
                time: newGoal.deadline,
                type: 'deadline',
                priority: 'high',
                notified: false,
                dismissed: false,
                link: 'goals',
                relatedId: id
            };
        }

        setData(prev => ({
            ...prev,
            goals: [...prev.goals, newGoal],
            reminders: newReminder ? [...prev.reminders, newReminder] : prev.reminders
        }));
    };

    const updateGoal = (updatedGoal: Goal) => {
        setData(prev => {
            let reminders = [...prev.reminders];
            const existingReminderIndex = reminders.findIndex(r => r.relatedId === updatedGoal.id);

            if (updatedGoal.deadline) {
                if (existingReminderIndex >= 0) {
                    reminders[existingReminderIndex] = {
                        ...reminders[existingReminderIndex],
                        text: `Goal Deadline: ${updatedGoal.title}`,
                        time: updatedGoal.deadline,
                        dismissed: updatedGoal.completed
                    };
                } else if (!updatedGoal.completed) {
                    reminders.push({
                        id: generateId(),
                        text: `Goal Deadline: ${updatedGoal.title}`,
                        time: updatedGoal.deadline,
                        type: 'deadline',
                        priority: 'high',
                        notified: false,
                        dismissed: false,
                        link: 'goals',
                        relatedId: updatedGoal.id
                    });
                }
            } else if (existingReminderIndex >= 0) {
                reminders = reminders.filter(r => r.relatedId !== updatedGoal.id);
            }

            return {
                ...prev,
                goals: prev.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g),
                reminders
            };
        });
    };

    const deleteGoal = (id: string) => {
        setData(prev => ({
            ...prev,
            goals: prev.goals.filter(g => g.id !== id),
            reminders: prev.reminders.filter(r => r.relatedId !== id)
        }));
    };

    const addProject = (project: Partial<Project>) => {
        const id = generateId();
        const newProject: Project = {
            id,
            name: project.name!,
            client: project.client!,
            status: project.status || 'active',
            deadline: project.deadline,
            value: project.value || 0
        };

        let newReminder: Reminder | null = null;
        if (newProject.deadline) {
            newReminder = {
                id: generateId(),
                text: `Project Deadline: ${newProject.name}`,
                time: newProject.deadline,
                type: 'deadline',
                priority: 'high',
                notified: false,
                dismissed: false,
                link: 'freelance',
                relatedId: id
            };
        }

        setData(prev => ({
            ...prev,
            freelance: {
                ...prev.freelance,
                projects: [...prev.freelance.projects, newProject]
            },
            reminders: newReminder ? [...prev.reminders, newReminder] : prev.reminders
        }));
    };

    const updateProject = (project: Project) => {
        setData(prev => {
            let reminders = [...prev.reminders];
            const existingReminderIndex = reminders.findIndex(r => r.relatedId === project.id);
            const isCompleted = project.status === 'completed';

            if (project.deadline) {
                if (existingReminderIndex >= 0) {
                    reminders[existingReminderIndex] = {
                        ...reminders[existingReminderIndex],
                        text: `Project Deadline: ${project.name}`,
                        time: project.deadline,
                        dismissed: isCompleted
                    };
                } else if (!isCompleted) {
                    reminders.push({
                        id: generateId(),
                        text: `Project Deadline: ${project.name}`,
                        time: project.deadline,
                        type: 'deadline',
                        priority: 'high',
                        notified: false,
                        dismissed: false,
                        link: 'freelance',
                        relatedId: project.id
                    });
                }
            } else if (existingReminderIndex >= 0) {
                reminders = reminders.filter(r => r.relatedId !== project.id);
            }

            return {
                ...prev,
                freelance: { ...prev.freelance, projects: prev.freelance.projects.map(p => p.id === project.id ? project : p) },
                reminders
            };
        });
    };

    const deleteProject = (id: string) => {
        setData(prev => ({
            ...prev,
            freelance: { ...prev.freelance, projects: prev.freelance.projects.filter(p => p.id !== id) },
            reminders: prev.reminders.filter(r => r.relatedId !== id)
        }));
    };

    const addTransaction = (transaction: Partial<Transaction>) => setData(prev => ({ ...prev, finance: { ...prev.finance, transactions: [{ id: generateId(), description: transaction.description!, amount: transaction.amount || 0, type: transaction.type || 'expense', category: transaction.category || 'other', date: transaction.date || new Date().toISOString() }, ...prev.finance.transactions] } }));
    const deleteTransaction = (id: string) => setData(prev => ({ ...prev, finance: { ...prev.finance, transactions: prev.finance.transactions.filter(t => t.id !== id) } }));
    const addLearning = (log: Partial<LearningLog>) => setData(prev => ({ ...prev, learnings: [{ id: generateId(), topic: log.topic!, details: log.details || '', resource: log.resource || '', timeSpent: log.timeSpent || 0, date: new Date().toISOString() }, ...prev.learnings] }));
    const deleteLearning = (id: string) => setData(prev => ({ ...prev, learnings: prev.learnings.filter(l => l.id !== id) }));

    const addHabit = (habit: Partial<Habit>) => setData(prev => ({ ...prev, health: { ...prev.health, habits: [...prev.health.habits, { id: generateId(), name: habit.name!, icon: habit.icon || '📌', completions: [] }] } }));
    const toggleHabit = (id: string) => {
        const today = new Date().toDateString();
        setData(prev => ({
            ...prev,
            health: {
                ...prev.health,
                habits: prev.health.habits.map(h =>
                    h.id === id
                        ? { ...h, completions: h.completions.includes(today) ? h.completions.filter(d => d !== today) : [...h.completions, today] }
                        : h
                )
            }
        }));
    };
    const deleteHabit = (id: string) => setData(prev => ({ ...prev, health: { ...prev.health, habits: prev.health.habits.filter(h => h.id !== id) } }));
    const addWorkout = (workout: any) => setData(prev => ({ ...prev, health: { ...prev.health, workouts: [{ id: generateId(), ...workout, date: workout.date || new Date().toISOString() }, ...prev.health.workouts] } }));
    const deleteWorkout = (id: string) => setData(prev => ({ ...prev, health: { ...prev.health, workouts: prev.health.workouts.filter((w: any) => w.id !== id) } }));
    const addWeightEntry = (entry: any) => setData(prev => ({ ...prev, health: { ...prev.health, weight: [...prev.health.weight, { id: generateId(), ...entry, date: entry.date || new Date().toISOString() }].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) } }));
    const deleteWeightEntry = (id: string) => setData(prev => ({ ...prev, health: { ...prev.health, weight: prev.health.weight.filter((w: any) => w.id !== id) } }));

    const addReminder = (reminder: Partial<Reminder>) => setData(prev => ({ ...prev, reminders: [...prev.reminders, { id: generateId(), text: reminder.text!, time: reminder.time!, type: reminder.type || 'custom', priority: reminder.priority || 'medium', notified: false, dismissed: false }] }));
    const deleteReminder = (id: string) => setData(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
    const dismissReminder = (id: string) => setData(prev => ({ ...prev, reminders: prev.reminders.map(r => r.id === id ? { ...r, dismissed: true } : r) }));

    const addApplication = (app: Partial<JobApplication>) => setData(prev => ({ ...prev, career: { ...prev.career, applications: [...prev.career.applications, { id: generateId(), role: app.role!, company: app.company!, status: app.status || 'applied', date: new Date().toISOString(), link: app.link || '' }] } }));
    const updateApplicationStatus = (id: string, status: JobApplication['status']) => setData(prev => ({ ...prev, career: { ...prev.career, applications: prev.career.applications.map(a => a.id === id ? { ...a, status } : a) } }));
    const deleteApplication = (id: string) => setData(prev => ({ ...prev, career: { ...prev.career, applications: prev.career.applications.filter(a => a.id !== id) } }));

    const addPortfolioItem = (item: Partial<PortfolioItem>) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, items: [...prev.portfolio.items, { id: generateId(), title: item.title!, description: item.description!, image: item.image, link: item.link }] } }));
    const deletePortfolioItem = (id: string) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, items: prev.portfolio.items.filter(i => i.id !== id) } }));
    const addCertification = (cert: Partial<Certification>) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, certifications: [...prev.portfolio.certifications, { id: generateId(), name: cert.name!, issuer: cert.issuer!, date: cert.date!, url: cert.url }] } }));
    const deleteCertification = (id: string) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, certifications: prev.portfolio.certifications.filter(c => c.id !== id) } }));
    const addSkill = (skill: Partial<Skill>) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, skills: [...prev.portfolio.skills, { id: generateId(), name: skill.name!, level: skill.level || 50 }] } }));
    const deleteSkill = (id: string) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, skills: prev.portfolio.skills.filter(s => s.id !== id) } }));
    const addLink = (link: Partial<SocialLink>) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, links: [...prev.portfolio.links, { id: generateId(), platform: link.platform!, url: link.url! }] } }));
    const deleteLink = (id: string) => setData(prev => ({ ...prev, portfolio: { ...prev.portfolio, links: prev.portfolio.links.filter(l => l.id !== id) } }));

    const toggleTheme = (theme?: 'dark' | 'light') => setData(prev => ({ ...prev, settings: { theme: theme ? theme : (prev.settings.theme === 'dark' ? 'light' : 'dark') } }));

    const updateQuranProgress = (page: number, juz: number) => {
        setData(prev => ({ ...prev, islam: { ...prev.islam, quran: { ...prev.islam.quran, currentPage: page, currentJuz: juz, lastReadDate: new Date().toISOString() } } }));
    };

    const addHifzItem = (item: Partial<HifzItem>) => {
        setData(prev => ({ ...prev, islam: { ...prev.islam, hifz: [...prev.islam.hifz, { id: generateId(), surahName: item.surahName!, juzNumber: item.juzNumber, status: 'new', lastRevised: new Date().toISOString() }] } }));
    };

    const updateHifzStatus = (id: string, status: HifzStatus) => {
        setData(prev => ({ ...prev, islam: { ...prev.islam, hifz: prev.islam.hifz.map(h => h.id === id ? { ...h, status, lastRevised: new Date().toISOString() } : h) } }));
    };

    const deleteHifzItem = (id: string) => {
        setData(prev => ({ ...prev, islam: { ...prev.islam, hifz: prev.islam.hifz.filter(h => h.id !== id) } }));
    };

    const togglePrayer = (prayer: keyof Omit<PrayerTracker, 'date'>) => {
        setData(prev => {
            const newTracker = {
                ...prev.islam.prayerTracker,
                [prayer]: !prev.islam.prayerTracker[prayer]
            };

            const today = newTracker.date;
            const historyIndex = prev.islam.prayerHistory.findIndex(h => h.date === today);
            let newHistory = [...prev.islam.prayerHistory];

            if (historyIndex >= 0) {
                newHistory[historyIndex] = newTracker;
            } else {
                newHistory.push(newTracker);
            }

            return {
                ...prev,
                islam: {
                    ...prev.islam,
                    prayerTracker: newTracker,
                    prayerHistory: newHistory
                }
            };
        });
    };

    const addAzkarItem = (item: Partial<AzkarItem>) => {
        setData(prev => ({
            ...prev,
            islam: {
                ...prev.islam,
                dailyAzkar: [...prev.islam.dailyAzkar, {
                    id: generateId(),
                    text: item.text!,
                    category: item.category || 'general',
                    count: 0,
                    target: item.target || 33,
                    completed: false
                }]
            }
        }));
    };

    const incrementAzkar = (id: string, amount: number = 1) => {
        setData(prev => ({
            ...prev,
            islam: {
                ...prev.islam,
                dailyAzkar: prev.islam.dailyAzkar.map(a => {
                    if (a.id === id) {
                        const newCount = a.count + amount;
                        const completed = newCount >= a.target;
                        return { ...a, count: newCount > a.target ? a.target : newCount, completed };
                    }
                    return a;
                })
            }
        }));
    };

    const resetAzkar = () => {
        setData(prev => ({
            ...prev,
            islam: {
                ...prev.islam,
                dailyAzkar: prev.islam.dailyAzkar.map(a => ({ ...a, count: 0, completed: false }))
            }
        }));
    };

    const deleteAzkarItem = (id: string) => {
        setData(prev => ({ ...prev, islam: { ...prev.islam, dailyAzkar: prev.islam.dailyAzkar.filter(a => a.id !== id) } }));
    };

    const addTasbih = (label: string, target: number) => {
        setData(prev => ({
            ...prev,
            islam: {
                ...prev.islam,
                tasbihs: [...prev.islam.tasbihs, { id: generateId(), label, count: 0, target }]
            }
        }));
    };

    const updateTasbih = (id: string, count: number) => {
        setData(prev => ({
            ...prev,
            islam: {
                ...prev.islam,
                tasbihs: prev.islam.tasbihs.map(t => t.id === id ? { ...t, count } : t)
            }
        }));
    };

    const resetTasbih = (id: string) => {
        updateTasbih(id, 0);
    };

    const deleteTasbih = (id: string) => {
        setData(prev => ({ ...prev, islam: { ...prev.islam, tasbihs: prev.islam.tasbihs.filter(t => t.id !== id) } }));
    };

    return (
        <LifeOSContext.Provider value={{
            data, user, loading, login, loginWithEmail, registerWithEmail, logout, activeNotification, clearActiveNotification,
            updateProfile, importData, clearData,
            addTask, toggleTask, deleteTask,
            addGoal, updateGoal, deleteGoal,
            addTransaction, deleteTransaction,
            addLearning, deleteLearning,
            addHabit, toggleHabit, deleteHabit, addWorkout, deleteWorkout, addWeightEntry, deleteWeightEntry,
            addReminder, deleteReminder, dismissReminder,
            addApplication, updateApplicationStatus, deleteApplication,
            addProject, updateProject, deleteProject,
            addPortfolioItem, deletePortfolioItem, addCertification, deleteCertification,
            addSkill, deleteSkill, addLink, deleteLink,
            updateQuranProgress, addHifzItem, updateHifzStatus, deleteHifzItem, togglePrayer,
            addAzkarItem, incrementAzkar, deleteAzkarItem, resetAzkar,
            addTasbih, updateTasbih, deleteTasbih, resetTasbih,
            toggleTheme, saveData
        }}>
            {children}
        </LifeOSContext.Provider>
    );
};

export const useLifeOS = () => {
  const context = useContext(LifeOSContext);
  if (!context) throw new Error('useLifeOS must be used within a LifeOSProvider');
  return context;
};
