import { Check, X, AlertCircle, Info, Calendar, User, LogOut, TrendingUp, Award, DollarSign, ChevronRight, Search, Filter, Eye, EyeOff, Plus, RefreshCw, Edit, Trash2, PieChart, Circle, FileText, Users, Star, Shield } from 'lucide-react';

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
  Shield
};

export const MOTIVATIONAL_QUOTES = [
  "每天进步一点点",
  "自律让成长看得见",
  "记录过程，比结果更重要",
  "用行动塑造习惯",
  "今天的坚持，会成为明天的底气"
];

export const getRandomQuote = () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount);
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};
