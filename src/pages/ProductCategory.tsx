import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { productCategoryAPI } from "@/lib/api";

const ProductCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    Title: "",
    OrderId: "",
    Status: true,
    DashboardView: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productCategoryAPI.list();
      setCategories(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching categories", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await productCategoryAPI.update({
          ProductCatId: editingCategory.ProductCatId,
          ...formData,
          OrderId: parseInt(formData.OrderId),
        });
        toast({ title: "Category updated successfully" });
      } else {
        await productCategoryAPI.create({
          ...formData,
          OrderId: parseInt(formData.OrderId),
        });
        toast({ title: "Category created successfully" });
      }

      fetchCategories();
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ Title: "", OrderId: "", Status: true,DashboardView: false });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      Title: category.Title,
      OrderId: category.OrderId.toString(),
      Status: category.Status,
      DashboardView: category.DashboardView,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await productCategoryAPI.delete(id);
      toast({ title: "Category deleted successfully" });
      fetchCategories();
    } catch (error) {
      toast({ 
        title: "Error deleting category", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (category) => {
    try {
      await productCategoryAPI.update({
        ProductCatId: category.ProductCatId,
        Title: category.Title,
        OrderId: category.OrderId,
        Status: !category.Status,
        DashboardView: category.DashboardView,
      });
      fetchCategories();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };
  const handleDashboardToggle = async (category) => {
    try {
      await productCategoryAPI.update({
        ProductCatId: category.ProductCatId,
        Title: category.Title,
        OrderId: category.OrderId,
        Status: category.Status,
        DashboardView: !category.DashboardView,
      });
      fetchCategories();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Category</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({ Title: "", OrderId: "", Status: true,DashboardView: false });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update category details" : "Create a new product category"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Category Title</Label>
                <Input
                  id="title"
                  value={formData.Title}
                  onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="number"
                  value={formData.OrderId}
                  onChange={(e) => setFormData({ ...formData, OrderId: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.Status}
                  onCheckedChange={(checked) => setFormData({ ...formData, Status: checked })}
                />
                <Label htmlFor="status">Active Status</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dashboardView"
                  checked={formData.DashboardView}
                  onCheckedChange={(checked) => setFormData({ ...formData, DashboardView: checked })}
                />
                <Label htmlFor="status">Show in Dashboard</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingCategory ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dashboard View</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.ProductCatId}>
                <TableCell>{category.ProductCatId}</TableCell>
                <TableCell>{category.Title}</TableCell>
                <TableCell>{category.OrderId}</TableCell>
                <TableCell>
                  <Switch
                    checked={category.Status}
                    onCheckedChange={() => handleStatusToggle(category)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={category.DashboardView}
                    onCheckedChange={() => handleDashboardToggle(category)}
                  />
                </TableCell>
                <TableCell>{new Date(category.EntryDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.ProductCatId)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductCategory;
