import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Camera, Save, MapPin, Globe, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const initialProfile = {
    fullName: '',
    email: '',
    phone: '',
    businessName: 'Morgan Retail Co.',
    businessSummary: 'We are a multi-channel retail business specializing in trendy streetwear and lifestyle accessories. Operating both online and through two physical storefronts in downtown Austin, we serve a young, fashion-forward demographic aged 18-35. Our focus is on curating high-demand, affordable fashion with fast inventory turnover.',
    location: 'Austin, Texas',
    website: 'www.morganretail.com',
    memberSince: 'January 2024'
};

export function Profile() {
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(initialProfile);
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
                    headers: accessToken ? {
                        Authorization: `Bearer ${accessToken}`
                    } : {},
                });

                const currentUser = response.data?.data?.data;
                const nextProfile = {
                    ...initialProfile,
                    fullName: currentUser?.fullName || '',
                    email: currentUser?.email || '',
                    phone: currentUser?.phoneNumber || '',
                };

                if (!isMounted) {
                    return;
                }

                setProfile(nextProfile);
                setEditData(nextProfile);
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

    const handleSave = () => {
        setProfile(editData);
        setIsEditing(false);
    };
    const handleCancel = () => {
        setEditData(profile);
        setIsEditing(false);
    };
    return <div className="max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4
        }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal and business information
          </p>
        </div>
      </motion.div>

      {isLoadingProfile ? <div className="text-sm text-muted-foreground">
          Loading profile information...
        </div> : null}

      {fetchError ? <div className="text-sm text-red-500">
          {fetchError}
        </div> : null}


      {/* Personal Information */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.2
        }} className="p-6 transition-colors duration-300 border bg-card border-border rounded-2xl">
        <h3 className="flex items-center gap-2 mb-5 text-lg font-semibold text-foreground">
          <User className="w-5 h-5 text-emerald-500"/>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 ">
          {/* Full Name */}
          <div>
            <label className="block mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Full Name
            </label>
            {isEditing ? <Input value={editData.fullName} onChange={(e) => setEditData({
                ...editData,
                fullName: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <User className="w-4 h-4 text-muted-foreground"/>
                {profile.fullName || 'Not available'}
              </div>}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Email Address
            </label>
            {isEditing ? <Input type="email" value={editData.email} onChange={(e) => setEditData({
                ...editData,
                email: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <Mail className="w-4 h-4 text-muted-foreground"/>
                {profile.email || 'Not available'}
              </div>}
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Phone Number
            </label>
            {isEditing ? <Input type="tel" value={editData.phone} onChange={(e) => setEditData({
                ...editData,
                phone: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <Phone className="w-4 h-4 text-muted-foreground"/>
                {profile.phone || 'Not available'}
              </div>}
          </div>
        </div>
      </motion.div>

      {/* Business Information */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.3
        }} className="p-6 transition-colors duration-300 border bg-card border-border rounded-2xl">
        <h3 className="flex items-center gap-2 mb-5 text-lg font-semibold text-foreground">
          <Building2 className="w-5 h-5 text-emerald-500"/>
          Business Information
        </h3>
        <div className="space-y-5">
          {/* Business Name */}
          <div>
            <label className="block mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Business Name
            </label>
            {isEditing ? <Input value={editData.businessName} onChange={(e) => setEditData({
                ...editData,
                businessName: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <Building2 className="w-4 h-4 text-muted-foreground"/>
                {profile.businessName}
              </div>}
          </div>

          {/* Website */}
          <div>
            <label className="block mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Website
            </label>
            {isEditing ? <Input value={editData.website} onChange={(e) => setEditData({
                ...editData,
                website: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <Globe className="w-4 h-4 text-muted-foreground"/>
                {profile.website}
              </div>}
          </div>

          {/* Business Summary */}
          <div>
            <label className="block mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Business Summary
            </label>
            {isEditing ? <textarea value={editData.businessSummary} onChange={(e) => setEditData({
                ...editData,
                businessSummary: e.target.value
            })} rows={5} className="w-full px-4 py-3 text-sm transition-all border resize-none bg-secondary border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40"/> : <p className="text-foreground text-sm leading-relaxed py-2.5">
                {profile.businessSummary}
              </p>}
          </div>
        </div>
      </motion.div>

      {/* Account Stats */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.4
        }} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-5 text-center transition-colors duration-300 border bg-card border-border rounded-2xl">
          <p className="text-3xl font-bold text-emerald-500">15</p>
          <p className="mt-1 text-xs text-muted-foreground">Products Listed</p>
        </div>
        <div className="p-5 text-center transition-colors duration-300 border bg-card border-border rounded-2xl">
          <p className="text-3xl font-bold text-foreground">$48.2k</p>
          <p className="mt-1 text-xs text-muted-foreground">Inventory Value</p>
        </div>
        <div className="p-5 text-center transition-colors duration-300 border bg-card border-border rounded-2xl">
          <p className="text-3xl font-bold text-foreground">14</p>
          <p className="mt-1 text-xs text-muted-foreground">Months Active</p>
        </div>
      </motion.div>
    </div>;
}
