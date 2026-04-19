import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, Globe, ImagePlus, LocateIcon, SkipForward, LayoutGrid, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '../components/Select';

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const initialFormData = {
  businessName: '',
  description: '',
  category: '',
  website: '',
  profilePicture: '',
  location: ''
};

export function GetStarted() {
  const navigate = useNavigate();
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
        profilePicture: typeof reader.result === 'string' ? reader.result : '',
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
    setIsSubmitting(true);

    try {
      const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

      await axios.post(
        `http://localhost:3000/api/v1/business/set-info`,
        formData,
        {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
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
      subtitle={
        step === 1
          ? 'Provide us your business details for better experience'
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
          <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleNext(); }}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Row 1: Business Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="businessName" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                      className="h-11 rounded-2xl border-border bg-background/80 pl-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-2xl border-border bg-background/80 px-4 text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
                      <SelectGroup>
                        <SelectLabel>Retail & Commerce</SelectLabel>
                        <SelectItem value="Retail & E-commerce">Retail & E-commerce</SelectItem>
                        <SelectItem value="Clothing & Apparel">Clothing & Apparel</SelectItem>
                        <SelectItem value="Luxury & Jewellery">Luxury & Jewellery</SelectItem>
                        <SelectItem value="Footwear">Footwear</SelectItem>
                        <SelectItem value="Grocery & Supermarket">Grocery & Supermarket</SelectItem>
                        <SelectItem value="Pharmacy & Wellness">Pharmacy & Wellness</SelectItem>
                        <SelectItem value="Home & Furniture">Home & Furniture</SelectItem>
                        <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                        <SelectItem value="Books & Stationery">Books & Stationery</SelectItem>
                        <SelectItem value="Toys & Kids">Toys & Kids</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Technology</SelectLabel>
                        <SelectItem value="Electronics & Gadgets">Electronics & Gadgets</SelectItem>
                        <SelectItem value="Software & SaaS">Software & SaaS</SelectItem>
                        <SelectItem value="Telecom & Networking">Telecom & Networking</SelectItem>
                        <SelectItem value="IT Services & Consulting">IT Services & Consulting</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="AI & Machine Learning">AI & Machine Learning</SelectItem>
                        <SelectItem value="Hardware & Components">Hardware & Components</SelectItem>
                        <SelectItem value="Gaming & Esports">Gaming & Esports</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Food & Beverage</SelectLabel>
                        <SelectItem value="Restaurant & Café">Restaurant & Café</SelectItem>
                        <SelectItem value="Cloud Kitchen">Cloud Kitchen</SelectItem>
                        <SelectItem value="Bakery & Confectionery">Bakery & Confectionery</SelectItem>
                        <SelectItem value="Beverages & Drinks">Beverages & Drinks</SelectItem>
                        <SelectItem value="Food Processing & FMCG">Food Processing & FMCG</SelectItem>
                        <SelectItem value="Catering & Events">Catering & Events</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Health & Wellness</SelectLabel>
                        <SelectItem value="Healthcare & Clinics">Healthcare & Clinics</SelectItem>
                        <SelectItem value="Fitness & Gym">Fitness & Gym</SelectItem>
                        <SelectItem value="Mental Health">Mental Health</SelectItem>
                        <SelectItem value="Beauty & Cosmetics">Beauty & Cosmetics</SelectItem>
                        <SelectItem value="Ayurveda & Herbal">Ayurveda & Herbal</SelectItem>
                        <SelectItem value="Dental & Optical">Dental & Optical</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Finance & Legal</SelectLabel>
                        <SelectItem value="Banking & Finance">Banking & Finance</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Accounting & Taxation">Accounting & Taxation</SelectItem>
                        <SelectItem value="Legal Services">Legal Services</SelectItem>
                        <SelectItem value="Investment & Fintech">Investment & Fintech</SelectItem>
                        <SelectItem value="Real Estate & Property">Real Estate & Property</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Education & Training</SelectLabel>
                        <SelectItem value="School & College">School & College</SelectItem>
                        <SelectItem value="EdTech & E-learning">EdTech & E-learning</SelectItem>
                        <SelectItem value="Tutoring & Coaching">Tutoring & Coaching</SelectItem>
                        <SelectItem value="Skill Development">Skill Development</SelectItem>
                        <SelectItem value="Corporate Training">Corporate Training</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Media & Creative</SelectLabel>
                        <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                        <SelectItem value="Media & Publishing">Media & Publishing</SelectItem>
                        <SelectItem value="Photography & Film">Photography & Film</SelectItem>
                        <SelectItem value="Design & Creative Agency">Design & Creative Agency</SelectItem>
                        <SelectItem value="Music & Entertainment">Music & Entertainment</SelectItem>
                        <SelectItem value="Social Media & Influencer">Social Media & Influencer</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Services</SelectLabel>
                        <SelectItem value="Logistics & Delivery">Logistics & Delivery</SelectItem>
                        <SelectItem value="Travel & Tourism">Travel & Tourism</SelectItem>
                        <SelectItem value="Hospitality & Hotels">Hospitality & Hotels</SelectItem>
                        <SelectItem value="Automotive & Transport">Automotive & Transport</SelectItem>
                        <SelectItem value="Construction & Engineering">Construction & Engineering</SelectItem>
                        <SelectItem value="Manufacturing & Industry">Manufacturing & Industry</SelectItem>
                        <SelectItem value="Agriculture & Farming">Agriculture & Farming</SelectItem>
                        <SelectItem value="Cleaning & Facility">Cleaning & Facility</SelectItem>
                        <SelectItem value="Event Management">Event Management</SelectItem>
                        <SelectItem value="HR & Recruitment">HR & Recruitment</SelectItem>
                        <SelectItem value="NGO & Non-profit">NGO & Non-profit</SelectItem>
                        <SelectItem value="Government & Public Sector">Government & Public Sector</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Description full-width */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  required
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us what your business does, who you serve, or what you sell."
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Row 3: Website + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="website" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourbusiness.com"
                      className="h-11 rounded-2xl border-border bg-background/80 pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Location
                  </label>
                  <div className="relative">
                    <LocateIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ludhiana, Punjab"
                      className="h-11 rounded-2xl border-border bg-background/80 pl-11"
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-500" aria-live="polite">{errorMessage}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600"
              >
                Next
              </Button>
            </motion.div>
          </form>
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
                  <AvatarImage src={formData.profilePicture} alt="Profile preview" />
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
