import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user and bot settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsBotEnabled(data.settings?.isBotEnabled ?? false);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBotEnabled }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Profile Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="flex items-center space-x-4 mb-4">
          {user.profileImage && (
            <img 
              src={user.profileImage} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{user.displayName}</p>
            <p className="text-gray-600">@{user.login}</p>
          </div>
        </div>
      </section>

      {/* Bot Settings Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Bot Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Enable Bot</h3>
              <p className="text-sm text-gray-600">
                If enabled, the bot 'MyAiBot' will automatically join your stream when you go live. 
                If disabled, it will not join or perform any functions.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isBotEnabled}
                onChange={(e) => setIsBotEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                            peer-focus:ring-blue-300 rounded-full peer 
                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                            after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        
        {message && (
          <p className={message.includes('success') ? 'text-green-500' : 'text-red-500'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
} 