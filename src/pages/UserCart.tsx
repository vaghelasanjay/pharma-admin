import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const UserCart = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Cart Management</h1>
        <p className="text-muted-foreground">Manage user shopping carts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User cart CRUD functionality will be implemented here.
            {/* TODO: Implement user cart CRUD with API integration */}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCart;
