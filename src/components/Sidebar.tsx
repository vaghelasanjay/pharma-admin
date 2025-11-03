import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShoppingCart,
  Layers,
  Grid,
  Package,
  Tag,
  Star,
  Image,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Admin", icon: UserCog, path: "/admin" },
  { title: "Users", icon: Users, path: "/users" },
  { title: "User Address", icon: MapPin, path: "/user-address" },
  // { title: "User Cart", icon: ShoppingCart, path: "/user-cart" },
  { title: "Product Category", icon: Layers, path: "/product-category" },
  { title: "Product Sub Category", icon: Grid, path: "/product-sub-category" },
  { title: "Products", icon: Package, path: "/products" },
  { title: "Brands", icon: Tag, path: "/brands" },
  { title: "Carousel", icon: Tag, path: "/carousel" },
  { title: "Product Review", icon: Star, path: "/product-review" },
  { title: "Product Tag", icon: Tag, path: "/product-tag" },
  { title: "Product Images", icon: Image, path: "/product-images" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
  // Clear all authentication data
  localStorage.removeItem("adminToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("adminData");
  
  // Redirect to login page
  navigate("/");
};

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-card"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } min-h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col
        ${mobileOpen ? "fixed left-0 top-0 z-40" : "hidden"} md:flex`}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary">Pharma Admin</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden md:flex"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                } ${collapsed ? "justify-center" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={`w-full ${collapsed ? "px-2" : ""} text-destructive hover:text-destructive hover:bg-destructive/10`}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};
