"use client";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600">
            Update your password to keep your account secure.
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
              placeholder="Confirm your new password"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg">
              Update Password
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
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
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
            Enable 2FA
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
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