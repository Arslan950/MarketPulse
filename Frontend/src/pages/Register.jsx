import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';

export function Register() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up a MarketPulse profile to start tracking retail performance, customer demand, and next-best opportunities."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-500 hover:text-emerald-400">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField label="Full Name" placeholder="Jordan Lee" />
        <AuthField label="Email" type="email" placeholder="jordan@company.com" />
        <AuthField label="Phone Number" type="tel" placeholder="+1 (555) 987-6543" />
        <AuthField label="Password" type="password" placeholder="Create a strong password" />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Send Verification Email
        </Button>
      </form>
    </AuthLayout>
  );
}
