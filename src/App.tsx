import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Users from "./pages/Users";
import UserAddress from "./pages/UserAddress";
import UserCart from "./pages/UserCart";
import ProductCategory from "./pages/ProductCategory";
import ProductSubCategory from "./pages/ProductSubCategory";
import Products from "./pages/Products";
import Brands from "./pages/Brands";
import ProductReview from "./pages/ProductReview";
import ProductTag from "./pages/ProductTag";
import ProductImages from "./pages/ProductImages";
import { DashboardLayout } from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import Carousel from "./pages/Carousel";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("adminToken");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  const isTokenValid = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  if (!token || !isAuthenticated || !isTokenValid(token)) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminData');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("adminToken");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (token && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<Admin />} />
            <Route path="users" element={<Users />} />
            <Route path="user-address" element={<UserAddress />} />
            <Route path="user-cart" element={<UserCart />} />
            <Route path="product-category" element={<ProductCategory />} />
            <Route path="product-sub-category" element={<ProductSubCategory />} />
            <Route path="products" element={<Products />} />
            <Route path="brands" element={<Brands />} />
            <Route path="carousel" element={<Carousel />} />
            <Route path="product-review" element={<ProductReview />} />
            <Route path="product-tag" element={<ProductTag />} />
            <Route path="product-images" element={<ProductImages />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
