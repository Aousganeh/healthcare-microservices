import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield, User as UserIcon, Search, Filter, Settings } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllUsers, updateUserRole, type User } from "@/lib/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => updateUserRole(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
      setIsDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
    },
    onError: (error: Error) => {
      toast.error("Failed to update user role", {
        description: error.message,
      });
    },
  });

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.lastName ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      user.roles.some((role) => role.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(users.flatMap((user: User) => user.roles))).sort();

  const availableRoles = ["ROLE_USER", "ROLE_DOCTOR", "ROLE_ADMIN"];

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.roles[0] || "ROLE_USER");
    setIsDialogOpen(true);
  };

  const handleChangeRole = () => {
    if (selectedUser && selectedRole) {
      updateRoleMutation.mutate({ email: selectedUser.email, role: selectedRole });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "ROLE_ADMIN") return "destructive";
    if (role === "ROLE_DOCTOR") return "default";
    return "secondary";
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="mb-0">Admin Dashboard</h1>
            </div>
            <p className="text-xl text-muted-foreground">Manage users and their roles</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by email, first name, or last name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:w-64">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role.toLowerCase()}>
                        {role.replace("ROLE_", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-destructive text-center">
                Unable to load users. Please try again later.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user: User) => (
                  <Card key={user.email} className="hover:shadow-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <UserIcon className="h-5 w-5 text-primary" />
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map((role) => (
                              <Badge key={role} variant={getRoleBadgeVariant(role)}>
                                {role.replace("ROLE_", "")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Change Role
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredUsers.length === 0 && !isError && (
              <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <p className="text-muted-foreground">
                  No users match your filters. Try adjusting your search or filters.
                </p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="mt-6 text-sm text-muted-foreground text-center">
                Total users: {users.length} | Filtered: {filteredUsers.length}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {selectedUser?.firstName && selectedUser?.lastName
                ? `${selectedUser.firstName} ${selectedUser.lastName}`
                : selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace("ROLE_", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUser && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Current roles:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map((role) => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)}>
                      {role.replace("ROLE_", "")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={updateRoleMutation.isPending || !selectedRole}
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

