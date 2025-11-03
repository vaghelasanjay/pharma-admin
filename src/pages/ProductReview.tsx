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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { productsReviewAPI, userAPI, productAPI } from "@/lib/api";

const ProductReview = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({
    Description: "",
    Rating: "",
    UserId: "",
    ProductId: "",
    Status: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await productsReviewAPI.list();
      setReviews(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching reviews", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.list();
      setUsers(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching users", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const fetchProducts = async () => {
    try {
      // You'll need to create a productAPI.list() method similar to userAPI
      const response = await productAPI.list();
      setProducts(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching products", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReview) {
        await productsReviewAPI.update({
          ProductReviewId: editingReview.ProductReviewId,
          ...formData,
          Rating: parseInt(formData.Rating),
        });
        toast({ title: "Review updated successfully" });
      } else {
        await productsReviewAPI.create({
          ...formData,
          Rating: parseInt(formData.Rating),
        });
        toast({ title: "Review created successfully" });
      }

      fetchReviews();
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

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setFormData({
      Description: review.Description,
      Rating: review.Rating.toString(),
      UserId: review.UserId.toString(),
      ProductId: review.ProductId.toString(),
      Status: review.Status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await productsReviewAPI.delete(id);
      toast({ title: "Review deleted successfully" });
      fetchReviews();
    } catch (error) {
      toast({ 
        title: "Error deleting review", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (review: any) => {
    try {
      await productsReviewAPI.update({
        ProductReviewId: review.ProductReviewId,
        Description: review.Description,
        Rating: review.Rating,
        UserId: review.UserId,
        ProductId: review.ProductId,
        Status: !review.Status,
      });
      toast({ title: "Status updated successfully" });
      fetchReviews();
    } catch (error) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingReview(null);
    setFormData({
      Description: "",
      Rating: "",
      UserId: "",
      ProductId: "",
      Status: true,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-300 text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.UserId === userId);
    return user ? `${user.FullName} (${user.UserName})` : `User ${userId}`;
  };

  const getProductName = (productId: number) => {
    console.log("dsasdsdsasad",products,productId)
    const product = products.find(p => p.ProductId == productId);
    return product ? product.Title : `Product ${productId}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Review Management</h1>
          <p className="text-muted-foreground">Manage product reviews and ratings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReview ? "Edit Review" : "Add New Review"}</DialogTitle>
              <DialogDescription>
                {editingReview ? "Update review details" : "Create a new product review"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User *</Label>
                  <Select
                    value={formData.UserId}
                    onValueChange={(value) => setFormData({ ...formData, UserId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.UserId} value={user.UserId.toString()}>
                          {user.FullName} ({user.UserName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productId">Product *</Label>
                  <Select
                    value={formData.ProductId}
                    onValueChange={(value) => setFormData({ ...formData, ProductId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.ProductId} value={product.ProductId.toString()}>
                           {product.ProductId} - {product.Title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating *</Label>
                  <Select
                    value={formData.Rating}
                    onValueChange={(value) => setFormData({ ...formData, Rating: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-2">
                            {renderStars(rating)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Review Description *</Label>
                  <Input
                    id="description"
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    required
                    placeholder="Enter your review description"
                  />
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
                  {editingReview ? "Update Review" : "Create Review"}
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
              <TableHead>User</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.ProductReviewId}>
                <TableCell className="font-medium">{review.ProductReviewId}</TableCell>
                <TableCell>{getUserName(review.UserId)}</TableCell>
                <TableCell>{getProductName(review.ProductId)}</TableCell>
                <TableCell>{renderStars(review.Rating)}</TableCell>
                <TableCell className="max-w-xs truncate" title={review.Description}>
                  {review.Description}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={review.Status}
                    onCheckedChange={() => handleStatusToggle(review)}
                  />
                </TableCell>
                <TableCell>
                  {review.EntryDate ? new Date(review.EntryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(review)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review.ProductReviewId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reviews.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No reviews found. Create your first review to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReview;