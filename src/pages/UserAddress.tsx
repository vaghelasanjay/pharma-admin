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
import { userAddressAPI, userAPI } from "@/lib/api";

const UserAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    UserId: "",
    DeliverToName: "",
    MobileNumber: "",
    BuildingName: "",
    Locality: "",
    AddressType: "Home",
    Pincode: "",
    City: "",
    State: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
    fetchUsers();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await userAddressAPI.list();
      setAddresses(response.data || response);
    } catch (error) {
      toast({ 
        title: "Error fetching addresses", 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        await userAddressAPI.update({
          UserAddressId: editingAddress.UserAddressId,
          ...formData,
          UserId: parseInt(formData.UserId),
        });
        toast({ title: "Address updated successfully" });
      } else {
        await userAddressAPI.create({
          ...formData,
          UserId: parseInt(formData.UserId),
        });
        toast({ title: "Address created successfully" });
      }

      fetchAddresses();
      setIsDialogOpen(false);
      setEditingAddress(null);
      setFormData({
        UserId: "",
        DeliverToName: "",
        MobileNumber: "",
        BuildingName: "",
        Locality: "",
        AddressType: "Home",
        Pincode: "",
        City: "",
        State: "",
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      UserId: address.UserId.toString(),
      DeliverToName: address.DeliverToName,
      MobileNumber: address.MobileNumber,
      BuildingName: address.BuildingName,
      Locality: address.Locality,
      AddressType: address.AddressType,
      Pincode: address.Pincode,
      City: address.City,
      State: address.State,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await userAddressAPI.delete(id);
      toast({ title: "Address deleted successfully" });
      fetchAddresses();
    } catch (error) {
      toast({ 
        title: "Error deleting address", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Address Management</h1>
          <p className="text-muted-foreground">Manage user delivery addresses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAddress(null);
              setFormData({
                UserId: "",
                DeliverToName: "",
                MobileNumber: "",
                BuildingName: "",
                Locality: "",
                AddressType: "Home",
                Pincode: "",
                City: "",
                State: "",
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                {editingAddress ? "Update address details" : "Create a new delivery address"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Select User</Label>
                  <Select
                    value={formData.UserId}
                    onValueChange={(value) => setFormData({ ...formData, UserId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.UserId} value={user.UserId.toString()}>
                          {user.UserId} - {user.FullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliverToName">Deliver To Name</Label>
                  <Input
                    id="deliverToName"
                    value={formData.DeliverToName}
                    onChange={(e) => setFormData({ ...formData, DeliverToName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.MobileNumber}
                    onChange={(e) => setFormData({ ...formData, MobileNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressType">Address Type</Label>
                  <Select
                    value={formData.AddressType}
                    onValueChange={(value) => setFormData({ ...formData, AddressType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="building">Building Name</Label>
                  <Input
                    id="building"
                    value={formData.BuildingName}
                    onChange={(e) => setFormData({ ...formData, BuildingName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="locality">Locality</Label>
                  <Input
                    id="locality"
                    value={formData.Locality}
                    onChange={(e) => setFormData({ ...formData, Locality: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.Pincode}
                    onChange={(e) => setFormData({ ...formData, Pincode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.City}
                    onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.State}
                    onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingAddress ? "Update" : "Create"}
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
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.map((address) => (
              <TableRow key={address.UserAddressId}>
                <TableCell>{address.UserAddressId}</TableCell>
                <TableCell>{address.UserId}</TableCell>
                <TableCell>{address.DeliverToName}</TableCell>
                <TableCell>{address.MobileNumber}</TableCell>
                <TableCell>{address.AddressType}</TableCell>
                <TableCell>{address.City}</TableCell>
                <TableCell>{address.State}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(address)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(address.UserAddressId)}
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

export default UserAddress;