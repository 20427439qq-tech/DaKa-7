import React from 'react';
import { DailyCheckin, User } from '../../types';
import { Icons, formatCurrency } from '../../lib/utils';

interface CheckinTableProps {
  checkins: DailyCheckin[];
  members: User[];
  selectedDate: string;
  onViewDetail: (checkin: DailyCheckin) => void;
}

export const CheckinTable: React.FC<CheckinTableProps> = ({ checkins, members, selectedDate, onViewDetail }) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isBefore10PM = now.getHours() < 22;
  const hideDonation = selectedDate === todayStr && isBefore10PM;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">姓名</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">1</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">2</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">3</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">4</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">5</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">6</th>
              <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">7</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">完成情况</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">乐捐金额</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">打卡时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.filter(m => m.id !== 'admin').map(member => {
              const checkin = checkins.find(c => c.userId === member.id);
              const donationAmount = hideDonation ? 0 : (checkin ? checkin.donationAmount : 9000);
              
              return (
                <tr 
                  key={member.id} 
                  onClick={() => checkin && onViewDetail(checkin)}
                  className={`transition-colors ${checkin ? 'cursor-pointer hover:bg-emerald-50/50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  
                  {[
                    checkin?.wakeUpAt8,
                    checkin?.focusOneHour,
                    checkin?.exercise30Min,
                    checkin?.read10Pages,
                    checkin?.learnNewSkill,
                    checkin?.noJunkFood
                  ].map((status, i) => (
                    <td key={i} className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        {status === undefined ? (
                          <div className="w-4 h-4 rounded-full bg-gray-100" />
                        ) : status ? (
                          <Icons.Check className="text-emerald-500" size={16} />
                        ) : (
                          <Icons.X className="text-red-400" size={16} />
                        )}
                      </div>
                    </td>
                  ))}
                  
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      {checkin === undefined ? (
                        <div className="w-4 h-4 rounded-full bg-gray-100" />
                      ) : checkin.challengeNote.trim().length > 0 ? (
                        <Icons.Check className="text-emerald-500" size={16} />
                      ) : (
                        <Icons.X className="text-red-400" size={16} />
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${checkin?.completionRate || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {checkin?.completedCount || 0}/7
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${donationAmount ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurrency(donationAmount)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {checkin ? (
                      <span className="text-sm font-bold text-gray-600">
                        {new Date(checkin.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 font-bold">未打卡</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
