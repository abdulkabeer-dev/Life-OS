import React from 'react';
import { useLifeOS } from '../context/LifeOSContext';
import { Trophy, Star, Target, Zap, TrendingUp, Award, Book, Briefcase, Lock } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  condition: (data: any) => boolean;
  color: string;
}

const Achievements: React.FC = () => {
  const { data } = useLifeOS();

  const badges: Badge[] = [
    {
      id: 'task_novice',
      name: 'Task Novice',
      description: 'Complete 10 tasks',
      icon: CheckCircle,
      color: 'text-blue-500',
      condition: (d) => d.tasks.filter((t: any) => t.completed).length >= 10
    },
    {
      id: 'task_master',
      name: 'Task Master',
      description: 'Complete 50 tasks',
      icon: Star,
      color: 'text-yellow-500',
      condition: (d) => d.tasks.filter((t: any) => t.completed).length >= 50
    },
    {
      id: 'goal_getter',
      name: 'Goal Getter',
      description: 'Complete 3 goals',
      icon: Target,
      color: 'text-purple-500',
      condition: (d) => d.goals.filter((g: any) => g.completed).length >= 3
    },
    {
      id: 'consistent_learner',
      name: 'Bookworm',
      description: 'Log 5 learning sessions',
      icon: Book,
      color: 'text-pink-500',
      condition: (d) => d.learnings.length >= 5
    },
    {
      id: 'wealth_builder',
      name: 'Wealth Builder',
      description: 'Accumulate positive balance > $1000',
      icon: TrendingUp,
      color: 'text-green-500',
      condition: (d) => {
        const inc = d.finance.transactions.filter((t: any) => t.type === 'income').reduce((a: any, b: any) => a + b.amount, 0);
        const exp = d.finance.transactions.filter((t: any) => t.type === 'expense').reduce((a: any, b: any) => a + b.amount, 0);
        return (inc - exp) > 1000;
      }
    },
    {
      id: 'job_hunter',
      name: 'Job Hunter',
      description: 'Apply to 5 jobs',
      icon: Briefcase,
      color: 'text-indigo-500',
      condition: (d) => d.career.applications.length >= 5
    },
    {
        id: 'habit_hero',
        name: 'Habit Hero',
        description: 'Maintain a habit streak of 7 days',
        icon: Zap,
        color: 'text-orange-500',
        condition: (d) => {
            // Simplified streak check
            return d.health.habits.some((h: any) => h.completions.length >= 7);
        }
    }
  ];

  const unlockedBadges = badges.filter(b => b.condition(data));
  const lockedBadges = badges.filter(b => !b.condition(data));

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="glass-card rounded-xl p-8 text-center bg-gradient-to-b from-bg-tertiary to-transparent">
            <Trophy size={48} className="mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-2">Achievement Center</h2>
            <p className="text-gray-400">Track your milestones and gamify your life progress.</p>
            <div className="mt-6 inline-block bg-bg-primary border border-border px-6 py-2 rounded-full">
                <span className="font-bold text-accent">{unlockedBadges.length}</span>
                <span className="text-gray-500 mx-2">/</span>
                <span className="text-gray-400">{badges.length} Unlocked</span>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="text-accent" /> Unlocked Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {unlockedBadges.map(badge => (
                    <div key={badge.id} className="glass-card rounded-xl p-5 border-l-4 border-l-accent flex items-center gap-4 hover:bg-bg-tertiary transition-colors">
                        <div className={`p-3 rounded-lg bg-bg-primary border border-border ${badge.color}`}>
                            <badge.icon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold">{badge.name}</h4>
                            <p className="text-xs text-gray-400">{badge.description}</p>
                        </div>
                    </div>
                ))}
                {unlockedBadges.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-8">No badges unlocked yet. Keep pushing!</p>
                )}
            </div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-500"><Lock size={20} /> Locked</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-70">
                {lockedBadges.map(badge => (
                    <div key={badge.id} className="glass-card rounded-xl p-5 border border-border flex items-center gap-4 grayscale">
                        <div className="p-3 rounded-lg bg-bg-tertiary">
                            <badge.icon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-300">{badge.name}</h4>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

// Helper icon
const CheckCircle = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default Achievements;