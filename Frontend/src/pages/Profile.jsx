import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Camera, Save, MapPin, Globe, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';
export function Profile() {
    const [profile, setProfile] = useState({
        fullName: 'Alex Morgan',
        email: 'alex@marketpulse.io',
        phone: '+1 (555) 234-5678',
        businessName: 'Morgan Retail Co.',
        businessSummary: 'We are a multi-channel retail business specializing in trendy streetwear and lifestyle accessories. Operating both online and through two physical storefronts in downtown Austin, we serve a young, fashion-forward demographic aged 18-35. Our focus is on curating high-demand, affordable fashion with fast inventory turnover.',
        location: 'Austin, Texas',
        website: 'www.morganretail.com',
        memberSince: 'January 2024'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(profile);
    const handleSave = () => {
        setProfile(editData);
        setIsEditing(false);
    };
    const handleCancel = () => {
        setEditData(profile);
        setIsEditing(false);
    };
    return <div className="space-y-6 max-w-4xl">
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
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal and business information
          </p>
        </div>
        {!isEditing ? <Button onClick={() => setIsEditing(true)} className="gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
            <User className="w-4 h-4"/>
            Edit Profile
          </Button> : <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCancel} className="rounded-xl border-border">
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
              <Save className="w-4 h-4"/>
              Save Changes
            </Button>
          </div>}
      </motion.div>

      {/* Profile Photo & Basic Info Card */}
      <motion.div initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.4,
            delay: 0.1
        }} className="bg-card border border-border rounded-2xl p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="w-24 h-24 text-2xl">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" alt={profile.fullName}/>
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-2xl font-semibold">
                AM
              </AvatarFallback>
            </Avatar>
            {isEditing && <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white"/>
              </button>}
          </div>

          {/* Name & Quick Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              {profile.fullName}
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-0.5">
              {profile.businessName}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4"/>
                {profile.location}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Globe className="w-4 h-4"/>
                {profile.website}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4"/>
                Member since {profile.memberSince}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
        }} className="bg-card border border-border rounded-2xl p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-500"/>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
              Full Name
            </label>
            {isEditing ? <Input value={editData.fullName} onChange={(e) => setEditData({
                ...editData,
                fullName: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <User className="w-4 h-4 text-muted-foreground"/>
                {profile.fullName}
              </div>}
          </div>

          {/* Email */}
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
              Email Address
            </label>
            {isEditing ? <Input type="email" value={editData.email} onChange={(e) => setEditData({
                ...editData,
                email: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <Mail className="w-4 h-4 text-muted-foreground"/>
                {profile.email}
              </div>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
              Phone Number
            </label>
            {isEditing ? <Input type="tel" value={editData.phone} onChange={(e) => setEditData({
                ...editData,
                phone: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <Phone className="w-4 h-4 text-muted-foreground"/>
                {profile.phone}
              </div>}
          </div>

          {/* Location */}
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
              Location
            </label>
            {isEditing ? <Input value={editData.location} onChange={(e) => setEditData({
                ...editData,
                location: e.target.value
            })} className="rounded-xl bg-secondary border-border"/> : <div className="flex items-center gap-2 text-foreground text-sm font-medium py-2.5">
                <MapPin className="w-4 h-4 text-muted-foreground"/>
                {profile.location}
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
        }} className="bg-card border border-border rounded-2xl p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500"/>
          Business Information
        </h3>
        <div className="space-y-5">
          {/* Business Name */}
          <div>
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
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
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
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
            <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2 block">
              Business Summary
            </label>
            {isEditing ? <textarea value={editData.businessSummary} onChange={(e) => setEditData({
                ...editData,
                businessSummary: e.target.value
            })} rows={5} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all resize-none"/> : <p className="text-foreground text-sm leading-relaxed py-2.5">
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
        }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center transition-colors duration-300">
          <p className="text-3xl font-bold text-emerald-500">15</p>
          <p className="text-muted-foreground text-xs mt-1">Products Listed</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center transition-colors duration-300">
          <p className="text-3xl font-bold text-foreground">$48.2k</p>
          <p className="text-muted-foreground text-xs mt-1">Inventory Value</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center transition-colors duration-300">
          <p className="text-3xl font-bold text-foreground">14</p>
          <p className="text-muted-foreground text-xs mt-1">Months Active</p>
        </div>
      </motion.div>
    </div>;
}
