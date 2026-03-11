import { useLocalStorage } from './useLocalStorage';
import { DailyCheckin, User } from '../types';
import { INITIAL_HISTORY, calculateCheckinStats } from '../data/mockData';
import { useMemo } from 'react';
import { getBeijingTime } from '../lib/utils';

export function useCheckinData() {
  const [checkins, setCheckins] = useLocalStorage<DailyCheckin[]>('team_checkins', INITIAL_HISTORY);

  const getCheckin = (userId: string, date: string) => {
    return checkins.find(c => c.userId === userId && c.date === date);
  };

  const saveCheckin = (checkin: DailyCheckin) => {
    const updatedCheckin = calculateCheckinStats(checkin);
    setCheckins(prev => {
      const index = prev.findIndex(c => c.id === updatedCheckin.id);
      if (index >= 0) {
        const newCheckins = [...prev];
        newCheckins[index] = updatedCheckin;
        return newCheckins;
      }
      return [...prev, updatedCheckin];
    });
  };

  const getDailyDonation = (date: string, members: User[]) => {
    const teamMembers = members.filter(m => m.id !== 'admin');
    const teamMemberIds = new Set(teamMembers.map(m => m.id));
    const dayCheckins = checkins.filter(c => c.date === date && teamMemberIds.has(c.userId));
    
    const totalMembers = teamMembers.length;
    const checkedInCount = dayCheckins.length;
    const notCheckedInCount = totalMembers - checkedInCount;
    
    const now = getBeijingTime();
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const currentHour = now.getHours();
    const isAfter10PM = currentHour >= 22;
    
    const actualDailyDonation = dayCheckins.reduce((sum, c) => sum + c.donationAmount, 0) + (notCheckedInCount * 9000);
    
    if (date === todayStr && !isAfter10PM) {
      return 0;
    }
    return actualDailyDonation;
  };

  const getDonationHistory = (members: User[]) => {
    const teamMembers = members.filter(m => m.id !== 'admin');
    const dates = Array.from(new Set(checkins.map(c => c.date))).sort((a, b) => (b as string).localeCompare(a as string)) as string[];
    
    return dates.map(date => {
      const dayCheckins = checkins.filter(c => c.date === date);
      const checkedInUserIds = new Set(dayCheckins.map(c => c.userId));
      
      const details: any[] = [];
      
      // 1. Check-ins with missed tasks
      dayCheckins.forEach(c => {
        if (c.donationAmount > 0) {
          const user = teamMembers.find(m => m.id === c.userId);
          if (user) {
            const missedTasks = [];
            if (!c.wakeUpAt8) missedTasks.push("早起");
            if (!c.focusOneHour) missedTasks.push("专注");
            if (!c.exercise30Min) missedTasks.push("运动");
            if (!c.read10Pages) missedTasks.push("阅读");
            if (!c.learnNewSkill) missedTasks.push("技能");
            if (!c.noJunkFood) missedTasks.push("饮食");
            if (c.challengeNote.trim().length === 0) missedTasks.push("记录");
            
            details.push({
              name: user.name,
              reason: missedTasks.length > 0 ? `未完成: ${missedTasks.join(', ')}` : "其他",
              amount: c.donationAmount
            });
          }
        }
      });
      
      // 2. Not checked in
      teamMembers.forEach(m => {
        if (!checkedInUserIds.has(m.id)) {
          details.push({
            name: m.name,
            reason: "未打卡",
            amount: 9000
          });
        }
      });

      const now = getBeijingTime();
      const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const currentHour = now.getHours();
      const isAfter10PM = currentHour >= 22;
      
      const isTodayBefore10 = date === todayStr && !isAfter10PM;
      const finalAmount = isTodayBefore10 ? 0 : getDailyDonation(date, members);
      const finalDetails = isTodayBefore10 ? details.map(d => ({ ...d, amount: 0 })) : details;

      return {
        date,
        amount: finalAmount,
        details: finalDetails
      };
    });
  };

  const getTeamStats = (date: string, members: User[]) => {
    const teamMembers = members.filter(m => m.id !== 'admin');
    const teamMemberIds = new Set(teamMembers.map(m => m.id));
    const dayCheckins = checkins.filter(c => c.date === date && teamMemberIds.has(c.userId));
    
    const totalMembers = teamMembers.length;
    const checkedInCount = dayCheckins.length;
    const notCheckedInCount = totalMembers - checkedInCount;
    
    const totalDonation = getDailyDonation(date, members);
    
    // Total accumulated donation across all history
    const history = getDonationHistory(members);
    const totalAccumulatedDonation = history.reduce((sum, h) => sum + h.amount, 0);
    
    const missingNoteCount = dayCheckins.filter(c => c.challengeNote.trim().length === 0).length;
    const averageCompletionRate = checkedInCount > 0 
      ? dayCheckins.reduce((sum, c) => sum + c.completionRate, 0) / totalMembers 
      : 0;

    return {
      totalMembers,
      checkedInCount,
      notCheckedInCount,
      totalDonation,
      totalAccumulatedDonation,
      missingNoteCount,
      averageCompletionRate
    };
  };

  const getPersonalStats = (userId: string) => {
    const userCheckins = checkins
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalDays = userCheckins.length;
    const totalDonation = userCheckins.reduce((sum, c) => sum + c.donationAmount, 0);
    const averageRate = totalDays > 0 
      ? userCheckins.reduce((sum, c) => sum + c.completionRate, 0) / totalDays 
      : 0;

    // Calculate streak
    let streakDays = 0;
    const now = getBeijingTime();
    const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const yesterdayDate = new Date(now.getTime() - 86400000);
    const yesterday = `${yesterdayDate.getFullYear()}-${(yesterdayDate.getMonth() + 1).toString().padStart(2, '0')}-${yesterdayDate.getDate().toString().padStart(2, '0')}`;
    
    let currentCheckDate = userCheckins[0]?.date === today ? today : (userCheckins[0]?.date === yesterday ? yesterday : null);
    
    if (currentCheckDate) {
      streakDays = 1;
      for (let i = 1; i < userCheckins.length; i++) {
        const prevDate = new Date(new Date(currentCheckDate).getTime() - 86400000).toISOString().split('T')[0];
        if (userCheckins[i].date === prevDate) {
          streakDays++;
          currentCheckDate = prevDate;
        } else {
          break;
        }
      }
    }

    return {
      totalDays,
      totalDonation,
      averageRate,
      streakDays,
      history: userCheckins
    };
  };

  const cheerTeammate = (targetUserId: string, date: string, fromUserName: string) => {
    setCheckins(prev => {
      const index = prev.findIndex(c => c.userId === targetUserId && c.date === date);
      if (index >= 0) {
        const newCheckins = [...prev];
        const currentCheers = newCheckins[index].cheers || [];
        if (!currentCheers.includes(fromUserName)) {
          newCheckins[index] = {
            ...newCheckins[index],
            cheers: [...currentCheers, fromUserName]
          };
        }
        return newCheckins;
      } else {
        // Create a placeholder checkin for the user if it doesn't exist
        const newCheckin: DailyCheckin = {
          id: `${targetUserId}-${date}`,
          userId: targetUserId,
          date: date,
          wakeUpAt8: false,
          focusOneHour: false,
          exercise30Min: false,
          read10Pages: false,
          learnNewSkill: false,
          noJunkFood: false,
          challengeNote: '',
          completedCount: 0,
          completionRate: 0,
          donationAmount: 9000,
          updatedAt: new Date().toISOString(),
          country: '中国',
          cheers: [fromUserName]
        };
        return [...prev, newCheckin];
      }
    });
  };

  return {
    checkins,
    getCheckin,
    saveCheckin,
    getTeamStats,
    getPersonalStats,
    getDonationHistory,
    cheerTeammate
  };
}
