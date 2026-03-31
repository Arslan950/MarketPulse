import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';

export function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/trend-command');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to review demand shifts, product signals, and the latest activity across your MarketPulse workspace."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-500 hover:text-emerald-400">
            Create one
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          type="email"
          placeholder="you@company.com"
          defaultValue="demo@marketpulse.com"
        />
        <AuthField
          label="Password"
          type="password"
          placeholder="Enter your password"
          defaultValue="Demo@123"
        />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Login
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/forgotPassword"
          className="text-sm font-medium text-muted-foreground transition hover:text-emerald-500"
        >
          Forgot Password?
        </Link>
      </div>
    </AuthLayout>
  );
}
