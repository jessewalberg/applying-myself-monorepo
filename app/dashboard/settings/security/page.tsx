"use client";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600">
            Update your password to keep your account secure.
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm your new password"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-600">
            Add an extra layer of security to your account.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Enable 2FA</h3>
            <p className="text-sm text-gray-500">Use an authenticator app for additional security</p>
          </div>
          <button className="btn-secondary">
            Enable 2FA
          </button>
        </div>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Account Activity</h2>
          <p className="text-sm text-gray-600">
            Recent login activity and sessions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Current Session</h3>
              <p className="text-sm text-gray-500">Chrome on macOS • San Francisco, CA</p>
              <p className="text-xs text-gray-400">Active now</p>
            </div>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Current
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 