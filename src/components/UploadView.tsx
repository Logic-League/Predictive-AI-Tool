import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, Brain, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MachineData } from '../App';
import { DataFormatExample } from './DataFormatExample';

interface UploadViewProps {
  onDataProcessed: (data: MachineData[]) => void;
  existingDataCount: number;
}

export function UploadView({ onDataProcessed, existingDataCount }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Mock AI processing function
  const processWithAI = useCallback((data: any[]): MachineData[] => {
    return data.map((row, index) => {
      // Mock AI risk assessment based on temperature and vibration thresholds
      const tempRisk = row.temp > 80 ? 2 : row.temp > 65 ? 1 : 0;
      const vibrationRisk = row.vibration > 8 ? 2 : row.vibration > 5 ? 1 : 0;
      const runtimeRisk = row.runtime > 20000 ? 1 : 0;
      
      const totalRisk = tempRisk + vibrationRisk + runtimeRisk;
      
      let risk_level: 'Healthy' | 'At Risk' | 'Critical';
      let risk_score: number;
      
      if (totalRisk >= 4) {
        risk_level = 'Critical';
        risk_score = 0.8 + Math.random() * 0.2;
      } else if (totalRisk >= 2) {
        risk_level = 'At Risk';
        risk_score = 0.4 + Math.random() * 0.4;
      } else {
        risk_level = 'Healthy';
        risk_score = Math.random() * 0.3;
      }

      return {
        machine_id: row.machine_id,
        temp: parseFloat(row.temp),
        vibration: parseFloat(row.vibration),
        runtime: parseFloat(row.runtime),
        risk_level,
        risk_score,
        prediction_confidence: 0.85 + Math.random() * 0.15
      };
    });
  }, []);

  const parseData = useCallback((text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 1) {
      throw new Error('File must contain at least one data row');
    }

    // Check if it's CSV format (has commas and headers)
    const firstLine = lines[0];
    const isCSV = firstLine.toLowerCase().includes('machine_id') && firstLine.includes(',');
    
    if (isCSV) {
      return parseCSVFormat(lines);
    } else {
      return parseTextFormat(lines);
    }
  }, []);

  const parseCSVFormat = useCallback((lines: string[]) => {
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['machine_id', 'temp', 'vibration', 'runtime'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate numeric fields
      const numericFields = ['temp', 'vibration', 'runtime'];
      for (const field of numericFields) {
        if (isNaN(parseFloat(row[field]))) {
          throw new Error(`Invalid ${field} value in row ${i + 1}: ${row[field]}`);
        }
      }

      data.push(row);
    }

    return data;
  }, []);

  const parseTextFormat = useCallback((lines: string[]) => {
    const data = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse formats like: "MACH009 78 6.4 18030" or "MACH009,78,6.4,18030"
      const parts = line.split(/[\s,]+/).filter(part => part.trim());
      
      if (parts.length < 4) {
        throw new Error(`Row ${i + 1} has insufficient data. Expected: machine_id, temp, vibration, runtime`);
      }

      const machineId = parts[0];
      const temp = parseFloat(parts[1]);
      const vibration = parseFloat(parts[2]);
      const runtime = parseFloat(parts[3]);

      // Validate numeric values
      if (isNaN(temp)) {
        throw new Error(`Invalid temperature value in row ${i + 1}: ${parts[1]}`);
      }
      if (isNaN(vibration)) {
        throw new Error(`Invalid vibration value in row ${i + 1}: ${parts[2]}`);
      }
      if (isNaN(runtime)) {
        throw new Error(`Invalid runtime value in row ${i + 1}: ${parts[3]}`);
      }

      data.push({
        machine_id: machineId,
        temp,
        vibration,
        runtime
      });
    }

    if (data.length === 0) {
      throw new Error('No valid data rows found in file');
    }

    return data;
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setFileName(file.name);

    try {
      // Step 1: Read file
      setProcessingStep('Reading file...');
      setProgress(20);
      
      const text = await file.text();
      
      // Step 2: Parse CSV
      setProcessingStep('Parsing CSV data...');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      
      const rawData = parseData(text);
      
      // Step 3: Validate data
      setProcessingStep('Validating data quality...');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (rawData.length === 0) {
        throw new Error('No data rows found in CSV file');
      }
      
      if (rawData.length > 10000) {
        throw new Error('CSV file too large. Maximum 10,000 rows allowed.');
      }

      // Step 4: AI Processing
      setProcessingStep('Running AI risk analysis...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing
      
      const processedData = processWithAI(rawData);
      
      // Step 5: Complete
      setProcessingStep('Analysis complete!');
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onDataProcessed(processedData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProgress(0);
    }
  }, [parseData, processWithAI, onDataProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const dataFile = files.find(file => 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.txt') || 
      file.type === 'text/plain' ||
      file.type === 'text/csv'
    );
    
    if (!dataFile) {
      setError('Please upload a CSV or text file');
      return;
    }
    
    handleFileUpload(dataFile);
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Sample data for background visualization
  const sampleAnalyticsData = [
    { name: 'Week 1', healthy: 85, atRisk: 12, critical: 3 },
    { name: 'Week 2', healthy: 82, atRisk: 15, critical: 3 },
    { name: 'Week 3', healthy: 78, atRisk: 18, critical: 4 },
    { name: 'Week 4', healthy: 75, atRisk: 20, critical: 5 }
  ];

  const backgroundTrendData = Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10
  }));

  return (
    <div className="relative space-y-6">
      {/* Background Analytics */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleAnalyticsData}>
              <Area type="monotone" dataKey="healthy" fill="#10b981" />
              <Area type="monotone" dataKey="atRisk" fill="#f59e0b" />
              <Area type="monotone" dataKey="critical" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="absolute top-1/3 right-10 w-80 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={backgroundTrendData}>
              <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute bottom-20 left-1/4 w-64 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={backgroundTrendData}>
              <Area type="monotone" dataKey="y" fill="#8b5cf6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Floating Analytics Icons */}
        <div className="absolute top-1/4 left-1/3 opacity-20">
          <TrendingUp className="w-16 h-16 text-blue-500" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 opacity-20">
          <BarChart3 className="w-20 h-20 text-purple-500" />
        </div>
        <div className="absolute top-2/3 left-1/5 opacity-20">
          <Brain className="w-12 h-12 text-green-500" />
        </div>
      </div>
      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Machine Health Analysis
          </CardTitle>
          <CardDescription>
            Upload your machine sensor data to get instant AI-powered risk assessments and predictive insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <div>
              <p className="font-medium">Supported file formats:</p>
              <ul className="space-y-1 text-muted-foreground ml-4 mt-2">
                <li>• <strong>CSV format:</strong> Headers with comma-separated values</li>
                <li>• <strong>Text format:</strong> Space or comma-separated data rows</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium">Required data fields:</p>
              <ul className="space-y-1 text-muted-foreground ml-4 mt-2">
                <li>• <code>machine_id</code> - Unique identifier for each machine</li>
                <li>• <code>temp</code> - Temperature reading (°C)</li>
                <li>• <code>vibration</code> - Vibration level (mm/s)</li>
                <li>• <code>runtime</code> - Total runtime hours</li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Maximum file size: 50MB. Up to 10,000 machine records supported. Accepts .csv and .txt files.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            {isProcessing ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Brain className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-center">Analyzing your data...</h3>
                  <p className="font-medium text-center text-primary">{processingStep}</p>
                  
                  <div className="max-w-sm mx-auto space-y-2">
                    <Progress value={progress} className="w-full h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="font-medium">{progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Processing <span className="font-medium text-foreground">{fileName}</span>
                  </p>
                  
                  {progress > 60 && (
                    <div className="text-xs text-muted-foreground text-center mt-4 animate-fade-in">
                      <p>🔍 Running machine health analysis...</p>
                      <p className="mt-1">🧠 AI is evaluating risk patterns...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isDragging 
                    ? 'bg-primary/20 scale-110' 
                    : 'bg-primary/10 hover:bg-primary/15'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors ${
                    isDragging ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">
                    {isDragging ? 'Drop your data file here' : 'Drag & drop your data file here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV and text formats • or click to browse files
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Choose Data File
                      <input
                        type="file"
                        accept=".csv,.txt,text/plain,text/csv"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {existingDataCount > 0 && !isProcessing && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully processed {existingDataCount} machines. View results in the Dashboard tab.
          </AlertDescription>
        </Alert>
      )}

      {/* Sample Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data Formats</CardTitle>
          <CardDescription>
            Examples of supported data formats you can upload:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CSV Format */}
            <div>
              <p className="font-medium text-sm mb-2">CSV Format:</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="space-y-1">
                  <div className="text-blue-600">machine_id,temp,vibration,runtime</div>
                  <div>MACH001,72.5,4.2,15680</div>
                  <div>MACH002,85.1,7.8,22340</div>
                  <div>MACH003,68.3,3.1,8920</div>
                </div>
              </div>
            </div>

            {/* Text Format */}
            <div>
              <p className="font-medium text-sm mb-2">Text Format:</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="space-y-1">
                  <div>MACH001 72.5 4.2 15680</div>
                  <div>MACH002 85.1 7.8 22340</div>
                  <div>MACH003 68.3 3.1 8920</div>
                  <div>MACH004 91.2 9.5 25100</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                const sampleData = [
                  'machine_id,temp,vibration,runtime',
                  'MACH001,72.5,4.2,15680',
                  'MACH002,85.1,7.8,22340',
                  'MACH003,68.3,3.1,8920',
                  'MACH004,91.2,9.5,25100',
                  'MACH005,65.8,2.8,12400',
                  'MACH006,78.4,6.1,18750',
                  'MACH007,82.7,8.9,21900',
                  'MACH008,59.2,1.9,9800',
                  'MACH009,88.6,7.3,19200',
                  'MACH010,74.1,5.4,16800'
                ].join('\n');

                const blob = new Blob([sampleData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_machine_data.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Sample CSV
            </Button>

            <Button 
              variant="outline" 
              onClick={() => {
                const sampleData = [
                  'MACH001 72.5 4.2 15680',
                  'MACH002 85.1 7.8 22340',
                  'MACH003 68.3 3.1 8920',
                  'MACH004 91.2 9.5 25100',
                  'MACH005 65.8 2.8 12400',
                  'MACH006 78.4 6.1 18750',
                  'MACH007 82.7 8.9 21900',
                  'MACH008 59.2 1.9 9800',
                  'MACH009 88.6 7.3 19200',
                  'MACH010 74.1 5.4 16800'
                ].join('\n');

                const blob = new Blob([sampleData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sample_machine_data.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Sample TXT
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Format Examples */}
      <DataFormatExample />
    </div>
  );
}
