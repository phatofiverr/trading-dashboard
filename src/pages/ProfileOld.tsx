
import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, AtSign, MapPin, Calendar, Save, Users } from "lucide-react";
import { useAccountStore } from "@/hooks/useAccountStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTradeStore } from "@/hooks/useTradeStore";
import { Link } from "react-router-dom";
import FindFriends from "@/components/profile/FindFriends";

const Profile: React.FC = () => {
  const { currentUser, updateProfile } = useAccountStore();
  const { fetchAllStrategyPerformance } = useTradeStore();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    location: "",
    bio: ""
  });

  // User data will be loaded automatically via AppSidebar

  // Sync form with user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName,
        email: currentUser.email,
        location: currentUser.location,
        bio: currentUser.bio
      });
    }
  }, [currentUser]);

  // Load strategies
  useEffect(() => {
    const loadStrategies = () => {
      const data = fetchAllStrategyPerformance();
      setStrategies(data);
    };
    
    loadStrategies();
    const intervalId = setInterval(loadStrategies, 1000);
    return () => clearInterval(intervalId);
  }, [fetchAllStrategyPerformance]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success("Profile updated successfully");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
              <h1 className="text-2xl font-medium">Your Profile</h1>
              
              <Tabs defaultValue="personal">
                <TabsList className="mb-4 bg-black/20 border border-white/5">
                  <TabsTrigger value="personal" className="data-[state=active]:bg-white/10">
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="strategies" className="data-[state=active]:bg-white/10">
                    My Strategies
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="data-[state=active]:bg-white/10">
                    Find Friends
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="col-span-1 glass-effect border-white/5">
                      <CardHeader>
                        <CardTitle>Profile Photo</CardTitle>
                        <CardDescription>How other traders will see you</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center gap-4">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={currentUser?.avatarUrl || ""} alt="Profile picture" />
                          <AvatarFallback className="bg-black/30 text-white text-xl">
                            {currentUser?.displayName.split(' ').map(n => n[0]).join('') || 'JD'}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" className="mt-2 bg-black/20 border-white/10">Change Photo</Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="lg:col-span-2 glass-effect border-white/5">
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your profile details</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="displayName" className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Name
                              </Label>
                              <Input 
                                id="displayName" 
                                value={formData.displayName}
                                onChange={handleInputChange}
                                className="bg-black/20 border-white/10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="flex items-center gap-2">
                                <AtSign className="h-4 w-4" /> Email
                              </Label>
                              <Input 
                                id="email" 
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-black/20 border-white/10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Location
                              </Label>
                              <Input 
                                id="location" 
                                value={formData.location}
                                onChange={handleInputChange}
                                className="bg-black/20 border-white/10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="memberSince" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Member Since
                              </Label>
                              <Input 
                                id="memberSince" 
                                value={currentUser?.memberSince ? new Date(currentUser.memberSince).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long'
                                }) : 'January 2023'}
                                disabled 
                                className="bg-black/20 border-white/10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Biography</Label>
                            <Textarea 
                              id="bio" 
                              value={formData.bio}
                              onChange={handleInputChange}
                              className="resize-none h-32 bg-black/20 border-white/10"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" variant="glass" className="flex items-center gap-2">
                              <Save className="h-4 w-4" /> Save Changes
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="strategies">
                  <Card className="glass-effect border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>My Strategies</span>
                        <Button variant="glass" asChild>
                          <Link to="/strategies">View All</Link>
                        </Button>
                      </CardTitle>
                      <CardDescription>Manage your trading strategies</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {strategies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {strategies.map(strategy => (
                            <div key={strategy.name} className="p-4 border border-white/10 rounded-md bg-black/20">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{strategy.name}</h3>
                                <span className={strategy.profit >= 0 ? "text-positive" : "text-negative"}>
                                  {strategy.profit >= 0 ? "+" : ""}{strategy.profit.toFixed(2)}R
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Win rate: {strategy.winRate.toFixed(2)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {strategy.tradesCount} trades
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button variant="minimal" size="sm" asChild className="flex-1">
                                  <Link to={`/strategies/${encodeURIComponent(strategy.name)}`}>
                                    View
                                  </Link>
                                </Button>
                                <Button variant="minimal" size="sm" className="flex-1"
                                  onClick={() => {
                                    toast.success(`Strategy ${strategy.name} visibility settings updated`);
                                  }}
                                >
                                  <Users className="h-3 w-3 mr-1" />
                                  Friends Only
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            You haven't created any strategies yet.
                          </p>
                          <Button variant="glass" className="mt-4" asChild>
                            <Link to="/strategies">Create a Strategy</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="friends">
                  <FindFriends />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
