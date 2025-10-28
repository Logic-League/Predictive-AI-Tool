import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Filter, Download, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { MachineData } from '../App';

interface DashboardViewProps {
  machineData: MachineData[];
}

export function DashboardView({ machineData }: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = machineData.filter(machine => {
      const matchesSearch = machine.machine_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || machine.risk_level === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof MachineData];
      const bValue = b[sortBy as keyof MachineData];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortOrder === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [machineData, searchTerm, statusFilter, sortBy, sortOrder]);

  // Risk distribution data for charts
  const riskDistribution = useMemo(() => {
    const counts = { Healthy: 0, 'At Risk': 0, Critical: 0 };
    machineData.forEach(machine => {
      counts[machine.risk_level]++;
    });
    
    return [
      { name: 'Healthy', value: counts.Healthy, color: '#10b981' },
      { name: 'At Risk', value: counts['At Risk'], color: '#f59e0b' },
      { name: 'Critical', value: counts.Critical, color: '#ef4444' }
    ];
  }, [machineData]);

  // Risk score distribution for histogram
  const riskScoreDistribution = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${(i * 10)}-${((i + 1) * 10)}%`,
      count: 0
    }));

    machineData.forEach(machine => {
      const binIndex = Math.min(Math.floor(machine.risk_score * 10), 9);
      bins[binIndex].count++;
    });

    return bins;
  }, [machineData]);

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Healthy': return 'default';
      case 'At Risk': return 'secondary';
      case 'Critical': return 'destructive';
      default: return 'default';
    }
  };

  const exportData = () => {
    const csv = [
      'machine_id,temp,vibration,runtime,risk_level,risk_score,prediction_confidence',
      ...filteredData.map(machine => 
        `${machine.machine_id},${machine.temp},${machine.vibration},${machine.runtime},${machine.risk_level},${machine.risk_score.toFixed(3)},${machine.prediction_confidence.toFixed(3)}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'machine_risk_analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (machineData.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Upload a CSV file to view machine health analytics.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Subtle Background Analytics for Dashboard */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskScoreDistribution}>
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-40 left-20 w-96 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prototype Notice */}
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 relative z-10">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <strong>This is a prototype.</strong> AI predictions may not be 100% accurate. Your data stays private and is processed locally.
        </AlertDescription>
      </Alert>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Machines</p>
                <p className="text-2xl font-bold">{machineData.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {machineData.filter(m => m.risk_level === 'Critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {machineData.filter(m => m.risk_level === 'At Risk').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold">
                  {(machineData.reduce((acc, m) => acc + m.risk_score, 0) / machineData.length * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Distribution of machines by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {riskDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Score Distribution</CardTitle>
            <CardDescription>Histogram of risk scores across all machines</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Machine Health Data
          </CardTitle>
          <CardDescription>
            Detailed analysis of {filteredData.length} machines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by machine ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk_score">Risk Score</SelectItem>
                <SelectItem value="machine_id">Machine ID</SelectItem>
                <SelectItem value="temp">Temperature</SelectItem>
                <SelectItem value="vibration">Vibration</SelectItem>
                <SelectItem value="runtime">Runtime</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'machine_id') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('machine_id');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    Machine ID
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'temp') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('temp');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    Temperature (°C)
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'vibration') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('vibration');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    Vibration (mm/s)
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'runtime') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('runtime');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    Runtime (hrs)
                  </TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'risk_score') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('risk_score');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    Risk Score
                  </TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((machine) => (
                  <TableRow key={machine.machine_id}>
                    <TableCell className="font-mono">{machine.machine_id}</TableCell>
                    <TableCell>
                      <span className={machine.temp > 80 ? 'text-red-600 font-medium' : ''}>
                        {machine.temp.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={machine.vibration > 8 ? 'text-red-600 font-medium' : ''}>
                        {machine.vibration.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{machine.runtime.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(machine.risk_level)}>
                        {machine.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              machine.risk_score > 0.7 ? 'bg-red-500' :
                              machine.risk_score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${machine.risk_score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">
                          {(machine.risk_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {(machine.prediction_confidence * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
