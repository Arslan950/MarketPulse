import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';

export function ForgotPassword() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email tied to your account and we’ll send password reset instructions."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-emerald-500 hover:text-emerald-400">
            Back to login
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField label="Email" type="email" placeholder="you@company.com" />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}
