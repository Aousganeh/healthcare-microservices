import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield, User as UserIcon, UserCheck, UserX, Search, Filter } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllUsers, updateUserRole, addRoleToUser, type User } from "@/lib/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
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
    },
    onError: (error: Error) => {
      toast.error("Failed to update user role", {
        description: error.message,
      });
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => addRoleToUser(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add role", {
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

  const handleMakeDoctor = (user: User) => {
    updateRoleMutation.mutate({ email: user.email, role: "ROLE_DOCTOR" });
  };

  const handleMakeAdmin = (user: User) => {
    addRoleMutation.mutate({ email: user.email, role: "ROLE_ADMIN" });
  };

  const handleMakeUser = (user: User) => {
    updateRoleMutation.mutate({ email: user.email, role: "ROLE_USER" });
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
                        <div className="flex flex-col gap-2">
                          {!user.roles.includes("ROLE_DOCTOR") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeDoctor(user)}
                              disabled={updateRoleMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Make Doctor
                            </Button>
                          )}
                          {!user.roles.includes("ROLE_ADMIN") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeAdmin(user)}
                              disabled={addRoleMutation.isPending}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </Button>
                          )}
                          {user.roles.some((r) => r !== "ROLE_USER") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeUser(user)}
                              disabled={updateRoleMutation.isPending}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Make User
                            </Button>
                          )}
                        </div>
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
    </div>
  );
};

export default AdminDashboard;

