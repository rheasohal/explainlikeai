import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, adminOnly = false }) => {
  const { currentUser, authLoading } = useStore();

  // Wait for Firebase to confirm auth state — prevents login flash
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};


