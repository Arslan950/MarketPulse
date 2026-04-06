import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, Globe, Mail, Phone, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const initialProfile = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  businessSummary: '',
  website: '',
  profilePicture: '',
};

function normalizeWebsiteUrl(website) {
  if (!website) {
    return '';
  }

  return website.startsWith('http://') || website.startsWith('https://')
    ? website
    : `https://${website}`;
}

function ProfileField({ icon: Icon, label, value, href }) {
  const content = value || 'Not available';

  return (
    <div className="rounded-2xl border border-border bg-background/50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>

      {href && value ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 text-sm font-medium text-foreground transition-colors hover:text-emerald-500"
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="break-all">{content}</span>
        </a>
      ) : (
        <div className="flex items-center gap-3 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="break-words">{content}</span>
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

      setFetchError('');
      setIsLoadingProfile(true);

      try {
        const response = await axios.get('http://localhost:3000/api/v1/auth/current-user', {
          withCredentials: true,
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {},
        });

        const currentUser = response.data?.data?.data;
        const nextProfile = {
          fullName: currentUser?.fullName || '',
          email: currentUser?.email || '',
          phone: currentUser?.phoneNumber || '',
          businessName: currentUser?.businessInfo?.businessName || '',
          businessSummary: currentUser?.businessInfo?.description || '',
          website: currentUser?.businessInfo?.websiteURL || '',
          profilePicture: currentUser?.profilePicture || '',
        };

        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFetchError(
          error.response?.data?.message ||
            error.message ||
            'Unable to load your profile right now.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const profileInitial = profile.fullName.trim().charAt(0).toUpperCase() || 'M';
  const websiteHref = normalizeWebsiteUrl(profile.website);

  return (
    <div className="mx-auto flex w-full justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-emerald-950/5"
        >
          <div className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_45%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center text-center">
              <Avatar size="lg" className="h-28 w-28 border-4 border-background shadow-lg">
                <AvatarImage src={profile.profilePicture} alt={profile.fullName || 'Profile picture'} />
                <AvatarFallback className="bg-emerald-500/15 text-2xl font-semibold text-emerald-500">
                  {profileInitial}
                </AvatarFallback>
              </Avatar>

              <h1 className="mt-5 text-3xl font-bold text-foreground">Profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage your personal and business information in one centered workspace.
              </p>

              {isLoadingProfile ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading profile information...</p>
              ) : null}

              {fetchError ? (
                <p className="mt-4 text-sm text-red-500" aria-live="polite">
                  {fetchError}
                </p>
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-[2rem] border border-border bg-card p-6 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProfileField icon={User} label="Full Name" value={profile.fullName} />
            <ProfileField icon={Mail} label="Email Address" value={profile.email} />
            <ProfileField icon={Phone} label="Phone Number" value={profile.phone} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-[2rem] border border-border bg-card p-6 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Business Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProfileField icon={Building2} label="Business Name" value={profile.businessName} />
            <ProfileField
              icon={Globe}
              label="Website"
              value={profile.website}
              href={websiteHref}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Business Summary
            </p>
            <p className="text-sm leading-7 text-foreground">
              {profile.businessSummary || 'Not available'}
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
