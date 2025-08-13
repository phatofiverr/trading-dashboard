import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Database, Lock, Mail, Calendar, Users, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-trading-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <Badge variant="outline">Trading Dashboard</Badge>
          </div>
        </div>

        {/* Introduction */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Introduction</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This Privacy Policy describes how we collect, use, and protect your information when you use our Trading Dashboard application. 
              We are committed to protecting your privacy and ensuring the security of your trading data.
            </p>
            <p className="text-muted-foreground">
              By using our Trading Dashboard, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Information We Collect</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Account Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Email address (for account creation and authentication)</li>
                <li>• Display name (for personalization)</li>
                <li>• Profile information (optional)</li>
                <li>• Account creation and last login timestamps</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">Trading Data</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Trade entries and exits (prices, times, instruments)</li>
                <li>• Trading account information and balances</li>
                <li>• Trading strategies and performance metrics</li>
                <li>• Risk management parameters (stop losses, take profits)</li>
                <li>• Trade analysis and behavioral tags</li>
                <li>• Screenshots and notes (if provided)</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">Google OAuth Data</h3>
              <p className="text-muted-foreground mb-2">
                When you sign in with Google, we access:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Your email address (for account authentication)</li>
                <li>• Your display name (for personalization)</li>
                <li>• Your profile picture (optional, for user avatars)</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">Technical Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Browser type and version</li>
                <li>• Operating system</li>
                <li>• IP address (for security and analytics)</li>
                <li>• Usage patterns and preferences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>How We Use Your Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Account Management</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create and maintain your account</li>
                  <li>• Authenticate your identity</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Trading Dashboard</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Track and analyze your trades</li>
                  <li>• Calculate performance metrics</li>
                  <li>• Generate reports and visualizations</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Service Improvement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Improve our application features</li>
                  <li>• Fix bugs and technical issues</li>
                  <li>• Enhance user experience</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Communication</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Send important account notifications</li>
                  <li>• Provide updates about our service</li>
                  <li>• Respond to your inquiries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Data Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your data:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Encryption</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All data encrypted in transit (HTTPS)</li>
                  <li>• Data encrypted at rest in Firebase</li>
                  <li>• Secure authentication via Firebase Auth</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Access Control</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User-specific data isolation</li>
                  <li>• Firebase security rules enforcement</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Data Sharing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Service Providers:</strong> Firebase (Google) for hosting and authentication</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li>• <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li>• <strong>With Your Consent:</strong> When you explicitly authorize us to do so</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Access & Control</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access your personal data</li>
                  <li>• Update your account information</li>
                  <li>• Delete your account and data</li>
                  <li>• Export your trading data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Privacy Controls</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Opt out of non-essential communications</li>
                  <li>• Control data sharing preferences</li>
                  <li>• Request data deletion</li>
                  <li>• Withdraw consent at any time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active or as needed to provide our services. 
              When you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Contact Us</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <strong>Email:</strong> privacy@tradingdashboard.com
              </p>
              <p className="text-muted-foreground">
                <strong>Response Time:</strong> We will respond to your inquiry within 48 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="glass-effect bg-red-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
