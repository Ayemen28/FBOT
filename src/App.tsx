import React, { useState, lazy, Suspense } from 'react';
import { Layout, BarChart3, Users, Settings, MessageSquare, Activity, Link, Menu, X, Bell, Shield, Tags, BookTemplate as Template, Bot, Database } from 'lucide-react';
import { BotConnection } from './components/BotConnection';

// Mock data for demonstration
const mockChannels = [
  { id: 1, name: 'قناة الأخبار', category: 'أخبار', subscribers: 1200, status: 'نشط', language: 'العربية' },
  { id: 2, name: 'قناة التعليم', category: 'تعليم', subscribers: 800, status: 'نشط', language: 'العربية' },
  { id: 3, name: 'قناة الترفيه', category: 'ترفيه', subscribers: 1500, status: 'نشط', language: 'العربية' },
];

const mockStats = [
  { label: 'إجمالي المشتركين', value: '3,500', change: '+12%' },
  { label: 'معدل التفاعل', value: '68%', change: '+5%' },
  { label: 'المنشورات اليوم', value: '24', change: '+8%' },
];

function App() {
  const [activeSection, setActiveSection] = useState('channels');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const menuItems = [
    { id: 'channels', label: 'إدارة القنوات', icon: <Layout className="w-5 h-5" /> },
    { id: 'users', label: 'إدارة المستخدمين', icon: <Users className="w-5 h-5" /> },
    { id: 'content', label: 'إدارة المحتوى', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'stats', label: 'التقارير والإحصائيات', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'templates', label: 'القوالب الجاهزة', icon: <Template className="w-5 h-5" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
    { id: 'integrations', label: 'التكامل', icon: <Link className="w-5 h-5" /> },
    { id: 'security', label: 'الأمان والصلاحيات', icon: <Shield className="w-5 h-5" /> },
    { id: 'ai', label: 'الذكاء الاصطناعي', icon: <Bot className="w-5 h-5" /> },
    { id: 'bot', label: 'اتصال البوت', icon: <MessageSquare className="w-5 h-5" /> }> },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: <Database className="w-5 h-5" /> },
    { id: 'activity', label: 'سجل النشاط', icon: <Activity className="w-5 h-5" /> },
  ];

  const categories = ['الكل', 'أخبار', 'تعليم', 'ترفيه'];

  const renderContent = () => {
    switch (activeSection) {
      case 'channels':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {mockStats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-sm text-gray-500 mb-2">{stat.label}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Channels Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم القناة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التصنيف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المشتركين
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اللغة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockChannels
                    .filter(channel => selectedCategory === 'الكل' || channel.category === selectedCategory)
                    .map((channel) => (
                      <tr key={channel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {channel.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {channel.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {channel.subscribers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {channel.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {channel.language}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <div className="h-32 flex items-center justify-center text-gray-400">
              محتوى قيد التطوير
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-right transition-colors
                ${activeSection === item.id 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-40">
          <aside className="w-64 h-full bg-white overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            </div>
            <nav className="flex-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-right transition-colors
                    ${activeSection === item.id 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;