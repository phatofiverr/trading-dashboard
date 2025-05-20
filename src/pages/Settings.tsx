import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Settings as SettingsIcon, Bell, Eye, Lock, Moon, Sun, Palette } from "lucide-react";
import { useLogoSettings } from "@/hooks/useLogoSettings";

const Settings: React.FC = () => {
  const { settings, updateSettings } = useLogoSettings();
  
  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  const colorOptions = [
    { value: 'text-white', label: 'White' },
    { value: 'text-pink-400', label: 'Pink' },
    { value: 'text-blue-400', label: 'Blue' },
    { value: 'text-green-400', label: 'Green' },
    { value: 'text-yellow-400', label: 'Yellow' },
    { value: 'text-purple-400', label: 'Purple' },
    { value: 'text-red-400', label: 'Red' },
    { value: 'text-orange-400', label: 'Orange' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <ScrollArea className="h-full">
              <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-medium">Settings</h1>
                
                <Card className="glass-effect border-white/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      <CardTitle>Logo Customization</CardTitle>
                    </div>
                    <CardDescription>Customize your application logo text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="primaryText">Primary Text</Label>
                        <Input 
                          id="primaryText" 
                          value={settings.primaryText} 
                          onChange={(e) => updateSettings({ primaryText: e.target.value })}
                          className="bg-black/20 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Select 
                          value={settings.primaryColor}
                          onValueChange={(value) => updateSettings({ primaryColor: value })}
                        >
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 border-white/10 backdrop-blur-md">
                            {colorOptions.map(color => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${color.value.replace('text-', 'bg-')}`}></div>
                                  <span>{color.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="secondaryText">Secondary Text</Label>
                        <Input 
                          id="secondaryText" 
                          value={settings.secondaryText} 
                          onChange={(e) => updateSettings({ secondaryText: e.target.value })}
                          className="bg-black/20 border-white/10" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <Select 
                          value={settings.secondaryColor}
                          onValueChange={(value) => updateSettings({ secondaryColor: value })}
                        >
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 border-white/10 backdrop-blur-md">
                            {colorOptions.map(color => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${color.value.replace('text-', 'bg-')}`}></div>
                                  <span>{color.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* General Settings Card */}
                <Card className="glass-effect border-white/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      <CardTitle>General Settings</CardTitle>
                    </div>
                    <CardDescription>Configure your trading application preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Theme</Label>
                          <p className="text-sm text-white/70">Choose your preferred appearance</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4 text-white/70" />
                          <Switch defaultChecked />
                          <Sun className="h-4 w-4 text-white/70" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Notifications</Label>
                          <p className="text-sm text-white/70">Receive updates and alerts</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-white/70" />
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Settings Card */}
                <Card className="glass-effect border-white/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      <CardTitle>Display Settings</CardTitle>
                    </div>
                    <CardDescription>Customize how you view your trading data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="defaultCurrency">Default Currency</Label>
                        <Select defaultValue="USD">
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 border-white/10 backdrop-blur-md">
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defaultTimeframe">Default Timeframe</Label>
                        <Select defaultValue="D1">
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 border-white/10 backdrop-blur-md">
                            <SelectItem value="M5">M5</SelectItem>
                            <SelectItem value="M15">M15</SelectItem>
                            <SelectItem value="H1">H1</SelectItem>
                            <SelectItem value="H4">H4</SelectItem>
                            <SelectItem value="D1">D1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="glass-effect border-white/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      <CardTitle>Security</CardTitle>
                    </div>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-white/70">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button variant="outline" className="mr-2">Cancel</Button>
                      <Button onClick={handleSaveSettings} variant="glass">Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
