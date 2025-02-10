import React, { useState } from 'react';
import { useUsers, User, UserStats, PermissionTemplate } from '../hooks/useUsers';
import { Shield, UserPlus, Settings, Activity, Trash2, Search, Filter, Save } from 'lucide-react';

interface Props {
  channelId: string;
}

export function UserManagement({ channelId }: Props) {
  const {
    users,
    templates,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    getUserStats,
    addAdmin,
    updatePermissions,
    removeAdmin,
    bulkUpdatePermissions,
    savePermissionTemplate
  } = useUsers(channelId);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    try {
      const stats = await getUserStats(user.id);
      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleBulkAction = async (action: 'permissions' | 'remove') => {
    if (action === 'permissions' && selectedTemplate) {
      await bulkUpdatePermissions(selectedUsers, selectedTemplate.permissions);
    }
    setSelectedUsers([]);
  };

  const handleSaveTemplate = async () => {
    if (selectedUser && newTemplateName) {
      await savePermissionTemplate(newTemplateName, selectedUser.permissions);
      setShowTemplateModal(false);
      setNewTemplateName('');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">حدث خطأ: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">إجمالي المشرفين</h3>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">المشرفون النشطون</h3>
          <div className="text-2xl font-bold">
            {users.filter(u => new Date(u.last_sign_in) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">الصلاحيات النشطة</h3>
          <div className="text-2xl font-bold">
            {new Set(users.flatMap(u => u.permissions)).size}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث عن مستخدم..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={roleFilter || ''}
          onChange={(e) => setRoleFilter(e.target.value || null)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">جميع الأدوار</option>
          <option value="owner">مالك</option>
          <option value="admin">مشرف</option>
          <option value="editor">محرر</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between mb-4">
          <span className="text-blue-700">تم تحديد {selectedUsers.length} مستخدم</span>
          <div className="flex gap-2">
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => setSelectedTemplate(templates.find(t => t.id === e.target.value) || null)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">اختر قالب صلاحيات</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <button
              onClick={() => handleBulkAction('permissions')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              تطبيق الصلاحيات
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(users.map(u => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المستخدم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الدور
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصلاحيات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                آخر تسجيل دخول
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserSelect(user)}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {user.permissions.map((permission, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.last_sign_in).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTemplateModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAdmin(user.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details */}
      {selectedUser && userStats && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">تفاصيل المستخدم</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h4 className="text-sm text-gray-500">إجمالي الرسائل</h4>
              <p className="text-xl font-semibold">{userStats.total_messages}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">آخر نشاط</h4>
              <p className="text-xl font-semibold">
                {new Date(userStats.last_activity).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">معدل التفاعل</h4>
              <p className="text-xl font-semibold">{userStats.engagement_rate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">سجل النشاط</h4>
            <div className="space-y-2">
              {userStats.activity_logs.map((log) => (
                <div key={log.id} className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{log.action}</span>
                  <span className="text-gray-400">
                    {new Date(log.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">حفظ قالب صلاحيات</h3>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="اسم القالب"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}