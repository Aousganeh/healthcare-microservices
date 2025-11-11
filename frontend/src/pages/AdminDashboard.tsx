import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield, User as UserIcon, Search, Filter, Settings, Plus, Edit2, Trash2, Award } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllUsers, updateUserRole, getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization, getDepartments, createDepartment, updateDepartment, deleteDepartment, type User } from "@/lib/api";
import type { Department, Specialization } from "@/types/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [specializationSearch, setSpecializationSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
  const [isSpecializationDialogOpen, setIsSpecializationDialogOpen] = useState(false);
  const [specializationFormData, setSpecializationFormData] = useState({ name: "", description: "", active: true });
  
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [departmentFormData, setDepartmentFormData] = useState({ name: "", description: "", active: true });
  
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const {
    data: specializations = [],
    isLoading: isLoadingSpecializations,
  } = useQuery({
    queryKey: ["specializations"],
    queryFn: getSpecializations,
  });

  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
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

  const createSpecializationMutation = useMutation({
    mutationFn: (data: Partial<Specialization>) => createSpecialization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Specialization created successfully");
      setIsSpecializationDialogOpen(false);
      setSpecializationFormData({ name: "", description: "", active: true });
      setSelectedSpecialization(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to create specialization", {
        description: error.message,
      });
    },
  });

  const updateSpecializationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Specialization> }) => updateSpecialization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Specialization updated successfully");
      setIsSpecializationDialogOpen(false);
      setSpecializationFormData({ name: "", description: "", active: true });
      setSelectedSpecialization(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update specialization", {
        description: error.message,
      });
    },
  });

  const deleteSpecializationMutation = useMutation({
    mutationFn: (id: number) => deleteSpecialization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
      toast.success("Specialization deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete specialization", {
        description: error.message,
      });
    },
  });

  const createDepartmentMutation = useMutation({
    mutationFn: (data: Partial<Department>) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully");
      setIsDepartmentDialogOpen(false);
      setDepartmentFormData({ name: "", description: "", active: true });
      setSelectedDepartment(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to create department", {
        description: error.message,
      });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Department> }) => updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully");
      setIsDepartmentDialogOpen(false);
      setDepartmentFormData({ name: "", description: "", active: true });
      setSelectedDepartment(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update department", {
        description: error.message,
      });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete department", {
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

  const filteredSpecializations = specializations.filter((spec: Specialization) => {
    return spec.name.toLowerCase().includes(specializationSearch.toLowerCase()) ||
           (spec.description ?? "").toLowerCase().includes(specializationSearch.toLowerCase());
  });

  const filteredDepartments = departments.filter((dept: Department) => {
    return dept.name.toLowerCase().includes(departmentSearch.toLowerCase()) ||
           (dept.description ?? "").toLowerCase().includes(departmentSearch.toLowerCase());
  });

  const uniqueRoles = Array.from(new Set(users.flatMap((user: User) => user.roles))).sort();

  const availableRoles = ["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN"];

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.roles[0] || "ROLE_PATIENT");
    setIsDialogOpen(true);
  };

  const handleChangeRole = () => {
    if (selectedUser && selectedRole) {
      updateRoleMutation.mutate({ email: selectedUser.email, role: selectedRole });
    }
  };

  const handleOpenSpecializationDialog = (specialization?: Specialization) => {
    if (specialization) {
      setSelectedSpecialization(specialization);
      setSpecializationFormData({
        name: specialization.name,
        description: specialization.description || "",
        active: specialization.active ?? true,
      });
    } else {
      setSelectedSpecialization(null);
      setSpecializationFormData({ name: "", description: "", active: true });
    }
    setIsSpecializationDialogOpen(true);
  };

  const handleSaveSpecialization = () => {
    if (selectedSpecialization) {
      updateSpecializationMutation.mutate({
        id: selectedSpecialization.id,
        data: specializationFormData,
      });
    } else {
      createSpecializationMutation.mutate(specializationFormData);
    }
  };

  const handleDeleteSpecialization = (id: number) => {
    if (confirm("Are you sure you want to delete this specialization?")) {
      deleteSpecializationMutation.mutate(id);
    }
  };

  const handleOpenDepartmentDialog = (department?: Department) => {
    if (department) {
      setSelectedDepartment(department);
      setDepartmentFormData({
        name: department.name,
        description: department.description || "",
        active: department.active ?? true,
      });
    } else {
      setSelectedDepartment(null);
      setDepartmentFormData({ name: "", description: "", active: true });
    }
    setIsDepartmentDialogOpen(true);
  };

  const handleSaveDepartment = () => {
    if (selectedDepartment) {
      updateDepartmentMutation.mutate({
        id: selectedDepartment.id,
        data: departmentFormData,
      });
    } else {
      createDepartmentMutation.mutate(departmentFormData);
    }
  };

  const handleDeleteDepartment = (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteDepartmentMutation.mutate(id);
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
            <p className="text-xl text-muted-foreground">Manage users, roles, and specializations</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="specializations">Specializations</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
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
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
                              className="w-full sm:w-auto"
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
              </TabsContent>

              <TabsContent value="specializations">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search specializations..."
                      className="pl-9"
                      value={specializationSearch}
                      onChange={(e) => setSpecializationSearch(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleOpenSpecializationDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specialization
                  </Button>
                </div>

                {isLoadingSpecializations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading specializations...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSpecializations.map((spec: Specialization) => (
                      <Card key={spec.id} className="hover:shadow-glow transition-all duration-300">
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2 mb-2">
                                <Award className="h-5 w-5 text-primary" />
                                {spec.name}
                              </CardTitle>
                              {spec.description && (
                                <p className="text-sm text-muted-foreground mb-3">{spec.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={spec.active ? "default" : "secondary"}>
                                  {spec.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenSpecializationDialog(spec)}
                                disabled={updateSpecializationMutation.isPending || deleteSpecializationMutation.isPending}
                                className="w-full sm:w-auto"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteSpecialization(spec.id)}
                                disabled={deleteSpecializationMutation.isPending}
                                className="w-full sm:w-auto"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}

                {!isLoadingSpecializations && filteredSpecializations.length === 0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                    <p className="text-muted-foreground">
                      No specializations found. Create your first specialization to get started.
                    </p>
                  </div>
                )}

                {!isLoadingSpecializations && (
                  <div className="mt-6 text-sm text-muted-foreground text-center">
                    Total specializations: {specializations.length} | Filtered: {filteredSpecializations.length}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="departments">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search departments..."
                      className="pl-9"
                      value={departmentSearch}
                      onChange={(e) => setDepartmentSearch(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleOpenDepartmentDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>

                {isLoadingDepartments ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading departments...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDepartments.map((dept: Department) => (
                      <Card key={dept.id} className="hover:shadow-glow transition-all duration-300">
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2 mb-2">
                                <Award className="h-5 w-5 text-primary" />
                                {dept.name}
                              </CardTitle>
                              {dept.description && (
                                <p className="text-sm text-muted-foreground mb-3">{dept.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={dept.active ? "default" : "secondary"}>
                                  {dept.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDepartmentDialog(dept)}
                                disabled={updateDepartmentMutation.isPending || deleteDepartmentMutation.isPending}
                                className="w-full sm:w-auto"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteDepartment(dept.id)}
                                disabled={deleteDepartmentMutation.isPending}
                                className="w-full sm:w-auto"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}

                {!isLoadingDepartments && filteredDepartments.length === 0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                    <p className="text-muted-foreground">
                      No departments found. Create your first department to get started.
                    </p>
                  </div>
                )}

                {!isLoadingDepartments && (
                  <div className="mt-6 text-sm text-muted-foreground text-center">
                    Total departments: {departments.length} | Filtered: {filteredDepartments.length}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

      <Dialog open={isSpecializationDialogOpen} onOpenChange={setIsSpecializationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSpecialization ? "Edit Specialization" : "Create Specialization"}
            </DialogTitle>
            <DialogDescription>
              {selectedSpecialization
                ? "Update the specialization details"
                : "Add a new specialization that doctors can select"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spec-name">Name *</Label>
              <Input
                id="spec-name"
                value={specializationFormData.name}
                onChange={(e) => setSpecializationFormData({ ...specializationFormData, name: e.target.value })}
                placeholder="e.g., Cardiology"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spec-description">Description</Label>
              <Textarea
                id="spec-description"
                value={specializationFormData.description}
                onChange={(e) => setSpecializationFormData({ ...specializationFormData, description: e.target.value })}
                placeholder="Brief description of the specialization..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="spec-active"
                checked={specializationFormData.active}
                onChange={(e) => setSpecializationFormData({ ...specializationFormData, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="spec-active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpecializationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSpecialization}
              disabled={
                (createSpecializationMutation.isPending || updateSpecializationMutation.isPending) ||
                !specializationFormData.name.trim()
              }
            >
              {(createSpecializationMutation.isPending || updateSpecializationMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                selectedSpecialization ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
