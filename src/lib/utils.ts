import { Check, X, AlertCircle, Info, Calendar, User, LogOut, TrendingUp, Award, DollarSign, ChevronRight, Search, Filter, Eye, EyeOff, Plus, RefreshCw, Edit, Trash2, PieChart, Circle, FileText, Users, Star, Plane, Heart, MessageCircle } from 'lucide-react';

export const Icons = {
  Check,
  X,
  AlertCircle,
  Info,
  Calendar,
  User,
  LogOut,
  TrendingUp,
  Award,
  DollarSign,
  ChevronRight,
  Search,
  Filter,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  PieChart,
  Circle,
  FileText,
  Users,
  Star,
  Plane,
  Heart,
  MessageCircle
};

export const MOTIVATIONAL_QUOTES = [
  "每天进步一点点，自律让成长看得见。",
  "记录过程，比结果更重要。",
  "用行动塑造习惯，用坚持定义未来。",
  "今天的坚持，会成为明天的底气。",
  "自律不是约束，而是自由。",
  "每一个微小的努力，都在积攒改变的力量。",
  "别让平庸消磨了你的志气。",
  "你的努力，终将闪耀。",
  "坚持下去，你会感谢现在的自己。",
  "自律是通往成功的唯一捷径。",
  "每一个清晨，都是重新出发的机会。",
  "别在最该奋斗的年纪选择安逸。",
  "你的汗水，是成长的勋章。",
  "成功没有奇迹，只有轨迹。",
  "每一份坚持，都是对未来的投资。",
  "越努力，越幸运。",
  "别让借口成为你退缩的理由。",
  "你的潜力，远比你想象的更强大。",
  "坚持不懈，直到成功。",
  "自律的人，掌控自己的人生。",
  "每一天的打卡，都是对自我的肯定。",
  "你的坚持，值得被看见。",
  "别在黎明前放弃。",
  "成功属于那些永不言败的人。",
  "你的梦想，需要你的行动去支撑。",
  "每一份努力，都不会被辜负。",
  "自律是最高级的自由。",
  "坚持是一种品质，更是一种力量。",
  "你的未来，由你现在的每一个选择决定。",
  "别让懒惰偷走了你的梦想。",
  "每一天的进步，都是向目标迈进的一步。",
  "你的坚持，是最好的证明。",
  "成功是点滴积累的结果。",
  "自律是成功的基石。",
  "每一份汗水，都会开出绚烂的花。",
  "别让犹豫阻碍了你的脚步。",
  "你的努力，是通往梦想的阶梯。",
  "坚持到底，就是胜利。",
  "自律让你更自信。",
  "每一天的打卡，都是成长的足迹。",
  "你的坚持，会让你变得更优秀。",
  "成功没有捷径，只有脚踏实地。",
  "自律是人生的必修课。",
  "每一份坚持，都是对生命的尊重。",
  "别让平庸限制了你的想象力。",
  "你的努力，终会得到回报。",
  "坚持不懈，终成大器。",
  "自律是成功的开始。",
  "每一天的进步，都值得庆贺。",
  "你的未来，掌握在自己手中。"
];

export const getRandomQuote = () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getBeijingTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
};

export const COUNTRY_TIMEZONES: Record<string, string> = {
  "中国": "Asia/Shanghai",
  "美国 (纽约)": "America/New_York",
  "美国 (洛杉矶)": "America/Los_Angeles",
  "英国": "Europe/London",
  "日本": "Asia/Tokyo",
  "德国": "Europe/Berlin",
  "法国": "Europe/Paris",
  "澳大利亚 (悉尼)": "Australia/Sydney",
  "加拿大 (多伦多)": "America/Toronto",
  "新加坡": "Asia/Singapore",
  "韩国": "Asia/Seoul",
  "泰国": "Asia/Bangkok",
  "越南": "Asia/Ho_Chi_Minh",
  "印度": "Asia/Kolkata",
  "俄罗斯 (莫斯科)": "Europe/Moscow",
  "巴西 (圣保罗)": "America/Sao_Paulo",
  "阿联酋 (迪拜)": "Asia/Dubai",
};

export const getTimeForCountry = (countryName: string) => {
  const timezone = COUNTRY_TIMEZONES[countryName] || "Asia/Shanghai";
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
};
