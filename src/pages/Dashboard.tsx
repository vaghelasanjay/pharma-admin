import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Activity } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Pharma Admin Panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="2,543"
          icon={Users}
          trend="+12.5% from last month"
          trendUp={true}
        />
        <StatsCard
          title="Total Products"
          value="1,234"
          icon={Package}
          trend="+8.2% from last month"
          trendUp={true}
        />
        <StatsCard
          title="Active Orders"
          value="345"
          icon={ShoppingCart}
          trend="-3.1% from last month"
          trendUp={false}
        />
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          icon={DollarSign}
          trend="+20.1% from last month"
          trendUp={true}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New user registered", time: "2 minutes ago" },
                { action: "Product added to inventory", time: "15 minutes ago" },
                { action: "Order #1234 completed", time: "1 hour ago" },
                { action: "New review posted", time: "3 hours ago" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{item.action}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Product Categories", value: "24" },
                { label: "Brands", value: "45" },
                { label: "Total Reviews", value: "1,892" },
                { label: "Pending Orders", value: "67" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-lg font-bold text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
