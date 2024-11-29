import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AuthCheck = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/validate');
        if (!response.ok && router.pathname !== '/login') {
          router.push('/login');
        }
      } catch (error) {
        if (router.pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Add a proper loading spinner here
  }

  return children;
};

export default AuthCheck; 