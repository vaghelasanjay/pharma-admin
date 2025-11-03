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
import { adminAPI } from "@/lib/api";

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    RegisterMobile: "",
    Password: "",
    Status: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.list();
      setAdmins(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching admins", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        await adminAPI.update({
          AdminId: editingAdmin.AdminId,
          ...formData,
        });
        toast({ title: "Admin updated successfully" });
      } else {
        await adminAPI.create(formData);
        toast({ title: "Admin created successfully" });
      }

      fetchAdmins();
      setIsDialogOpen(false);
      setEditingAdmin(null);
      setFormData({ RegisterMobile: "", Password: "", Status: true });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      RegisterMobile: admin.RegisterMobile,
      Password: admin.Password || "",
      Status: admin.Status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
     await adminAPI.delete(id);
      toast({ title: "Admin deleted successfully" });
      fetchAdmins();
      
    } catch (error) {
      toast({ 
        title: "Error deleting admin", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleStatusToggle = async (admin) => {
    try {
      await adminAPI.update({
        AdminId: admin.AdminId,
        RegisterMobile: admin.RegisterMobile,
        Status: !admin.Status,
      });
      fetchAdmins();
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
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">Manage admin accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAdmin(null);
              setFormData({ RegisterMobile: "", Password: "", Status: true });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAdmin ? "Edit Admin" : "Add New Admin"}</DialogTitle>
              <DialogDescription>
                {editingAdmin ? "Update admin details" : "Create a new admin account"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.RegisterMobile}
                  onChange={(e) => setFormData({ ...formData, RegisterMobile: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  required={!editingAdmin}
                  placeholder={editingAdmin ? "Leave blank to keep current" : ""}
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
                {editingAdmin ? "Update" : "Create"}
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
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.AdminId}>
                <TableCell>{admin.AdminId}</TableCell>
                <TableCell>{admin.RegisterMobile}</TableCell>
                <TableCell>
                  <Switch
                    checked={admin.Status}
                    onCheckedChange={() => handleStatusToggle(admin)}
                  />
                </TableCell>
                <TableCell>{new Date(admin.EntryDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(admin)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(admin.AdminId)}
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

export default Admin;
