import React, { useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
// Added MapPin for the location icon
import { Building2, Globe, Mail, Phone, User, Edit2, Save, X, Camera, MapPin } from 'lucide-react'; 
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';
import { useAuthStore } from "../store/UserInfo.js";

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const initialProfile = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  businessSummary: '',
  website: '',
  profilePicture: '',
  location: '', // Added location here
};

function normalizeWebsiteUrl(website) {
  if (!website) return '';
  return website.startsWith('http://') || website.startsWith('https://')
    ? website
    : `https://${website}`;
}

function ProfileField({ icon: Icon, label, value, href, isEditing, name, onChange, type = "text", isTextArea = false }) {
  const content = value || 'Not available';

  return (
    <div className="rounded-2xl border border-border bg-background/50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>

      {isEditing ? (
        isTextArea ? (
            <textarea
              name={name}
              value={value}
              onChange={onChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[100px]"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
        ) : (
            <div className="relative">
                <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                placeholder={`Enter ${label.toLowerCase()}`}
                />
            </div>
        )
      ) : href && value ? (
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
  const user = useAuthStore((state) => state.user);
  const business = useAuthStore((state) => state.business);
  const isLoadingProfile = useAuthStore((state) => state.isLoading);
  const fetchError = useAuthStore((state) => state.error);
  const updateBusinessInStore = useAuthStore((state) => state.updateBusinessInStore);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const profile = {
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    businessName: business?.businessName || '',
    businessSummary: business?.description || '',
    website: business?.website || '',
    profilePicture: business?.profilePicture || '',
    location: business?.location || '', // Pull location from store
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("Image must be smaller than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    
    try {
      const payload = {
        businessName: editForm.businessName,
        description: editForm.businessSummary,
        website: editForm.website,
        profilePicture: editForm.profilePicture,
        location: editForm.location // Send location to backend
      };

      const response = await axios.patch(
        'http://localhost:3000/api/v1/business/edit-info', 
        payload,
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );

      const updatedBusiness =
        response.data?.data?.business ||
        response.data?.data?.updatebusinessInfo || // account for your specific controller response
        response.data?.data || {};

      updateBusinessInStore({
        businessName: updatedBusiness.businessName ?? payload.businessName,
        description: updatedBusiness.description ?? payload.description,
        website: updatedBusiness.website ?? payload.website,
        profilePicture: updatedBusiness.profilePicture ?? payload.profilePicture,
        location: updatedBusiness.location ?? payload.location, // Update store
      });
      setIsEditing(false);
      
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update business profile');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditForm(profile); 
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const profileInitial = profile.fullName.trim().charAt(0).toUpperCase() || 'M';
  const websiteHref = normalizeWebsiteUrl(profile.website);

  return (
    <div className="mx-auto flex w-full justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-emerald-950/5"
        >
          {/* Action Buttons */}
          <div className="absolute right-6 top-6 flex gap-2 z-10">
            {isEditing ? (
              <>
                <button 
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button 
                onClick={startEditing}
                className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>

          <div className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_45%)] px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center text-center">
              
              <div className="relative group">
                <Avatar size="lg" className="h-28 w-28 border-4 border-background shadow-lg">
                  <AvatarImage src={isEditing ? editForm.profilePicture : profile.profilePicture} alt={profile.fullName || 'Profile picture'} />
                  <AvatarFallback className="bg-emerald-500/15 text-2xl font-semibold text-emerald-500">
                    {profileInitial}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-2 text-white shadow-md hover:bg-emerald-600 transition-colors"
                    title="Upload new picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleImageUpload}
                />
              </div>

              <h1 className="mt-5 text-3xl font-bold text-foreground">Profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage your personal and business information in one centered workspace.
              </p>

              {isLoadingProfile && <p className="mt-4 text-sm text-muted-foreground">Loading profile information...</p>}
              {fetchError && <p className="mt-4 text-sm text-red-500" aria-live="polite">{fetchError}</p>}
            </div>
          </div>
        </motion.div>

        {/* Personal Info - Always Read Only */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-[2rem] border border-border bg-card p-6 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
            {isEditing && <p className="text-xs text-muted-foreground mt-1">Personal information cannot be edited here.</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProfileField icon={User} label="Full Name" value={profile.fullName} />
            <ProfileField icon={Mail} label="Email Address" value={profile.email} />
            <ProfileField icon={Phone} label="Phone Number" value={profile.phone} />
          </div>
        </motion.section>

        {/* Business Info - Editable */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-[2rem] border border-border bg-card p-6 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Business Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProfileField 
              icon={Building2} 
              label="Business Name" 
              value={isEditing ? editForm.businessName : profile.businessName} 
              isEditing={isEditing}
              name="businessName"
              onChange={handleEditChange}
            />
            <ProfileField 
              icon={MapPin} 
              label="Location" 
              value={isEditing ? editForm.location : profile.location} 
              isEditing={isEditing}
              name="location"
              onChange={handleEditChange}
            />
            <ProfileField
              icon={Globe}
              label="Website"
              value={isEditing ? editForm.website : profile.website}
              href={websiteHref}
              isEditing={isEditing}
              name="website"
              type="url"
              onChange={handleEditChange}
            />
          </div>

          <div className="mt-4">
            <ProfileField 
              icon={Building2} 
              label="Business Summary" 
              value={isEditing ? editForm.businessSummary : profile.businessSummary} 
              isEditing={isEditing}
              name="businessSummary"
              isTextArea={true}
              onChange={handleEditChange}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}