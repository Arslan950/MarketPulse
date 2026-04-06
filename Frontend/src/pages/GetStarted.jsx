import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Check, Globe, ImagePlus, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';

const initialFormData = {
  businessName: '',
  description: '',
  websiteURL: '',
  profilePictureURL: '',
};

export function GetStarted() {
  const navigate = useNavigate();
  const { userID } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSkip = () => {
    navigate('/trend-command');
  };

  const handleNext = () => {
    setErrorMessage('');
    setStep(2);
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file for your profile picture.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((currentData) => ({
        ...currentData,
        profilePictureURL: typeof reader.result === 'string' ? reader.result : '',
      }));
      setErrorMessage('');
    };

    reader.onerror = () => {
      setErrorMessage('We could not read that image. Please try a different file.');
    };

    reader.readAsDataURL(file);
  };

  const handleDone = async () => {
    setErrorMessage('');

    if (!userID) {
      navigate('/trend-command');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `http://localhost:3000/api/v1/auth/set-basic-info/${userID}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      navigate('/trend-command');
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'Unable to save your business information right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewFallback = formData.businessName.trim().charAt(0).toUpperCase() || 'M';

  return (
    <AuthLayout
      title={step === 1 ? 'Tell us about your business' : 'Add your profile picture'}
      subtitle={
        step === 1
          ? 'Add a few basics so MarketPulse can personalize your workspace from the start.'
          : 'Upload a profile picture if you want a more complete account setup.'
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${step >= 1
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
                  : 'border-border bg-background text-muted-foreground'
                }`}
            >
              1
            </span>
            <span className="text-muted-foreground">Business</span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${step >= 2
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
                  : 'border-border bg-background text-muted-foreground'
                }`}
            >
              2
            </span>
            <span className="text-muted-foreground">Photo</span>
          </div>
        </div>

        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="businessName"
                className="text-sm font-medium text-foreground"
              >
                Business Name
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Northwind Retail"
                  className="h-12 rounded-2xl border-border bg-background/80 pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us what your business does, who you serve, or what you sell."
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="websiteURL"
                className="text-sm font-medium text-foreground"
              >
                Website
              </label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="websiteURL"
                  name="websiteURL"
                  type="url"
                  value={formData.websiteURL}
                  onChange={handleInputChange}
                  placeholder="https://yourbusiness.com"
                  className="h-12 rounded-2xl border-border bg-background/80 pl-11"
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-500" aria-live="polite">
                {errorMessage}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleSkip}
                className="h-12 rounded-2xl text-base font-semibold"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={handleNext}
                className="h-12 rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
              >
                Next
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="rounded-[1.75rem] border border-border bg-background/70 p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar size="lg" className="h-24 w-24 border border-border shadow-sm">
                  <AvatarImage src={formData.profilePictureURL} alt="Profile preview" />
                  <AvatarFallback className="bg-emerald-500/15 text-lg font-semibold text-emerald-500">
                    {previewFallback}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-base font-semibold text-foreground">Profile picture preview</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose any image and we will convert it into a URL for this setup request.
                  </p>
                </div>

                <label
                  htmlFor="profilePicture"
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center transition-colors hover:border-emerald-500/40 hover:bg-secondary/40"
                >
                  <ImagePlus className="mb-3 h-6 w-6 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground">Upload profile picture</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, or WEBP
                  </span>
                </label>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-500" aria-live="polite">
                {errorMessage}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="h-12 rounded-2xl text-base font-semibold"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={handleDone}
                disabled={isSubmitting}
                className="h-12 rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
              >
                <Check className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Done'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
