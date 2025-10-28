import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { UploadView } from './components/UploadView';
import { DashboardView } from './components/DashboardView';
import { Upload, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { Card } from './components/ui/card';

export interface MachineData {
  machine_id: string;
  temp: number;
  vibration: number;
  runtime: number;
  risk_level: 'Healthy' | 'At Risk' | 'Critical';
  risk_score: number;
  prediction_confidence: number;
}

export default function App() {
  const [machineData, setMachineData] = useState<MachineData[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  const handleDataProcessed = (data: MachineData[]) => {
    setMachineData(data);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AI Predictive Maintenance</h1>
              <p className="text-sm text-muted-foreground">Intelligent machine health monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {machineData.length > 0 && (
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Healthy: {machineData.filter(m => m.risk_level === 'Healthy').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>At Risk: {machineData.filter(m => m.risk_level === 'At Risk').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical: {machineData.filter(m => m.risk_level === 'Critical').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {machineData.length === 0 && activeTab === 'upload' ? (
          // Welcome State
          <div className="text-center space-y-6 py-12">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold">Welcome to AI Predictive Maintenance</h2>
              <p className="text-lg text-muted-foreground">
                Upload your machine sensor data and get instant AI-powered risk assessments to prevent equipment failures and optimize maintenance schedules.
              </p>
            </div>
            
            <UploadView 
              onDataProcessed={handleDataProcessed}
              existingDataCount={machineData.length}
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Data Upload
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <UploadView 
                onDataProcessed={handleDataProcessed}
                existingDataCount={machineData.length}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardView machineData={machineData} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Ethical Notice */}
      <div className="border-t border-border bg-muted/50 mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
            <div>
              <p className="font-medium text-foreground mb-1">Ethical AI Notice</p>
              <p>This tool uses AI predictions that may contain bias. Always verify critical decisions with human expertise. Data is processed locally for privacy. Consider environmental impact and accessibility in deployment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
