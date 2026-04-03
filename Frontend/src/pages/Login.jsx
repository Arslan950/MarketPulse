import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const accessToken = response.data?.data?.accessToken;

      if (accessToken) {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
      }

      navigate('/trend-command');
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
          'Unable to log in right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to review demand shifts, product signals, and the latest activity across your MarketPulse workspace."
      footer={
        <p className="text-sm text-center text-muted-foreground">
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
          name="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <AuthField
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          allowPasswordToggle
          value={formData.password}
          onChange={handleChange}
          required
        />

        {errorMessage ? (
          <p className="text-sm text-red-500" aria-live="polite">
            {errorMessage + " either password is incorrect or user do not exits"}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold text-white rounded-2xl bg-emerald-500 hover:bg-emerald-600"
        >
          {isSubmitting ? 'Logging In...' : 'Login'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/forgotPassword"
          className="text-sm font-medium transition text-muted-foreground hover:text-emerald-500"
        >
          Forgot Password?
        </Link>
      </div>
    </AuthLayout>
  );
}
