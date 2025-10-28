import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Database } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function DataFormatExample() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Data Format Examples
        </CardTitle>
        <CardDescription>
          Real-world machine data formats that our AI can analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Industrial Context Image */}
        <div className="relative rounded-lg overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1649881927251-46644283751a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWFjaGluZSUyMGRhdGElMjBhbmFseXRpY3MlMjBkYXNoYm9hcmQlMjBzY3JlZW58ZW58MXx8fHwxNzU2OTY2MDczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Industrial machine analytics dashboard"
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="text-white p-4">
              <p className="font-semibold">Industrial IoT Data</p>
              <p className="text-sm opacity-90">Temperature, vibration, and runtime sensors</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Text Format Example */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <FileText className="w-3 h-3 mr-1" />
                Text Format
              </Badge>
              <span className="text-sm text-muted-foreground">Space-separated values</span>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border font-mono text-sm">
              <div className="space-y-1 text-gray-800 dark:text-gray-200">
                <div className="text-blue-600 dark:text-blue-400 font-semibold">// Machine sensor readings</div>
                <div>MACH001 72.5 4.2 15680</div>
                <div>MACH002 85.1 7.8 22340</div>
                <div>MACH003 68.3 3.1 8920</div>
                <div>MACH004 91.2 9.5 25100</div>
                <div>MACH005 65.8 2.8 12400</div>
                <div className="text-gray-400">...</div>
              </div>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                Format: MACHINE_ID TEMP VIBRATION RUNTIME
              </div>
            </div>
          </div>

          {/* CSV Format Example */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Database className="w-3 h-3 mr-1" />
                CSV Format
              </Badge>
              <span className="text-sm text-muted-foreground">Comma-separated with headers</span>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border font-mono text-sm">
              <div className="space-y-1 text-gray-800 dark:text-gray-200">
                <div className="text-blue-600 dark:text-blue-400 font-semibold">machine_id,temp,vibration,runtime</div>
                <div>MACH001,72.5,4.2,15680</div>
                <div>MACH002,85.1,7.8,22340</div>
                <div>MACH003,68.3,3.1,8920</div>
                <div>MACH004,91.2,9.5,25100</div>
                <div>MACH005,65.8,2.8,12400</div>
                <div className="text-gray-400">...</div>
              </div>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                Standard CSV with headers in first row
              </div>
            </div>
          </div>
        </div>

        {/* Data Insights */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <p className="font-semibold text-purple-800 dark:text-purple-200">AI Analysis Ready</p>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Our AI will automatically detect risk patterns in temperature spikes (&gt;80°C), 
            high vibration levels (&gt;8mm/s), and extended runtime (&gt;20,000hrs) to classify machine health.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
