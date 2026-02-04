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
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { carouselAPI, API_BASE_URL } from "@/lib/api";

const Carousel = () => {
  const [carousels, setCarousels] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<any>(null);
  const [formData, setFormData] = useState({
    URL: "",
    Status: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCarousels();
  }, []);

  const fetchCarousels = async () => {
    try {
      const response = await carouselAPI.list();
      setCarousels(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching carousels", 
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
      formDataToSend.append("URL", formData.URL);
      formDataToSend.append("Status", formData.Status.toString());
      
      if (imageFile) {
        formDataToSend.append("Image", imageFile);
      }

      if (editingCarousel) {
        formDataToSend.append("CarouselId", editingCarousel.CarouselId.toString());
        const response = await carouselAPI.update(formDataToSend);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update carousel");
        }
        toast({ title: "Carousel updated successfully" });
      } else {
        const response = await carouselAPI.create(formDataToSend);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create carousel");
        }
        toast({ title: "Carousel created successfully" });
      }

      fetchCarousels();
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

  const handleEdit = (carousel: any) => {
    setEditingCarousel(carousel);
    setFormData({
      URL: carousel.URL || "",
      Status: carousel.Status,
    });
    setImageFile(null);
    // Set image preview from existing carousel image
    if (carousel.Image) {
      setImagePreview(`${API_BASE_URL}/${carousel.Image}`);
    } else {
      setImagePreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this carousel?")) {
      return;
    }

    try {
      await carouselAPI.delete(id);
      toast({ title: "Carousel deleted successfully" });
      fetchCarousels();
    } catch (error) {
      toast({ 
        title: "Error deleting carousel", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (carousel: any) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("CarouselId", carousel.CarouselId.toString());
      formDataToSend.append("URL", carousel.URL || "");
      formDataToSend.append("Status", (!carousel.Status).toString());

      const response = await carouselAPI.update(formDataToSend);
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      toast({ title: "Status updated successfully" });
      fetchCarousels();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingCarousel(null);
    setFormData({
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
          <h1 className="text-3xl font-bold">Carousel Management</h1>
          <p className="text-muted-foreground">Manage homepage carousel slides</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Carousel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCarousel ? "Edit Carousel" : "Add New Carousel"}</DialogTitle>
              <DialogDescription>
                {editingCarousel ? "Update carousel details" : "Create a new carousel slide"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Carousel Image *</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingCarousel} // Only required for new carousels
                  />
                  <p className="text-sm text-muted-foreground">
                    {editingCarousel ? "Select a new image to update" : "Image is required for new carousels"}
                  </p>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Carousel preview" 
                        className="w-full max-w-md h-48 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  
                  {/* Current Image (when editing) */}
                  {editingCarousel && !imagePreview && editingCarousel.Image && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Current Image:</p>
                      <img 
                        src={`${API_BASE_URL}/${editingCarousel.Image}`} 
                        alt="Current carousel" 
                        className="w-full max-w-md h-48 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Redirect URL</Label>
                  <Input
                    id="url"
                    value={formData.URL}
                    onChange={(e) => setFormData({ ...formData, URL: e.target.value })}
                    placeholder="Enter redirect URL (optional)"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL to redirect when carousel image is clicked
                  </p>
                </div>

                <div className="flex items-center space-x-2">
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
                  {editingCarousel ? "Update Carousel" : "Create Carousel"}
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
              <TableHead>Redirect URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carousels.map((carousel) => (
              <TableRow key={carousel.CarouselId}>
                <TableCell className="font-medium">{carousel.CarouselId}</TableCell>
                <TableCell>
                  {carousel.Image ? (
                    <img 
                      src={`${API_BASE_URL}/${carousel.Image}`} 
                      alt={`Carousel ${carousel.CarouselId}`}
                      className="w-20 h-12 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-20 h-12 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-xs">
                  {carousel.URL ? (
                    <a 
                      href={carousel.URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {carousel.URL}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No URL</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={carousel.Status}
                    onCheckedChange={() => handleStatusToggle(carousel)}
                  />
                </TableCell>
                <TableCell>
                  {carousel.EntryDate ? new Date(carousel.EntryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(carousel)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(carousel.CarouselId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {carousels.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No carousels found. Create your first carousel slide to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Carousel;