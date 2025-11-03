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
import { productsTagAPI } from "@/lib/api";

const ProductTag = () => {
  const [tags, setTags] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    Title: "",
    Status: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await productsTagAPI.list();
      // Handle different response structures
      const tagsData = response.data || response || [];
      setTags(tagsData);
    } catch (error) {
      toast({ 
        title: "Error fetching tags", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        await productsTagAPI.update({
          ProductTagId: editingTag.ProductTagId,
          ...formData,
        });
        toast({ title: "Tag updated successfully" });
      } else {
        await productsTagAPI.create(formData);
        toast({ title: "Tag created successfully" });
      }

      fetchTags();
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

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      Title: tag.Title || "",
      Status: tag.Status !== undefined ? tag.Status : true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      await productsTagAPI.delete(id);
      toast({ title: "Tag deleted successfully" });
      fetchTags();
    } catch (error) {
      toast({ 
        title: "Error deleting tag", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (tag: any) => {
    try {
      await productsTagAPI.update({
        ProductTagId: tag.ProductTagId,
        Title: tag.Title,
        Status: !tag.Status,
      });
      toast({ title: "Status updated successfully" });
      fetchTags();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingTag(null);
    setFormData({
      Title: "",
      Status: true,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Tag Management</h1>
          <p className="text-muted-foreground">Manage product tags</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
              <DialogDescription>
                {editingTag ? "Update tag details" : "Create a new product tag"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tag Title *</Label>
                  <Input
                    id="title"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    required
                    placeholder="Enter tag title"
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
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!formData.Title}
                >
                  {editingTag ? "Update Tag" : "Create Tag"}
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
              <TableHead>Tag Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.ProductTagId}>
                <TableCell className="font-medium">{tag.ProductTagId}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {tag.Title}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={tag.Status}
                    onCheckedChange={() => handleStatusToggle(tag)}
                  />
                </TableCell>
                <TableCell>
                  {tag.EntryDate ? new Date(tag.EntryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag.ProductTagId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tags.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tags found. Create your first tag to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTag;