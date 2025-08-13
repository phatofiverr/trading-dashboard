import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Scale, AlertTriangle, Shield, Users, FileText, Calendar, Mail, CheckCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-trading-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
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
              <FileText className="h-5 w-5" />
              <span>Agreement to Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              These Terms of Service ("Terms") govern your use of our Trading Dashboard application and services. 
              By accessing or using our service, you agree to be bound by these Terms.
            </p>
            <p className="text-muted-foreground">
              If you disagree with any part of these terms, then you may not access our service.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Service Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our Trading Dashboard is a web-based application that provides:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Trade Management</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Trade entry and exit tracking</li>
                  <li>• Performance analytics and metrics</li>
                  <li>• Risk management tools</li>
                  <li>• Strategy development and testing</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Account Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multiple trading account support</li>
                  <li>• Data import and export</li>
                  <li>• Visual charts and reports</li>
                  <li>• Cloud synchronization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Accounts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Account Creation</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You must provide accurate and complete information</li>
                  <li>• You are responsible for maintaining account security</li>
                  <li>• You must be at least 18 years old to use our service</li>
                  <li>• One account per person is allowed</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Account Responsibilities</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Keep your login credentials secure</li>
                  <li>• Notify us immediately of any unauthorized access</li>
                  <li>• You are responsible for all activities under your account</li>
                  <li>• Do not share your account with others</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Account Termination</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You may delete your account at any time</li>
                  <li>• We may suspend or terminate accounts for violations</li>
                  <li>• Data deletion occurs within 30 days of account closure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Acceptable Use</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You agree to use our service only for lawful purposes and in accordance with these Terms.
            </p>
            
            <div>
              <h3 className="text-lg font-medium mb-3">You May:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use the service for personal trading analysis</li>
                <li>• Store and manage your trading data</li>
                <li>• Export your data for personal use</li>
                <li>• Use the service for educational purposes</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">You May Not:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use the service for illegal activities</li>
                <li>• Attempt to hack or compromise our systems</li>
                <li>• Share your account with unauthorized users</li>
                <li>• Upload malicious content or viruses</li>
                <li>• Use automated tools to access our service</li>
                <li>• Reverse engineer our application</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Data and Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our service.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Data Ownership</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You retain ownership of your trading data</li>
                <li>• We store your data securely in Firebase</li>
                <li>• You can export your data at any time</li>
                <li>• We do not sell or share your personal data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="glass-effect bg-red-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Important Disclaimers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Not Financial Advice</h3>
                <p className="text-muted-foreground">
                  Our service is for educational and analytical purposes only. We do not provide financial advice, 
                  and our tools should not be considered as investment recommendations.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Trading Risks</h3>
                <p className="text-muted-foreground">
                  Trading involves substantial risk of loss. Past performance does not guarantee future results. 
                  You are responsible for your own trading decisions and risk management.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive to maintain high availability but cannot guarantee uninterrupted service. 
                  We are not liable for any losses due to service interruptions.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Data Accuracy</h3>
                <p className="text-muted-foreground">
                  While we strive for accuracy, we cannot guarantee that all data is error-free. 
                  You should verify all information independently before making trading decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Our Rights</h3>
                <p className="text-muted-foreground">
                  The service and its original content, features, and functionality are owned by us and are protected by 
                  international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Your Rights</h3>
                <p className="text-muted-foreground">
                  You retain ownership of your trading data and any content you create using our service. 
                  You grant us a limited license to store and process your data to provide our services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from your use of our service.
            </p>
            <p className="text-muted-foreground">
              Our total liability to you for any claims arising from your use of our service shall not exceed 
              the amount you paid us in the 12 months preceding the claim.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You agree to defend, indemnify, and hold harmless our company and its officers, directors, employees, 
              and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt 
              arising from your use of our service or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may terminate or suspend your account and access to our service immediately, without prior notice, 
              for any reason, including breach of these Terms. Upon termination, your right to use the service will cease immediately.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="glass-effect bg-black/5 border-0">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days notice prior to any new terms taking effect.
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
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                <strong>Email:</strong> legal@tradingdashboard.com
              </p>
              <p className="text-muted-foreground">
                <strong>Response Time:</strong> We will respond to your inquiry within 48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
