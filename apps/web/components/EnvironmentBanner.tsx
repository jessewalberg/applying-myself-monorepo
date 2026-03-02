'use client';

export default function EnvironmentBanner() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  
  if (environment === 'production') return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-center py-1 text-sm font-medium ${
      environment === 'staging' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
    }`}>
      {environment?.toUpperCase()} ENVIRONMENT
    </div>
  );
}
