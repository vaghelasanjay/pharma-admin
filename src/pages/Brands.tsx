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
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { brandAPI, API_BASE_URL } from "@/lib/api";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({
    Title: "",
    URL: "",
    Status: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await brandAPI.list();
      setBrands(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching brands", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Title", formData.Title);
      formDataToSend.append("URL", formData.URL);
      formDataToSend.append("Status", formData.Status.toString());
      
      if (imageFile) {
        formDataToSend.append("Image", imageFile); // Changed from BrandImage to Image
      }

      if (editingBrand) {
        formDataToSend.append("BrandId", editingBrand.BrandId.toString());
        const response = await brandAPI.update(formDataToSend);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update brand");
        }
        toast({ title: "Brand updated successfully" });
      } else {
        const response = await brandAPI.create(formDataToSend);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create brand");
        }
        toast({ title: "Brand created successfully" });
      }

      fetchBrands();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      Title: brand.Title,
      URL: brand.URL || "",
      Status: brand.Status,
    });
    setImageFile(null);
    // Set image preview from existing brand image
    if (brand.Image) {
      setImagePreview(`${API_BASE_URL}/${brand.Image}`);
    } else {
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) {
      return;
    }

    try {
      await brandAPI.delete(id);
      toast({ title: "Brand deleted successfully" });
      fetchBrands();
    } catch (error) {
      toast({ 
        title: "Error deleting brand", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (brand: any) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("BrandId", brand.BrandId.toString());
      formDataToSend.append("Title", brand.Title);
      formDataToSend.append("URL", brand.URL || "");
      formDataToSend.append("Status", (!brand.Status).toString());

      const response = await brandAPI.update(formDataToSend);
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      toast({ title: "Status updated successfully" });
      fetchBrands();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      Title: "",
      URL: "",
      Status: true,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Management</h1>
          <p className="text-muted-foreground">Manage product brands</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
              <DialogDescription>
                {editingBrand ? "Update brand details" : "Create a new brand"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Brand Title *</Label>
                  <Input
                    id="title"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    required
                    placeholder="Enter brand title"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.URL}
                    onChange={(e) => setFormData({ ...formData, URL: e.target.value })}
                    placeholder="Enter brand URL (optional)"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="image">Brand Image {!editingBrand && "*"}</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingBrand} // Only required for new brands
                  />
                  <p className="text-sm text-muted-foreground">
                    {editingBrand ? "Select a new image to update" : "Image is required for new brands"}
                  </p>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Brand preview" 
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  
                  {/* Current Image (when editing) */}
                  {editingBrand && !imagePreview && editingBrand.Image && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Current Image:</p>
                      <img 
                        src={`${API_BASE_URL}/${editingBrand.Image}`} 
                        alt="Current brand" 
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Switch
                    id="status"
                    checked={formData.Status}
                    onCheckedChange={(checked) => setFormData({ ...formData, Status: checked })}
                  />
                  <Label htmlFor="status">Active Status</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBrand ? "Update Brand" : "Create Brand"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.BrandId}>
                <TableCell className="font-medium">{brand.BrandId}</TableCell>
                <TableCell>
                  {brand.Image ? (
                    <img 
                      src={`${API_BASE_URL}/${brand.Image}`} 
                      alt={brand.Title}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.Title}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {brand.URL ? (
                    <a 
                      href={brand.URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {brand.URL}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No URL</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={brand.Status}
                    onCheckedChange={() => handleStatusToggle(brand)}
                  />
                </TableCell>
                <TableCell>
                  {brand.EntryDate ? new Date(brand.EntryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(brand)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(brand.BrandId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {brands.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No brands found. Create your first brand to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;