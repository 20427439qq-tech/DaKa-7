import { User, DailyCheckin, CheckinTask } from '../types';

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
  { id: 'admin', name: '管理员', roles: ['admin'], password: '20262026', studentId: 0 },
];

export const INITIAL_TASKS: CheckinTask[] = [
  { id: 't1', title: '早安打卡', description: '08:00之前在群里发早上好', type: 'image', order: 1, deadline: '08:00' },
  { id: 't2', title: '半小时冥想', description: '每天半小时冥想，22点之前发冥想记录', type: 'checkbox', order: 2, deadline: '22:00' },
  { id: 't3', title: '每天运动', description: '万步是基础，其他运动可选项，发群里', type: 'image', order: 3 },
  { id: 't4', title: '抄经', description: '22点前完成抄经', type: 'image', order: 4, deadline: '22:00' },
  { id: 't5', title: '读经', description: '22点前完成读经', type: 'audio', order: 5, deadline: '22:00' },
  { id: 't6', title: '时间管理', description: '22点前完成时间管理', type: 'image', order: 6, deadline: '22:00' },
  { id: 't7', title: '作业', description: '22点前完成作业', type: 'file', order: 7, deadline: '22:00' },
  { id: 't8', title: '挑战记录', description: '写出真实的挑战过程、反思、感受或收获', type: 'text', order: 8 },
];

export const calculateCheckinStats = (checkin: DailyCheckin, tasks: CheckinTask[] = INITIAL_TASKS): DailyCheckin => {
  const totalTasks = tasks.length;
  let completedCount = 0;

  tasks.forEach(task => {
    const value = checkin.taskValues?.[task.id];
    if (task.type === 'checkbox') {
      if (value === true) completedCount++;
    } else if (value && value.toString().trim().length > 0) {
      completedCount++;
    }
  });
  
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  
  // 1000 per missed task, plus 2000 base penalty if not all tasks are completed
  const donationAmount = completedCount === totalTasks ? 0 : (totalTasks - completedCount) * 1000 + 2000;
    
  return {
    ...checkin,
    completedCount,
    completionRate,
    donationAmount
  };
};

export const INITIAL_HISTORY: DailyCheckin[] = [];
