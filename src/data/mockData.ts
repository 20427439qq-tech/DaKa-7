import { User, DailyCheckin, TaskConfig, TaskKey } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: '王凡', roles: ['member'], password: '2026', studentId: 1 },
  { id: 'u2', name: '张亮', roles: ['member'], password: '2026', studentId: 2 },
  { id: 'u3', name: '曹婷婷', roles: ['member'], password: '2026', studentId: 3 },
  { id: 'u4', name: '吴琼瑛', roles: ['member'], password: '2026', studentId: 4 },
  { id: 'u5', name: '周海鹏', roles: ['member'], password: '2026', studentId: 5 },
  { id: 'u6', name: '尹连鹏', roles: ['member'], password: '2026', studentId: 6 },
  { id: 'u7', name: '楼文妤', roles: ['member'], password: '2026', studentId: 7 },
  { id: 'u8', name: '杨娟', roles: ['member'], password: '2026', studentId: 8 },
  { id: 'u9', name: '王微微', roles: ['member'], password: '2026', studentId: 9 },
  { id: 'u10', name: '罗慧', roles: ['member'], password: '2026', studentId: 10 },
  { id: 'u11', name: '谢恩治', roles: ['member'], password: '2026', studentId: 11 },
  { id: 'u12', name: '王小龙', roles: ['member'], password: '2026', studentId: 12 },
  { id: 'admin', name: '管理员', roles: ['admin', 'jiwei'], password: '20262026', studentId: 0 },
];

export const TASKS: TaskConfig[] = [
  { key: 'wakeUpAt8', title: '早起打卡', description: '每天早晨八点之前起床' },
  { key: 'focusOneHour', title: '深度沉浸', description: '一个小时的无打扰时间' },
  { key: 'exercise30Min', title: '每日运动', description: '半小时中等强度运动' },
  { key: 'read10Pages', title: '每日阅读', description: '每天阅读至少十页书' },
  { key: 'learnNewSkill', title: '技能进阶', description: '学习一个新技能或新知识点' },
  { key: 'noJunkFood', title: '健康饮食', description: '不吃垃圾食品（油炸、高糖等）' },
];

export const calculateCheckinStats = (checkin: DailyCheckin): DailyCheckin => {
  const booleanTasks: TaskKey[] = [
    'wakeUpAt8', 'focusOneHour', 'exercise30Min', 
    'read10Pages', 'learnNewSkill', 'noJunkFood'
  ];
  
  const completedBooleans = booleanTasks.filter(key => checkin[key]).length;
  const noteCompleted = checkin.challengeNote.trim().length > 0;
  
  const completedCount = completedBooleans + (noteCompleted ? 1 : 0);
  const completionRate = (completedCount / 7) * 100;
  
  const donationAmount = 
    (6 - completedBooleans) * 1000 + 
    (noteCompleted ? 0 : 3000);
    
  return {
    ...checkin,
    completedCount,
    completionRate,
    donationAmount
  };
};

export const INITIAL_HISTORY: DailyCheckin[] = [];
