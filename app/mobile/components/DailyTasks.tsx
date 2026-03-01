'use client';

import { useState, useEffect } from 'react';
import { Check, Gift, Star, Zap, Target, Calendar } from 'lucide-react';

interface Task {
  id: string;
  icon: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  progress: number;
  total: number;
}

interface DailyTasksProps {
  locale: string;
}

export default function DailyTasks({ locale }: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const isZh = locale === 'zh';

  useEffect(() => {
    loadTasks();
    loadStreak();
  }, [locale]);

  const loadTasks = () => {
    // 从本地存储加载任务进度
    const savedProgress = localStorage.getItem(`daily_tasks_${locale}`);
    const progress = savedProgress ? JSON.parse(savedProgress) : {};

    const defaultTasks: Task[] = [
      {
        id: 'search',
        icon: '🔍',
        name: isZh ? '每日搜索' : 'Daily Search',
        description: isZh ? '完成1次搜索' : 'Complete 1 search',
        reward: 10,
        completed: progress.search >= 1,
        progress: progress.search || 0,
        total: 1,
      },
      {
        id: 'favorite',
        icon: '❤️',
        name: isZh ? '每日收藏' : 'Daily Favorite',
        description: isZh ? '收藏1家企业' : 'Save 1 company',
        reward: 20,
        completed: progress.favorite >= 1,
        progress: progress.favorite || 0,
        total: 1,
      },
      {
        id: 'view',
        icon: '👁️',
        name: isZh ? '每日浏览' : 'Daily View',
        description: isZh ? '浏览3家企业详情' : 'View 3 companies',
        reward: 15,
        completed: progress.view >= 3,
        progress: progress.view || 0,
        total: 3,
      },
      {
        id: 'share',
        icon: '📤',
        name: isZh ? '每日分享' : 'Daily Share',
        description: isZh ? '分享1份报告' : 'Share 1 report',
        reward: 30,
        completed: progress.share >= 1,
        progress: progress.share || 0,
        total: 1,
      },
    ];

    setTasks(defaultTasks);
    
    // 计算总奖励
    const completed = defaultTasks.filter(t => t.completed);
    setTotalReward(completed.reduce((sum, t) => sum + t.reward, 0));
  };

  const loadStreak = () => {
    const savedStreak = localStorage.getItem(`streak_${locale}`);
    setStreak(savedStreak ? parseInt(savedStreak) : 0);
  };

  const updateTaskProgress = (taskId: string, increment: number = 1) => {
    const savedProgress = localStorage.getItem(`daily_tasks_${locale}`);
    const progress = savedProgress ? JSON.parse(savedProgress) : {};
    
    progress[taskId] = (progress[taskId] || 0) + increment;
    localStorage.setItem(`daily_tasks_${locale}`, JSON.stringify(progress));
    
    loadTasks();
  };

  const claimReward = (task: Task) => {
    if (task.completed) {
      // 显示奖励动画
      alert(isZh ? `获得 ${task.reward} 经验值！` : `Got ${task.reward} XP!`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {isZh ? '每日任务' : 'Daily Tasks'}
            </h3>
            <p className="text-xs text-slate-500">
              {isZh ? `连续 ${streak} 天` : `${streak} day streak`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 rounded-full">
          <Star className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">+{totalReward}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>{isZh ? '今日进度' : 'Today\'s Progress'}</span>
          <span>{tasks.filter(t => t.completed).length}/{tasks.length}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
            style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => claimReward(task)}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all
              ${task.completed 
                ? 'bg-green-50 border border-green-100' 
                : 'bg-slate-50 border border-slate-100'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-xl
              ${task.completed ? 'bg-green-100' : 'bg-white'}
            `}>
              {task.completed ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                task.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${task.completed ? 'text-green-700' : 'text-slate-700'}`}>
                {task.name}
              </p>
              <p className="text-xs text-slate-500">
                {task.description}
              </p>
              {!task.completed && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#339999] rounded-full transition-all"
                      style={{ width: `${(task.progress / task.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {task.progress}/{task.total}
                  </p>
                </div>
              )}
            </div>
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${task.completed 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
              }
            `}>
              <Zap className="w-3 h-3" />
              +{task.reward}
            </div>
          </div>
        ))}
      </div>

      {/* Bonus Reward */}
      {tasks.every(t => t.completed) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              {isZh ? '🎉 恭喜！今日任务全部完成！' : '🎉 All tasks completed!'}
            </p>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            {isZh ? '额外奖励：连续打卡经验值 +50%' : 'Bonus: Streak XP +50%'}
          </p>
        </div>
      )}
    </div>
  );
}
