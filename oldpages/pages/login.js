import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { BiLogoTwitch } from 'react-icons/bi';

const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

const Login = () => {
  const router = useRouter();
  const { code, error } = router.query;

  useEffect(() => {
    // Check if we have a success parameter
    if (router.query.login === 'success') {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
      return;
    }

    // Handle OAuth error
    if (error) {
      localStorage.removeItem('isAuthenticated');
      alert('Authentication failed: ' + error);
    }
  }, [router.query, error]);

  const handleTwitchLogin = () => {
    const scopes = [
      'channel:moderate',
      'chat:edit',
      'chat:read',
      'channel:read:redemptions',
      'user:read:email',
      'moderator:read:chatters',
      'channel:manage:broadcast',
      'channel:read:vips',
      'moderator:manage:chat_messages',
      'channel:bot',
      'channel:manage:moderators',
      'moderator:read:followers',
      'user:read:follows',
      'user:write:chat',
      'user:read:chat',
      'user:bot'
    ].join(' ');

    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes}`;
    window.location.href = twitchAuthUrl;
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Welcome to StreamAI</h1>
        <p className="login-description">
          Connect with your Twitch account to start transcribing
        </p>
        <button 
          onClick={handleTwitchLogin} 
          className="twitch-login-button"
        >
          <BiLogoTwitch className="twitch-icon" />
          Login with Twitch
        </button>
      </div>
    </div>
  );
};

export default Login; 