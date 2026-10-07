import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps the /admin route tree. Three states:
 *  - still checking the session (page just loaded/refreshed) -> show a loading state,
 *    NOT a redirect, otherwise a valid admin gets bounced to /login for a flash
 *    before the session check finishes.
 *  - not logged in -> redirect to /login, remembering where they were headed
 *  - logged in but not an admin -> redirect to the homepage
 */
const RequireAdmin = ({ children }) => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  console.log('RequireAdmin role is:', user?.role);

  if (isAuthLoading) {
	return (
	  <div className="min-h-screen flex items-center justify-center bg-background-light">
		<div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
	  </div>
	);
  }

  if (!isAuthenticated) {
	return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
	return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
