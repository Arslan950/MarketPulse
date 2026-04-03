import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';

export function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`http://localhost:3000/api/v1/auth/reset-password/${token}`, { 
        newPassword 
      });

      setMessage(response.data.message || 'Password successfully changed! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Please enter your new password below."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <div className="p-3 text-sm text-red-500 rounded-lg bg-red-50">{error}</div>}
        {message && <div className="p-3 text-sm rounded-lg text-emerald-600 bg-emerald-50">{message}</div>}

        <AuthField 
          label="New Password" 
          type="password" 
          allowPasswordToggle
          placeholder="••••••••" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold text-white rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
