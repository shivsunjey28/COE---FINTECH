import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoadingScreen } from '@/components/LoadingScreen';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <LandingPage />;
};

export default Index;
