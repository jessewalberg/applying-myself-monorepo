"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedIn: "",
    github: "",
    bio: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update with Convex
    console.log("Profile data:", profileData);
  };

  return (
    <div className="rounded-xl p-6 bg-card/60 border border-border/50">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
        <p className="text-sm text-muted-foreground">
          Update your account profile information and email address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Location</label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
            className="input-field"
            placeholder="San Francisco, CA"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Website</label>
            <input
              type="url"
              value={profileData.website}
              onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
              className="input-field"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              value={profileData.linkedIn}
              onChange={(e) => setProfileData(prev => ({ ...prev, linkedIn: e.target.value }))}
              className="input-field"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div>
          <label className="form-label">GitHub</label>
          <input
            type="url"
            value={profileData.github}
            onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
            className="input-field"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="form-label">Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="input-field"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
