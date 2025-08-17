
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseAppointments } from '@/hooks/useSupabaseAppointments';
import { 
  Settings, 
  User, 
  CreditCard, 
  Database, 
  FileText, 
  Stethoscope, 
  Bell, 
  Shield, 
  HardDrive,
  Palette,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  Users,
  UserPlus,
  Mail,
  Key,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const AdminSettings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clinicians, loading, error } = useSupabaseAppointments();
  const [activeTab, setActiveTab] = useState('account');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    role: 'clinician',
    accountStatus: true
  });
  
  // Check if user has permission to access user management
  const canManageUsers = currentUser?.role === 'supervisor' || currentUser?.role === 'admin';
  
  // Use real users from Supabase instead of mock data
  const allUsers = [...clinicians];
  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor') && !clinicians.find(c => c.id === currentUser.id)) {
    allUsers.unshift(currentUser);
  }
  const [settings, setSettings] = useState({
    // Account Profile
    clinicName: 'Eira Clinical Nexus',
    clinicAddress: '123 Medical Street\nHealthcare District\nCity, Province 12345',
    clinicContactNumber: '+27 11 123 4567',
    displayName: 'Dr. John Smith',
    role: 'Physiotherapist',
    email: 'john.smith@clinic.com',
    phoneNumber: '+27 82 123 4567',
    twoFactorAuth: false,
    
    // Subscription & Billing
    currentTier: 'Professional',
    billingPeriod: 'Monthly',
    nextPaymentDate: '2024-02-15',
    enableSetupFee: true,
    feePerNewUser: 150,
    applyToRange: 'users 6–10',
    
    // EDI Integrations
    enableAdvancedEdi: false,
    ediCredentials: '',
    ediEndpointUrl: '',
    accountingSoftware: 'Xero',
    medicalAidPortals: ['Discovery', 'Momentum'],
    notificationProvider: 'Email',
    
    // Clinical Settings
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '24-hour',
    heightUnit: 'cm',
    weightUnit: 'kg',
    quickAddTests: ['SLR', 'Thomas Test', 'Trendelenburg'],
    
    // Notifications & Reminders
    uncompletedReports: true,
    upcomingAppointments: true,
    enableEmail: true,
    enableSms: false,
    reminderLeadTime: '4h',
    
    // Security & Privacy
    autoLogoutMinutes: 30,
    enableLocalEncrypt: true,
    
    // Data Backup
    backupFrequency: 'Daily',
    cloudStorageOption: 'Google Drive',
    
    // Appearance & Accessibility
    appTheme: 'System',
    fontSize: 'Medium',
    appLanguage: 'English'
  });

  const [templates] = useState([
    { id: 1, name: 'Initial Assessment', type: 'Assessment', lastModified: '2024-01-15' },
    { id: 2, name: 'Progress Note', type: 'Progress', lastModified: '2024-01-10' },
    { id: 3, name: 'Discharge Summary', type: 'Discharge', lastModified: '2024-01-08' }
  ]);



  const [userPermissions, setUserPermissions] = useState({
    viewPatients: true,
    editPatients: true,
    deletePatients: false,
    viewAppointments: true,
    editAppointments: true,
    deleteAppointments: false,
    viewReports: true,
    editReports: true,
    deleteReports: false,
    viewSettings: false,
    editSettings: false,
    manageUsers: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = () => {
    navigate('/admin/users');
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      accountStatus: user.accountStatus
    });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Update existing user
      console.log('Updated user:', newUser);
    } else {
      // Add new user
      console.log('Added new user:', newUser);
    }
    setIsUserDialogOpen(false);
  };

  const handleInviteUser = () => {
    console.log('Inviting user:', inviteEmail);
    setInviteEmail('');
    setIsInviteDialogOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    console.log('Removed user:', userId);
  };

  const handleResetPassword = (userId: string) => {
    console.log('Resetting password for user:', userId);
  };

  const handleChangePermissions = (user: any) => {
    setSelectedUser(user);
    // Load user-specific permissions (in a real app, this would come from the backend)
    setUserPermissions({
      viewPatients: true,
      editPatients: user.role !== 'clinician',
      deletePatients: user.role === 'admin' || user.role === 'supervisor',
      viewAppointments: true,
      editAppointments: true,
      deleteAppointments: user.role === 'admin' || user.role === 'supervisor',
      viewReports: true,
      editReports: true,
      deleteReports: user.role === 'admin' || user.role === 'supervisor',
      viewSettings: user.role === 'admin' || user.role === 'supervisor',
      editSettings: user.role === 'admin' || user.role === 'supervisor',
      manageUsers: user.role === 'admin' || user.role === 'supervisor'
    });
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const handleSavePermissions = () => {
    console.log('Saving permissions for user:', selectedUser?.displayName, userPermissions);
    // In a real app, this would save to the backend
    setIsPermissionDialogOpen(false);
  };

  const handleFileUpload = (key: string) => {
    // File upload logic would go here
    console.log(`Uploading file for ${key}`);
  };

  const handleExportData = (format: string) => {
    console.log(`Exporting data as ${format}`);
  };

  const handleImportData = (format: string) => {
    console.log(`Importing data from ${format}`);
  };

  return (
    <MainLayout currentPath="/admin/settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            {currentUser && (
              <p className="text-sm text-blue-600 mt-2">
                Logged in as: {currentUser.firstName} {currentUser.lastName} ({currentUser.role})
              </p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                localStorage.removeItem('currentUser');
                window.location.reload();
              }}
            >
              Reset Session (Switch User)
            </Button>
          <p className="text-gray-600">Configure your clinic settings and preferences</p>
        </div>

        {/* Save Changes Bar */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-800">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setHasUnsavedChanges(false)}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="edi" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">EDI</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Clinical</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            {canManageUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Account Profile Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6">
              {/* Clinic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Clinic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="clinicName">Clinic Name</Label>
                      <Input
                        id="clinicName"
                        value={settings.clinicName}
                        onChange={(e) => handleSettingChange('clinicName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicAddress">Clinic Address</Label>
                      <Textarea
                        id="clinicAddress"
                        value={settings.clinicAddress}
                        onChange={(e) => handleSettingChange('clinicAddress', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicContact">Contact Number</Label>
                      <Input
                        id="clinicContact"
                        value={settings.clinicContactNumber}
                        onChange={(e) => handleSettingChange('clinicContactNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Clinic Logo</Label>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleFileUpload('clinicLogo')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        <span className="text-sm text-gray-500">PNG, JPG up to 2MB</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={settings.displayName}
                        onChange={(e) => handleSettingChange('displayName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={settings.role} onValueChange={(value) => handleSettingChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physiotherapist">Physiotherapist</SelectItem>
                          <SelectItem value="Assistant">Assistant</SelectItem>
                          <SelectItem value="Receptionist">Receptionist</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={settings.phoneNumber}
                        onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription & Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid gap-6">
              {/* Plan Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Current Tier</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{settings.currentTier}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Billing Period</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{settings.billingPeriod}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Next Payment Date</Label>
                      <Input value={settings.nextPaymentDate} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Onboarding Fees */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Setup Fee</Label>
                      <p className="text-sm text-gray-500">Charge setup fee for new users</p>
                    </div>
                    <Switch
                      checked={settings.enableSetupFee}
                      onCheckedChange={(checked) => handleSettingChange('enableSetupFee', checked)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feePerUser">Fee per New User (ZAR)</Label>
                    <Input
                      id="feePerUser"
                      type="number"
                      value={settings.feePerNewUser}
                      onChange={(e) => handleSettingChange('feePerNewUser', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="applyRange">Apply to Range</Label>
                    <Input
                      id="applyRange"
                      value={settings.applyToRange}
                      onChange={(e) => handleSettingChange('applyToRange', e.target.value)}
                      placeholder="e.g. users 6–10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade/Downgrade */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button>Change Plan</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EDI Integrations Tab */}
          <TabsContent value="edi" className="space-y-6">
            <div className="grid gap-6">
              {/* EDI Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>EDI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Advanced EDI</Label>
                      <p className="text-sm text-gray-500">Electronic Data Interchange</p>
                    </div>
                    <Switch
                      checked={settings.enableAdvancedEdi}
                      onCheckedChange={(checked) => handleSettingChange('enableAdvancedEdi', checked)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ediCredentials">EDI Credentials</Label>
                    <Textarea
                      id="ediCredentials"
                      value={settings.ediCredentials}
                      onChange={(e) => handleSettingChange('ediCredentials', e.target.value)}
                      placeholder="Enter your EDI credentials"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ediEndpoint">EDI Endpoint URL</Label>
                    <Input
                      id="ediEndpoint"
                      type="url"
                      value={settings.ediEndpointUrl}
                      onChange={(e) => handleSettingChange('ediEndpointUrl', e.target.value)}
                      placeholder="https://api.edi-provider.com/endpoint"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Third Party Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Third Party Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Accounting Software</Label>
                    <Select value={settings.accountingSoftware} onValueChange={(value) => handleSettingChange('accountingSoftware', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Xero">Xero</SelectItem>
                        <SelectItem value="QuickBooks">QuickBooks</SelectItem>
                        <SelectItem value="Sage">Sage</SelectItem>
                        <SelectItem value="Pastel">Pastel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Medical Aid Portals</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Discovery', 'Momentum', 'Medscheme', 'Bonitas', 'Fedhealth'].map((portal) => (
                        <Badge 
                          key={portal} 
                          variant={settings.medicalAidPortals.includes(portal) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = settings.medicalAidPortals;
                            const updated = current.includes(portal) 
                              ? current.filter(p => p !== portal)
                              : [...current, portal];
                            handleSettingChange('medicalAidPortals', updated);
                          }}
                        >
                          {portal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Notification Provider</Label>
                    <Select value={settings.notificationProvider} onValueChange={(value) => handleSettingChange('notificationProvider', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Push">Push Notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates & Defaults Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-6">
              {/* Note Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Note Templates</span>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-500">{template.type} • Last modified {template.lastModified}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Header & Footer */}
              <Card>
                <CardHeader>
                  <CardTitle>Header & Footer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Upload Letterhead</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleFileUpload('letterhead')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Letterhead
                      </Button>
                      <span className="text-sm text-gray-500">PDF, PNG, JPG up to 5MB</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="disclaimer">Default Disclaimer</Label>
                    <Textarea
                      id="disclaimer"
                      placeholder="Enter default disclaimer text for reports"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clinical Settings Tab */}
          <TabsContent value="clinical" className="space-y-6">
            <div className="grid gap-6">
              {/* Date & Time Format */}
              <Card>
                <CardHeader>
                  <CardTitle>Date & Time Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                        <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Format</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => handleSettingChange('timeFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12-hour">12-hour</SelectItem>
                        <SelectItem value="24-hour">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Units & Measurements */}
              <Card>
                <CardHeader>
                  <CardTitle>Units & Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Height Unit</Label>
                    <Select value={settings.heightUnit} onValueChange={(value) => handleSettingChange('heightUnit', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="in">Inches (in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Weight Unit</Label>
                    <Select value={settings.weightUnit} onValueChange={(value) => handleSettingChange('weightUnit', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Provocation Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>Provocation Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Quick Add Tests</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['SLR', 'Thomas Test', 'Trendelenburg', 'Lachman', 'McMurray', 'Hawkins', 'Neer'].map((test) => (
                        <Badge 
                          key={test} 
                          variant={settings.quickAddTests.includes(test) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = settings.quickAddTests;
                            const updated = current.includes(test) 
                              ? current.filter(t => t !== test)
                              : [...current, test];
                            handleSettingChange('quickAddTests', updated);
                          }}
                        >
                          {test}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Test Order Visibility</Label>
                    <p className="text-sm text-gray-500 mb-2">Drag to reorder test visibility</p>
                    <div className="space-y-2">
                      {settings.quickAddTests.map((test, index) => (
                        <div key={test} className="flex items-center gap-2 p-2 border rounded">
                          <span className="text-sm font-medium">{index + 1}.</span>
                          <span>{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications & Reminders Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6">
              {/* In-App Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>In-App Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Uncompleted Reports</Label>
                      <p className="text-sm text-gray-500">Alert when reports are pending</p>
                    </div>
                    <Switch
                      checked={settings.uncompletedReports}
                      onCheckedChange={(checked) => handleSettingChange('uncompletedReports', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Upcoming Appointments</Label>
                      <p className="text-sm text-gray-500">Alert for upcoming appointments</p>
                    </div>
                    <Switch
                      checked={settings.upcomingAppointments}
                      onCheckedChange={(checked) => handleSettingChange('upcomingAppointments', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Channels */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Email</Label>
                      <p className="text-sm text-gray-500">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.enableEmail}
                      onCheckedChange={(checked) => handleSettingChange('enableEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable SMS</Label>
                      <p className="text-sm text-gray-500">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.enableSms}
                      onCheckedChange={(checked) => handleSettingChange('enableSms', checked)}
                    />
                  </div>
                  <div>
                    <Label>Reminder Lead Time</Label>
                    <Select value={settings.reminderLeadTime} onValueChange={(value) => handleSettingChange('reminderLeadTime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                        <SelectItem value="1d">1 day</SelectItem>
                        <SelectItem value="2d">2 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security & Privacy Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6">
              {/* Session Timeout */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Timeout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                    <Input
                      id="autoLogout"
                      type="number"
                      value={settings.autoLogoutMinutes}
                      onChange={(e) => handleSettingChange('autoLogoutMinutes', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Encryption */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Encryption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Local Encryption</Label>
                      <p className="text-sm text-gray-500">Encrypt data stored locally</p>
                    </div>
                    <Switch
                      checked={settings.enableLocalEncrypt}
                      onCheckedChange={(checked) => handleSettingChange('enableLocalEncrypt', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audit Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Audit Log
                  </Button>
                </CardContent>
              </Card>

              {/* Data Backup */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Backup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExportData('JSON')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button variant="outline" onClick={() => handleExportData('CSV')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExportData('ZIP')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export ZIP
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleImportData('JSON')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import JSON
                    </Button>
                    <Button variant="outline" onClick={() => handleImportData('CSV')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <Label>Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cloud Storage Option</Label>
                    <Select value={settings.cloudStorageOption} onValueChange={(value) => handleSettingChange('cloudStorageOption', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dropbox">Dropbox</SelectItem>
                        <SelectItem value="Google Drive">Google Drive</SelectItem>
                        <SelectItem value="OneDrive">OneDrive</SelectItem>
                        <SelectItem value="AWS S3">AWS S3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance & Accessibility Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>App Theme</Label>
                    <Select value={settings.appTheme} onValueChange={(value) => handleSettingChange('appTheme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Light">Light</SelectItem>
                        <SelectItem value="Dark">Dark</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Font Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Font Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Font Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value) => handleSettingChange('fontSize', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                        <SelectItem value="Extra Large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Language */}
              <Card>
                <CardHeader>
                  <CardTitle>Language</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>App Language</Label>
                    <Select value={settings.appLanguage} onValueChange={(value) => handleSettingChange('appLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                        <SelectItem value="Zulu">Zulu</SelectItem>
                        <SelectItem value="Xhosa">Xhosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
           </TabsContent>

           {/* User Management Tab */}
           {canManageUsers && (
             <TabsContent value="users" className="space-y-6">
               <div className="grid gap-6">
                 {/* User List */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center justify-between">
                       <span>User Management</span>
                       <div className="flex items-center gap-2">
                         <Button size="sm" variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
                           <Mail className="h-4 w-4 mr-2" />
                           Invite User
                         </Button>
                         <Button size="sm" onClick={handleAddUser}>
                           <UserPlus className="h-4 w-4 mr-2" />
                           Add User
                         </Button>
                       </div>
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     {loading ? (
                       <div className="text-center py-4">Loading users...</div>
                     ) : error ? (
                       <div className="text-center py-4 text-red-500">Error loading users: {error}</div>
                     ) : (
                       <div className="space-y-4">
                         {allUsers.map((user) => (
                           <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                             <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2">
                                 {user.isActive ? (
                                   <CheckCircle className="h-5 w-5 text-green-500" />
                                 ) : (
                                   <XCircle className="h-5 w-5 text-red-500" />
                                 )}
                                 <div>
                                   <p className="font-medium">{user.firstName} {user.lastName}</p>
                                   <p className="text-sm text-gray-500">{user.email}</p>
                                   {user.username && (
                                     <p className="text-xs text-gray-400">@{user.username}</p>
                                   )}
                                 </div>
                               </div>
                               <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                 {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                               </Badge>
                               <span className="text-sm text-gray-500">
                                 Last login: {user.lastLogin || 'Never'}
                               </span>
                             </div>
                             <div className="flex items-center gap-2">
                               <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                 <Edit className="h-4 w-4" />
                               </Button>
                               <Button size="sm" variant="outline" onClick={() => handleResetPassword(user.id)}>
                                 <Key className="h-4 w-4" />
                               </Button>
                               <Button size="sm" variant="outline" onClick={() => handleChangePermissions(user)}>
                                 <Shield className="h-4 w-4" />
                               </Button>
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <Button size="sm" variant="outline">
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Remove User</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       Are you sure you want to remove {user.firstName} {user.lastName}? This action cannot be undone.
                                     </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                                     <AlertDialogAction onClick={() => handleRemoveUser(user.id)}>
                                       Remove
                                     </AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </div>

               {/* Add/Edit User Dialog */}
               <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                     <DialogDescription>
                       {selectedUser ? 'Update user information and settings.' : 'Create a new user account.'}
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-4">
                     <div>
                       <Label htmlFor="userEmail">Email</Label>
                       <Input
                         id="userEmail"
                         type="email"
                         value={newUser.email}
                         onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                         placeholder="user@clinic.com"
                       />
                     </div>
                     <div>
                       <Label htmlFor="userDisplayName">Display Name</Label>
                       <Input
                         id="userDisplayName"
                         value={newUser.displayName}
                         onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                         placeholder="Dr. John Smith"
                       />
                     </div>
                     <div>
                       <Label htmlFor="userRole">Role</Label>
                       <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="clinician">Clinician</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                       </Select>
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <Label htmlFor="accountStatus">Account Status</Label>
                         <p className="text-sm text-gray-500">Active accounts can log in</p>
                       </div>
                       <Switch
                         id="accountStatus"
                         checked={newUser.accountStatus}
                         onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, accountStatus: checked }))}
                       />
                     </div>
                   </div>
                   <DialogFooter>
                     <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                     <Button onClick={handleSaveUser}>{selectedUser ? 'Update' : 'Create'} User</Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>

               {/* Invite User Dialog */}
               <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Invite User</DialogTitle>
                     <DialogDescription>
                       Send an invitation email to a new user.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-4">
                     <div>
                       <Label htmlFor="inviteEmail">Email Address</Label>
                       <Input
                         id="inviteEmail"
                         type="email"
                         value={inviteEmail}
                         onChange={(e) => setInviteEmail(e.target.value)}
                         placeholder="user@clinic.com"
                       />
                     </div>
                   </div>
                   <DialogFooter>
                     <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
                     <Button onClick={handleInviteUser}>Send Invitation</Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>

               {/* User Permissions Dialog */}
               <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                 <DialogContent className="max-w-2xl">
                   <DialogHeader>
                     <DialogTitle>User Permissions</DialogTitle>
                     <DialogDescription>
                       Configure granular permissions for {selectedUser?.displayName}.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="space-y-6">
                     <div>
                       <h4 className="font-medium mb-3">Patient Management</h4>
                       <div className="space-y-2">
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="viewPatients" 
                             checked={userPermissions.viewPatients}
                             onCheckedChange={(checked) => handlePermissionChange('viewPatients', checked as boolean)}
                           />
                           <Label htmlFor="viewPatients">View Patients</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="editPatients" 
                             checked={userPermissions.editPatients}
                             onCheckedChange={(checked) => handlePermissionChange('editPatients', checked as boolean)}
                           />
                           <Label htmlFor="editPatients">Edit Patients</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="deletePatients" 
                             checked={userPermissions.deletePatients}
                             onCheckedChange={(checked) => handlePermissionChange('deletePatients', checked as boolean)}
                           />
                           <Label htmlFor="deletePatients">Delete Patients</Label>
                         </div>
                       </div>
                     </div>
                     <div>
                       <h4 className="font-medium mb-3">Appointment Management</h4>
                       <div className="space-y-2">
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="viewAppointments" 
                             checked={userPermissions.viewAppointments}
                             onCheckedChange={(checked) => handlePermissionChange('viewAppointments', checked as boolean)}
                           />
                           <Label htmlFor="viewAppointments">View Appointments</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="editAppointments" 
                             checked={userPermissions.editAppointments}
                             onCheckedChange={(checked) => handlePermissionChange('editAppointments', checked as boolean)}
                           />
                           <Label htmlFor="editAppointments">Edit Appointments</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="deleteAppointments" 
                             checked={userPermissions.deleteAppointments}
                             onCheckedChange={(checked) => handlePermissionChange('deleteAppointments', checked as boolean)}
                           />
                           <Label htmlFor="deleteAppointments">Delete Appointments</Label>
                         </div>
                       </div>
                     </div>
                     <div>
                       <h4 className="font-medium mb-3">Reports & Documentation</h4>
                       <div className="space-y-2">
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="viewReports" 
                             checked={userPermissions.viewReports}
                             onCheckedChange={(checked) => handlePermissionChange('viewReports', checked as boolean)}
                           />
                           <Label htmlFor="viewReports">View Reports</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="editReports" 
                             checked={userPermissions.editReports}
                             onCheckedChange={(checked) => handlePermissionChange('editReports', checked as boolean)}
                           />
                           <Label htmlFor="editReports">Edit Reports</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="deleteReports" 
                             checked={userPermissions.deleteReports}
                             onCheckedChange={(checked) => handlePermissionChange('deleteReports', checked as boolean)}
                           />
                           <Label htmlFor="deleteReports">Delete Reports</Label>
                         </div>
                       </div>
                     </div>
                     <div>
                       <h4 className="font-medium mb-3">System Administration</h4>
                       <div className="space-y-2">
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="viewSettings" 
                             checked={userPermissions.viewSettings}
                             onCheckedChange={(checked) => handlePermissionChange('viewSettings', checked as boolean)}
                           />
                           <Label htmlFor="viewSettings">View Settings</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="editSettings" 
                             checked={userPermissions.editSettings}
                             onCheckedChange={(checked) => handlePermissionChange('editSettings', checked as boolean)}
                           />
                           <Label htmlFor="editSettings">Edit Settings</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="manageUsers" 
                             checked={userPermissions.manageUsers}
                             onCheckedChange={(checked) => handlePermissionChange('manageUsers', checked as boolean)}
                           />
                           <Label htmlFor="manageUsers">Manage Users</Label>
                         </div>
                       </div>
                     </div>
                   </div>
                   <DialogFooter>
                     <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>Cancel</Button>
                     <Button onClick={handleSavePermissions}>Save Permissions</Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
             </TabsContent>
           )}
         </Tabs>
       </div>
     </MainLayout>
   );
 };
 
 export default AdminSettings;
