import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (localStorage.getItem('token') || token || (isAuthenticated && isAuthenticated())) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">AI Placement Preparation Platform</h1>
        <p className="text-xl text-gray-600 mb-8">Prepare for your dream job with AI-powered guidance</p>
        <div className="space-x-4">
          <button
            onClick={handleGetStarted}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
