
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './LoadingSpinner';

export default function BotConnection() {
  const [botToken, setBotToken] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [status, setStatus] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      await Promise.all([loadBotToken(), loadRecentMessages()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBotToken() {
    try {
      const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      if (data?.bot_token) {
        setBotToken(data.bot_token);
      }
    } catch (error) {
      console.error('Error loading bot token:', error);
      setStatus('خطأ في تحميل التوكن');
    }
  }

  async function checkConnection() {
    try {
      const { data, error } = await supabase
        .from('bot_settings')
        .select('count')
        .limit(1);

      if (error) throw error;
      setConnectionStatus('success');
      setStatus('تم الاتصال بقاعدة البيانات بنجاح');
    } catch (error) {
      setConnectionStatus('error');
      setStatus('فشل الاتصال بقاعدة البيانات');
    }
  }

  async function loadRecentMessages() {
    try {
      const { data, error } = await supabase
        .from('bot_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function saveBotToken() {
    try {
      const { error } = await supabase
        .from('bot_settings')
        .upsert({ bot_token: botToken });

      if (error) throw error;
      setStatus('تم حفظ التوكن بنجاح');
    } catch (error) {
      setStatus('حدث خطأ في حفظ التوكن');
    }
  }

  async function sendTestMessage() {
    if (!botToken) {
      setStatus('الرجاء إدخال توكن البوت أولاً');
      return;
    }
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: '@your_channel_name',
          text: testMessage || 'رسالة اختبار',
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setStatus('تم إرسال الرسالة بنجاح');
        await supabase
          .from('bot_messages')
          .insert({
            message: testMessage,
            status: 'sent'
          });
        loadRecentMessages();
      } else {
        setStatus('فشل في إرسال الرسالة');
      }
    } catch (error) {
      setStatus('حدث خطأ في الاتصال');
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">إعدادات البوت</h2>
        <div className="space-y-4">
          <button
            onClick={checkConnection}
            className={`px-4 py-2 rounded text-white ${
              connectionStatus === 'success' ? 'bg-green-600' :
              connectionStatus === 'error' ? 'bg-red-600' :
              'bg-blue-600'
            }`}
          >
            تحقق من الاتصال
          </button>
          {status && (
            <div className={`mt-2 text-sm ${
              connectionStatus === 'success' ? 'text-green-600' :
              connectionStatus === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {status}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توكن البوت
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={saveBotToken}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            حفظ التوكن
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">اختبار الاتصال</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة الاختبار
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={sendTestMessage}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            إرسال رسالة اختبار
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">آخر الرسائل</h2>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="p-2 border rounded">
              <p className="text-gray-800">{msg.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(msg.created_at).toLocaleString('ar-SA')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
