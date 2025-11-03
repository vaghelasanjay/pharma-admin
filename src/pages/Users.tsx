import { useState, useEffect, useCallback } from "react";
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
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { userAPI } from "@/lib/api";

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [formData, setFormData] = useState({
    RegisterEmail: "",
    FullName: "",
    UserName: "",
    Mobile: "",
    Password: "",
    Status: true,
  });
  const { toast } = useToast();

  const debouncedEmail = useDebounce(formData.RegisterEmail, 500);
  const debouncedUsername = useDebounce(formData.UserName, 500);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.list();
      setUsers(response.data || response);
    } catch (error: any) {
      toast({ 
        title: "Error fetching users", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || email.length < 3) {
      setEmailAvailable(null);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailAvailable(false);
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await userAPI.checkEmailAvailability(email, editingUser?.UserId);
      setEmailAvailable(response.isAvailable);
    } catch (error) {
      console.error('Error checking email availability:', error);
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  }, [editingUser]);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await userAPI.checkUsernameAvailability(username, editingUser?.UserId);
      setUsernameAvailable(response.isAvailable);
    } catch (error) {
      console.error('Error checking username availability:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, [editingUser]);

  // Check email availability when debounced email changes
  useEffect(() => {
    if (debouncedEmail) {
      checkEmailAvailability(debouncedEmail);
    } else {
      setEmailAvailable(null);
    }
  }, [debouncedEmail, checkEmailAvailability]);

  // Check username availability when debounced username changes
  useEffect(() => {
    if (debouncedUsername) {
      checkUsernameAvailability(debouncedUsername);
    } else {
      setUsernameAvailable(null);
    }
  }, [debouncedUsername, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email and username availability
    if (emailAvailable === false) {
      toast({
        title: "Email already exists",
        description: "Please use a different email address",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Username already taken",
        description: "Please choose a different username",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.RegisterEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    try {
      if (editingUser) {
        // For update, only send password if it's provided
        const updateData: any = {
          UserId: editingUser.UserId,
          RegisterEmail: formData.RegisterEmail,
          FullName: formData.FullName,
          UserName: formData.UserName,
          Mobile: formData.Mobile,
          Status: formData.Status,
        };
        
        if (formData.Password) {
          updateData.Password = formData.Password;
        }

        await userAPI.update(updateData);
        toast({ title: "User updated successfully" });
      } else {
        await userAPI.create(formData);
        toast({ title: "User created successfully" });
      }

      fetchUsers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      RegisterEmail: user.RegisterEmail,
      FullName: user.FullName,
      UserName: user.UserName,
      Mobile: user.Mobile,
      Password: "", // Don't pre-fill password for security
      Status: user.Status,
    });
    // Reset availability checks when editing
    setEmailAvailable(null);
    setUsernameAvailable(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await userAPI.delete(id);
      toast({ title: "User deleted successfully" });
      fetchUsers();
    } catch (error: any) {
      toast({ 
        title: "Error deleting user", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (user: any) => {
    try {
      await userAPI.update({
        UserId: user.UserId,
        RegisterEmail: user.RegisterEmail,
        FullName: user.FullName,
        UserName: user.UserName,
        Mobile: user.Mobile,
        Status: !user.Status,
      });
      toast({ title: "Status updated successfully" });
      fetchUsers();
    } catch (error: any) {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      RegisterEmail: "",
      FullName: "",
      UserName: "",
      Mobile: "",
      Password: "",
      Status: true,
    });
    setEmailAvailable(null);
    setUsernameAvailable(null);
  };

  const getEmailStatus = () => {
    if (checkingEmail) return "checking";
    if (emailAvailable === true) return "available";
    if (emailAvailable === false) return "taken";
    return "idle";
  };

  const getUsernameStatus = () => {
    if (checkingUsername) return "checking";
    if (usernameAvailable === true) return "available";
    if (usernameAvailable === false) return "taken";
    return "idle";
  };

  const emailStatus = getEmailStatus();
  const usernameStatus = getUsernameStatus();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user details" : "Create a new user account"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Email Field with Availability Check */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.RegisterEmail}
                      onChange={(e) => setFormData({ ...formData, RegisterEmail: e.target.value })}
                      required
                      className={`pr-10 ${
                        emailStatus === 'taken' ? 'border-red-500' : 
                        emailStatus === 'available' ? 'border-green-500' : ''
                      }`}
                      placeholder="user@example.com"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailStatus === 'checking' && (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {emailStatus === 'available' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {emailStatus === 'taken' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {emailStatus === 'checking' && (
                    <p className="text-xs text-blue-500">Checking availability...</p>
                  )}
                  {emailStatus === 'available' && (
                    <p className="text-xs text-green-500">Email is available</p>
                  )}
                  {emailStatus === 'taken' && (
                    <p className="text-xs text-red-500">Email is already registered</p>
                  )}
                  {formData.RegisterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.RegisterEmail) && (
                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                  )}
                </div>

                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name *</Label>
                  <Input
                    id="fullname"
                    value={formData.FullName}
                    onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                {/* Username Field with Availability Check */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={formData.UserName}
                      onChange={(e) => setFormData({ ...formData, UserName: e.target.value })}
                      required
                      className={`pr-10 ${
                        usernameStatus === 'taken' ? 'border-red-500' : 
                        usernameStatus === 'available' ? 'border-green-500' : ''
                      }`}
                      placeholder="Choose a username"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {usernameStatus === 'available' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {usernameStatus === 'taken' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {usernameStatus === 'checking' && (
                    <p className="text-xs text-blue-500">Checking availability...</p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-xs text-green-500">Username is available</p>
                  )}
                  {usernameStatus === 'taken' && (
                    <p className="text-xs text-red-500">Username is already taken</p>
                  )}
                </div>

                {/* Mobile Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    value={formData.Mobile}
                    onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                    required
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="password">
                    Password {!editingUser && '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  />
                  {editingUser && (
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep current password
                    </p>
                  )}
                </div>

                {/* Status Switch */}
                <div className="flex items-center space-x-2 col-span-2">
                  <Switch
                    id="status"
                    checked={formData.Status}
                    onCheckedChange={(checked) => setFormData({ ...formData, Status: checked })}
                  />
                  <Label htmlFor="status">Active Status</Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={
                  isLoading || 
                  emailStatus === 'taken' || 
                  usernameStatus === 'taken' ||
                  emailStatus === 'checking' ||
                  usernameStatus === 'checking' ||
                  !formData.RegisterEmail ||
                  !formData.FullName ||
                  !formData.UserName ||
                  !formData.Mobile ||
                  (!editingUser && !formData.Password) ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.RegisterEmail)
                }
              >
                {isLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.UserId}>
                <TableCell className="font-medium">{user.UserId}</TableCell>
                <TableCell>{user.RegisterEmail}</TableCell>
                <TableCell>{user.FullName}</TableCell>
                <TableCell>{user.UserName}</TableCell>
                <TableCell>{user.Mobile}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.Status}
                    onCheckedChange={() => handleStatusToggle(user)}
                  />
                </TableCell>
                <TableCell>
                  {user.EntryDate ? new Date(user.EntryDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.UserId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Create your first user to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;