import React, { useState } from "react";
import { Button } from "@/componentsuper/ui/button";
import { toast } from "sonner";
import { Check, X, Info, AlertCircle, Search, Plus, Users, Settings, LayoutDashboard, Building2, FileText, PieChart, MessageSquare, Sliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/componentsuper/ui/tabs";
import { Switch } from "@/componentsuper/ui/switch";
import { Separator } from "@/componentsuper/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/componentsuper/ui/tooltip";
import { Badge } from "@/componentsuper/ui/badge";

// Define proper User interface to match what's being passed from the page
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  lastActive?: string;
  avatar?: string; // Make avatar optional since it might not be in the actual user data
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "content", label: "Content", icon: FileText },
  { id: "user-accounts", label: "User Accounts", icon: Users },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "chat-analysis", label: "Chat Analysis", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Sliders },
];

const permissionPresets = {
  "dashboard": [
    { id: "admin", name: "Admin", description: "Full access to all dashboard features", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "viewer", name: "Viewer", description: "Can only view dashboard data", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
  "businesses": [
    { id: "admin", name: "Admin", description: "Full access to all business data", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "editor", name: "Editor", description: "Can view and edit business data", permissions: { view: true, create: false, edit: true, delete: false } },
    { id: "viewer", name: "Viewer", description: "Can only view business data", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
  "content": [
    { id: "admin", name: "Admin", description: "Full access to all content", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "creator", name: "Creator", description: "Can create and edit content", permissions: { view: true, create: true, edit: true, delete: false } },
    { id: "editor", name: "Editor", description: "Can edit existing content", permissions: { view: true, create: false, edit: true, delete: false } },
    { id: "viewer", name: "Viewer", description: "Can only view content", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
  "user-accounts": [
    { id: "admin", name: "Admin", description: "Full access to user management", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "manager", name: "Manager", description: "Can manage users but not delete", permissions: { view: true, create: true, edit: true, delete: false } },
    { id: "viewer", name: "Viewer", description: "Can only view user data", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
  "analytics": [
    { id: "admin", name: "Admin", description: "Full access to analytics", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "analyst", name: "Analyst", description: "Can view and create reports", permissions: { view: true, create: true, edit: false, delete: false } },
    { id: "viewer", name: "Viewer", description: "Can only view analytics", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
  "chat-analysis": [
    { id: "admin", name: "Admin", description: "Full access to chat analysis", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "analyst", name: "Analyst", description: "Can analyze and create reports", permissions: { view: true, create: true, edit: true, delete: false } },
    { id: "viewer", name: "Viewer", description: "Can only view chat analysis", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
  "settings": [
    { id: "admin", name: "Admin", description: "Full access to settings", permissions: { view: true, create: true, edit: true, delete: true } },
    { id: "manager", name: "Manager", description: "Can view and edit settings", permissions: { view: true, create: false, edit: true, delete: false } },
    { id: "viewer", name: "Viewer", description: "Can only view settings", permissions: { view: true, create: false, edit: false, delete: false } },
  ],
};

interface PermissionModalProps {
  onClose: () => void;
  roles?: string[];
  modules?: string[];
  actions?: string[];
  user: User; // Make user required
}

const PermissionModal: React.FC<PermissionModalProps> = ({ 
  onClose, 
  roles = [], 
  modules = [], 
  actions = [], 
  user 
}) => {
  const [selectedTab, setSelectedTab] = useState("specific");
  const [permissions, setPermissions] = useState({
    all: false,
    view: false,
    create: false,
    edit: false,
    delete: false
  });
  const [selectedSidebarItem, setSelectedSidebarItem] = useState("dashboard");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleToggleAll = (checked: boolean) => {
    setPermissions({
      all: checked,
      view: checked,
      create: checked,
      edit: checked,
      delete: checked
    });
  };

  const handleTogglePermission = (permission: keyof typeof permissions, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked,
      all: permission !== 'all' ? 
        prev.view && prev.create && prev.edit && prev.delete && checked : 
        prev.all
    }));
  };

  const getPresetPermissions = (presetId: string) => {
    switch(presetId) {
      case "full-access":
        return { view: true, create: true, edit: true, delete: true };
      case "read-only":
        return { view: true, create: false, edit: false, delete: false };
      case "standard-admin":
        return { view: true, create: true, edit: true, delete: false };
      case "business-user":
        return { view: true, create: false, edit: true, delete: false };
      case "no-access":
        return { view: false, create: false, edit: false, delete: false };
      case "custom":
        // Return current permissions for editing
        return { 
          view: permissions.view, 
          create: permissions.create,
          edit: permissions.edit, 
          delete: permissions.delete 
        };
      default:
        // Use existing logic for your original presets
        const preset = permissionPresets[selectedSidebarItem as keyof typeof permissionPresets]?.find(p => p.id === presetId);
        return preset?.permissions || { view: false, create: false, edit: false, delete: false };
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const presetPermissions = getPresetPermissions(presetId);
    
    setPermissions({
      all: Object.values(presetPermissions).every(Boolean),
      ...presetPermissions
    });
    
    if (presetId === "custom") {
      // If custom is selected, switch to specific permissions tab
      setSelectedTab("specific");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      
      // Simple toast without try-catch which might be causing issues
      toast.success(`Permissions for ${user.name} on ${sidebarItems.find(item => item.id === selectedSidebarItem)?.label} updated successfully`, {
        position: "bottom-right", // Position at bottom right
        style: {
          backgroundColor: "#9333ea", // Purple-600 background to match project
          color: "white",
          border: "1px solid #7e22ce" // Purple-700 border
        },
        duration: 4000, // Show for 4 seconds
      });
      
      onClose();
    }, 800);
  };

  React.useEffect(() => {
    // If switching to presets tab and a preset is selected, update permissions
    if (selectedTab === "presets" && selectedPreset) {
      const preset = permissionPresets[selectedSidebarItem as keyof typeof permissionPresets]?.find(p => p.id === selectedPreset);
      if (preset) {
        setPermissions({
          all: Object.values(preset.permissions).every(Boolean),
          ...preset.permissions
        });
      }
    }
  }, [selectedTab, selectedPreset, selectedSidebarItem]);

  // Modify the tab change handler to be more explicit
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value); // Add logging
    setSelectedTab(value);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 overflow-auto p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl relative w-full max-w-3xl max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {user.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-base font-medium">{user.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-300">{user.email}</p>
            <Badge variant="secondary" className="mt-0.5 text-xs dark:bg-gray-700 dark:text-gray-200">
              {user.role === 'ADMIN' ? 'System Admin' : 
               user.role === 'BUSINESS' ? 'Business Admin' : user.role}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-3 flex-1 overflow-auto">
          {/* Sidebar Navigation - make it narrower but ensure text is visible */}
          <div className="w-[22%] border-r pr-2 space-y-1">
            {sidebarItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => {
                  setSelectedSidebarItem(item.id);
                  setSelectedPreset(null); // Reset preset selection when changing modules
                }}
                className={`flex items-center gap-2 p-2 w-full rounded-md text-sm font-medium cursor-pointer ${
                  item.id === selectedSidebarItem
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="whitespace-normal">{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Main content - give it more space */}
          <div className="flex-1 pl-1 flex flex-col min-h-0">
            {/* Alternative approach - manual tab implementation instead of using the Tabs component */}
            <div className="w-full">
              <div className="flex w-full mb-6 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                <button 
                  onClick={() => setSelectedTab("specific")}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    selectedTab === "specific" 
                      ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Specific Permissions
                </button>
                <button 
                  onClick={() => setSelectedTab("presets")}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    selectedTab === "presets" 
                      ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" 
                      : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Permission Presets
                </button>
              </div>
              
              {selectedTab === "specific" ? (
                <div className="mt-2 min-h-[320px]"> {/* Reduced from min-h-[380px] */}
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium"> {/* Reduced from text-md */}
                        Specific Permissions for {sidebarItems.find(item => item.id === selectedSidebarItem)?.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5"> {/* Reduced from text-sm mt-1 */}
                        Fine-tune individual permissions for this module.
                      </p>
                    </div>
                    
                    <div className="flex justify-end mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">All permissions:</span>
                        <Switch 
                          checked={permissions.all}
                          onCheckedChange={(checked) => handleToggleAll(checked)}
                          className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300 
                            relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full 
                            border-2 border-transparent transition-colors duration-200 ease-in-out 
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
                            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                            dark:data-[state=checked]:bg-purple-500 dark:data-[state=unchecked]:bg-gray-700 
                            before:data-[state=checked]:translate-x-5 before:data-[state=unchecked]:translate-x-0
                            before:absolute before:top-[-1px] before:h-[22px] before:w-[22px] before:rounded-full
                            before:bg-white before:shadow-sm before:transition-transform before:duration-200"
                        />
                      </div>
                    </div>
                    
                    {/* Match the grid layout to presets: 2×2 layout for permissions */}
                    <div className="grid grid-cols-2 grid-rows-2 gap-4 mb-8">
                      {/* View Permission Card */}
                      <div className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                        permissions.view 
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                          : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                      }`}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">View</span>
                          <Switch 
                            checked={permissions.view}
                            onCheckedChange={(checked) => handleTogglePermission('view', checked)}
                            className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300 
                              relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full 
                              border-2 border-transparent transition-colors duration-200 ease-in-out 
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
                              focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                              dark:data-[state=checked]:bg-purple-500 dark:data-[state=unchecked]:bg-gray-700 
                              before:data-[state=checked]:translate-x-5 before:data-[state=unchecked]:translate-x-0
                              before:absolute before:top-[-1px] before:h-[22px] before:w-[22px] before:rounded-full
                              before:bg-white before:shadow-sm before:transition-transform before:duration-200"
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Access to view this content</p>
                      </div>
                      
                      {/* Create Permission Card */}
                      <div className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                        permissions.create 
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                          : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                      }`}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Create</span>
                          <Switch 
                            checked={permissions.create}
                            onCheckedChange={(checked) => handleTogglePermission('create', checked)}
                            className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300 
                              relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full 
                              border-2 border-transparent transition-colors duration-200 ease-in-out 
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
                              focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                              dark:data-[state=checked]:bg-purple-500 dark:data-[state=unchecked]:bg-gray-700 
                              before:data-[state=checked]:translate-x-5 before:data-[state=unchecked]:translate-x-0
                              before:absolute before:top-[-1px] before:h-[22px] before:w-[22px] before:rounded-full
                              before:bg-white before:shadow-sm before:transition-transform before:duration-200"
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Ability to create new content</p>
                      </div>
                      
                      {/* Edit Permission Card */}
                      <div className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                        permissions.edit 
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                          : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                      }`}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Edit</span>
                          <Switch 
                            checked={permissions.edit}
                            onCheckedChange={(checked) => handleTogglePermission('edit', checked)}
                            className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300 
                              relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full 
                              border-2 border-transparent transition-colors duration-200 ease-in-out 
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
                              focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                              dark:data-[state=checked]:bg-purple-500 dark:data-[state=unchecked]:bg-gray-700 
                              before:data-[state=checked]:translate-x-5 before:data-[state=unchecked]:translate-x-0
                              before:absolute before:top-[-1px] before:h-[22px] before:w-[22px] before:rounded-full
                              before:bg-white before:shadow-sm before:transition-transform before:duration-200"
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Ability to modify existing content</p>
                      </div>
                      
                      {/* Delete Permission Card */}
                      <div className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                        permissions.delete 
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                          : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                      }`}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Delete</span>
                          <Switch 
                            checked={permissions.delete}
                            onCheckedChange={(checked) => handleTogglePermission('delete', checked)}
                            className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300 
                              relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full 
                              border-2 border-transparent transition-colors duration-200 ease-in-out 
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
                              focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                              dark:data-[state=checked]:bg-purple-500 dark:data-[state=unchecked]:bg-gray-700 
                              before:data-[state=checked]:translate-x-5 before:data-[state=unchecked]:translate-x-0
                              before:absolute before:top-[-1px] before:h-[22px] before:w-[22px] before:rounded-full
                              before:bg-white before:shadow-sm before:transition-transform before:duration-200"
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Ability to remove existing content</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-start gap-2 text-xs"> {/* Reduced from mt-6 p-3 text-sm */}
                      <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                      <span className="text-blue-700 dark:text-blue-300">
                        These permissions apply specifically to the {sidebarItems.find(item => item.id === selectedSidebarItem)?.label.toLowerCase()} module. You can also use predefined permission presets from the other tab.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 min-h-[320px]"> {/* Reduced from min-h-[380px] */}
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium"> {/* Reduced from text-md */}
                        Permission Presets for {sidebarItems.find(item => item.id === selectedSidebarItem)?.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5"> {/* Reduced from text-sm mt-1 */}
                        Quickly apply predefined permission sets to streamline user access management.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 grid-rows-2 gap-3 mb-6"> {/* Reduced from gap-4 mb-8 */}
                      {/* Full Access Preset - Row 1, Column 1 */}
                      <button
                        onClick={() => handleSelectPreset("full-access")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                          selectedPreset === "full-access" 
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                            : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Full Access</span>
                          {selectedPreset === "full-access" && (
                            <Check className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">All permissions granted</p>
                      </button>

                      {/* Standard Admin Preset - Row 1, Column 2 */}
                      <button
                        onClick={() => handleSelectPreset("standard-admin")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                          selectedPreset === "standard-admin" 
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                            : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Standard Admin</span>
                          {selectedPreset === "standard-admin" && (
                            <Check className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Typical admin permissions</p>
                      </button>

                      {/* Business User Preset - Row 1, Column 3 */}
                      <button
                        onClick={() => handleSelectPreset("business-user")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                          selectedPreset === "business-user" 
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                            : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Business User</span>
                          {selectedPreset === "business-user" && (
                            <Check className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Limited to business functions</p>
                      </button>

                      {/* Read Only Preset - Row 2, Column 1 */}
                      <button
                        onClick={() => handleSelectPreset("read-only")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                          selectedPreset === "read-only" 
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                            : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Read Only</span>
                          {selectedPreset === "read-only" && (
                            <Check className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Only view permissions</p>
                      </button>

                      {/* No Access Preset - Row 2, Column 2 */}
                      <button
                        onClick={() => handleSelectPreset("no-access")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                          selectedPreset === "no-access" 
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                            : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">No Access</span>
                          {selectedPreset === "no-access" && (
                            <Check className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">All permissions revoked</p>
                      </button>

                      {/* Custom Preset - Row 2, Column 3 */}
                      <button
                        onClick={() => handleSelectPreset("custom")}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left w-full transition-all duration-200 ${/* Reduced from p-4 */
                          selectedPreset === "custom" 
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 shadow-md" 
                            : "bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-purple-700 dark:text-purple-300">Custom</span>
                          {selectedPreset === "custom" && (
                            <Check className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Manually configured</p>
                      </button>
                    </div>
                    
                    <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-start gap-2 text-xs"> {/* Reduced from mt-6 p-3 text-sm */}
                      <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                      <span className="text-blue-700 dark:text-blue-300">
                        Selecting a preset will automatically configure the specific permissions for the user. You can switch to the Specific Permissions tab to make further adjustments.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Cancel</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
