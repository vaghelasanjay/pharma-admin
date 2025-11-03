import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

const ProductImages = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Images Management</h1>
        <p className="text-muted-foreground">Manage product images and thumbnails</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Product images CRUD functionality will be implemented here.
            {/* TODO: Implement product images CRUD with image upload and API integration */}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductImages;
