import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';
import Loader from '../common/Loader';

interface ProtectedRouteProps {
  children: ReactElement;
  // Optional: roles or permissions can be added here later
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user.user);

  // If you want to show a loader while auth state is being resolved,
  // you can expand this component to check a 'loading' flag from store.
  if (user === undefined) {
    return <Loader />;
  }

  if (!user) {
    // Not authenticated — redirect to signin, preserve attempted location
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Authenticated — render children
  return children;
};

export default ProtectedRoute;
