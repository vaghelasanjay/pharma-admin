import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { productSubCategoryAPI, productCategoryAPI } from "@/lib/api";

const ProductSubCategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [formData, setFormData] = useState({
    ProductCatId: "",
    Title: "",
    OrderId: "",
    Status: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await productSubCategoryAPI.list();
      setSubCategories(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching sub-categories", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

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
      if (editingSubCategory) {
        await productSubCategoryAPI.update({
          ProductSubCatId: editingSubCategory.ProductSubCatId,
          ...formData,
          ProductCatId: parseInt(formData.ProductCatId),
          OrderId: parseInt(formData.OrderId),
        });
        toast({ title: "Sub-category updated successfully" });
      } else {
        await productSubCategoryAPI.create({
          ...formData,
          ProductCatId: parseInt(formData.ProductCatId),
          OrderId: parseInt(formData.OrderId),
        });
        toast({ title: "Sub-category created successfully" });
      }

      fetchSubCategories();
      setIsDialogOpen(false);
      setEditingSubCategory(null);
      setFormData({ ProductCatId: "", Title: "", OrderId: "", Status: true });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      ProductCatId: subCategory.ProductCatId.toString(),
      Title: subCategory.Title,
      OrderId: subCategory.OrderId.toString(),
      Status: subCategory.Status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await productSubCategoryAPI.delete(id);
      toast({ title: "Sub-category deleted successfully" });
      fetchSubCategories();
    } catch (error) {
      toast({ 
        title: "Error deleting sub-category", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (subCategory) => {
    try {
      await productSubCategoryAPI.update({
        ProductSubCatId: subCategory.ProductSubCatId,
        ProductCatId: subCategory.ProductCatId,
        Title: subCategory.Title,
        OrderId: subCategory.OrderId,
        Status: !subCategory.Status,
      });
      fetchSubCategories();
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
          <h1 className="text-3xl font-bold">Product Sub Category</h1>
          <p className="text-muted-foreground">Manage product sub-categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSubCategory(null);
              setFormData({ ProductCatId: "", Title: "", OrderId: "", Status: true });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sub-Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubCategory ? "Edit Sub-Category" : "Add New Sub-Category"}</DialogTitle>
              <DialogDescription>
                {editingSubCategory ? "Update sub-category details" : "Create a new product sub-category"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productCatId">Select Category</Label>
                <Select
                  value={formData.ProductCatId}
                  onValueChange={(value) => setFormData({ ...formData, ProductCatId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.ProductCatId} value={category.ProductCatId.toString()}>
                        {category.ProductCatId} - {category.Title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Sub-Category Title</Label>
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
              <Button type="submit" className="w-full">
                {editingSubCategory ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Category ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.map((subCategory) => (
              <TableRow key={subCategory.ProductSubCatId}>
                <TableCell>{subCategory.ProductSubCatId}</TableCell>
                <TableCell>{subCategory.ProductCatId}</TableCell>
                <TableCell>{subCategory.Title}</TableCell>
                <TableCell>{subCategory.OrderId}</TableCell>
                <TableCell>
                  <Switch
                    checked={subCategory.Status}
                    onCheckedChange={() => handleStatusToggle(subCategory)}
                  />
                </TableCell>
                <TableCell>{new Date(subCategory.EntryDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(subCategory)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(subCategory.ProductSubCatId)}
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

export default ProductSubCategory;