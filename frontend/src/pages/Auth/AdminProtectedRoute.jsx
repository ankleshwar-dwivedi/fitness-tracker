const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />; // Or an "Access Denied" page

  return <Outlet />;
};
export default AdminProtectedRoute;