import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';

const VERIFICATION_USER_STORAGE_KEY = 'marketpulse-pending-verification-user-id';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(
    () => window.localStorage.getItem(VERIFICATION_USER_STORAGE_KEY) || '',
  );
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!registeredUserId || isEmailVerified) {
      return undefined;
    }

    let isMounted = true;

    const checkVerificationStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/auth/verification-status/${registeredUserId}`,
        );
        const verified = Boolean(response.data?.data?.isEmailVerified);

        if (!isMounted) {
          return;
        }

        if (verified) {
          setIsEmailVerified(true);
          setSuccessMessage('Email verified successfully. You can sign in now.');
          window.localStorage.removeItem(VERIFICATION_USER_STORAGE_KEY);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error.response?.status === 400 || error.response?.status === 404) {
          setRegisteredUserId('');
          window.localStorage.removeItem(VERIFICATION_USER_STORAGE_KEY);
        }
      }
    };

    checkVerificationStatus();

    const intervalId = window.setInterval(checkVerificationStatus, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [registeredUserId, isEmailVerified]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setRegisteredUserId('');
    window.localStorage.removeItem(VERIFICATION_USER_STORAGE_KEY);
    setIsEmailVerified(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/register',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const createdUser = response.data?.data?.user;
      const createdUserId = createdUser?._id || '';
      const emailVerified = Boolean(createdUser?.isEmailVerified);

      setRegisteredUserId(createdUserId);
      setIsEmailVerified(emailVerified);
      setSuccessMessage(
        response.data?.message || 'Registration successful. Please check your email for verification.',
      );

      if (createdUserId && !emailVerified) {
        window.localStorage.setItem(VERIFICATION_USER_STORAGE_KEY, createdUserId);
      }

      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
      });
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const firstValidationError =
        Array.isArray(validationErrors) && validationErrors.length > 0
          ? Object.values(validationErrors[0])[0]
          : null;

      setErrorMessage(
        firstValidationError ||
          error.response?.data?.message ||
          error.message ||
          'Unable to register right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate(`/get-started/${registeredUserId}`);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up a MarketPulse profile to start tracking retail performance, customer demand, and next-best opportunities."
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-500 hover:text-emerald-400">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          label="Full Name"
          name="fullName"
          placeholder="Jhon doe"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <AuthField
          label="Email"
          type="email"
          name="email"
          placeholder="gndecProject@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <AuthField
          label="Phone Number"
          type="tel"
          name="phoneNumber"
          placeholder="+91 (555) 987-6543"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <AuthField
          label="Password"
          type="password"
          name="password"
          placeholder="Create a strong password"
          allowPasswordToggle
          value={formData.password}
          onChange={handleChange}
          required
        />

        {errorMessage ? (
          <p className="text-sm text-red-500" aria-live="polite">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="text-sm text-emerald-500" aria-live="polite">
            {successMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold text-white rounded-2xl bg-emerald-500 hover:bg-emerald-600"
        >
          {isSubmitting ? 'Creating Account...' : 'Send Verification Email'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={!isEmailVerified}
          onClick={handleGoToSignIn}
          className="w-full h-12 text-base font-semibold rounded-2xl"
        >
          Get Started
        </Button>

        {!isEmailVerified && successMessage ? (
          <p className="text-xs text-center text-muted-foreground">
            The Get started button will unlock automatically after your email is verified.
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}
