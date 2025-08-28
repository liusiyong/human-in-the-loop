"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAMPLE_JSON_DATA } from "@/lib/constants";

export default function JsonViewerPage() {
  const [data, setData] = useState(SAMPLE_JSON_DATA);

  // Filter out arrays and objects to show only single fields
  const getSingleFields = (data: any) => {
    const fields: { [key: string]: any } = {};
    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value) && typeof value !== 'object') {
        fields[key] = value;
      }
    });
    return fields;
  };

  // Get arrays from the data for tabular display
  const getTabularData = (data: any) => {
    const arrays: { [key: string]: any[] } = {};
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        arrays[key] = value;
      }
    });
    return arrays;
  };

  const singleFields = getSingleFields(data);
  const tabularData = getTabularData(data);

  // Update single field value
  const updateSingleField = (key: string, value: string) => {
    setData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update array item
  const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [arrayName]: (prev as any)[arrayName].map((item: any, i: number) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new array item
  const addArrayItem = (arrayName: string) => {
    const existingArray = (data as any)[arrayName] as any[];
    if (existingArray && existingArray.length > 0) {
      // Create a new item based on the structure of the first item
      const template = existingArray[0];
      const newItem = typeof template === 'object' 
        ? Object.keys(template).reduce((acc, key) => {
            acc[key] = '';
            return acc;
          }, {} as any)
        : '';
      
      setData(prev => ({
        ...prev,
        [arrayName]: [...(prev as any)[arrayName], newItem]
      }));
    }
  };

  // Remove array item
  const removeArrayItem = (arrayName: string, index: number) => {
    setData(prev => ({
      ...prev,
      [arrayName]: (prev as any)[arrayName].filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Document</h1>
          <p className="text-gray-600">View and edit extracted data</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Document Pane (Left) */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.document_url ? (
                <div className="space-y-4">
                  <iframe
                    src={data.document_url}
                    className="w-full h-96 border rounded-lg"
                    title="Document Viewer"
                  />
                  <div className="text-sm text-gray-600">
                    <Label>Document URL:</Label>
                    <p className="break-all mt-1">{data.document_url}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">No document URL provided</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Pane (Right) */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                Form Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(singleFields).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    {key === 'description' ? (
                      <Textarea
                        id={key}
                        value={value?.toString() || ''}
                        onChange={(e) => updateSingleField(key, e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={key}
                        value={value?.toString() || ''}
                        onChange={(e) => updateSingleField(key, e.target.value)}
                        className="bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Pane (Bottom) */}
        {Object.keys(tabularData).length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                Tabular Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                <p className="text-gray-500">No tabular data found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                Tabular Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(tabularData)[0]} className="w-full">
                <div className="flex justify-end mb-4">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-fit">
                    {Object.keys(tabularData).map((tableName) => (
                      <TabsTrigger key={tableName} value={tableName} className="capitalize">
                        {tableName.replace(/_/g, ' ')}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {Object.entries(tabularData).map(([tableName, tableData]) => (
                  <TabsContent key={tableName} value={tableName} className="mt-4">
                    <div className="mb-4 flex justify-end">
                      <Button 
                        onClick={() => addArrayItem(tableName)}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Editable table for all arrays */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {tableData.length > 0 && typeof tableData[0] === 'object' ? (
                                Object.keys(tableData[0]).map((header) => (
                                  <TableHead key={header} className="whitespace-nowrap">
                                    {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </TableHead>
                                ))
                              ) : (
                                <TableHead>Value</TableHead>
                              )}
                              <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableData.map((row: any, index: number) => (
                              <TableRow key={index}>
                                {typeof row === 'object' ? (
                                  Object.entries(row).map(([field, cell]: [string, any], cellIndex: number) => (
                                    <TableCell key={cellIndex} className="max-w-xs">
                                      {field === 'link' || cell?.toString().startsWith('http') ? (
                                        <Input
                                          value={cell?.toString() || ''}
                                          onChange={(e) => updateArrayItem(tableName, index, field, e.target.value)}
                                          className="text-blue-600"
                                        />
                                      ) : field === 'price' || field === 'shipping' || field === 'updated_t' ? (
                                        <Input
                                          type="number"
                                          value={cell?.toString() || ''}
                                          onChange={(e) => updateArrayItem(tableName, index, field, field === 'updated_t' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
                                        />
                                      ) : (
                                        <Input
                                          value={cell?.toString() || ''}
                                          onChange={(e) => updateArrayItem(tableName, index, field, e.target.value)}
                                        />
                                      )}
                                    </TableCell>
                                  ))
                                ) : (
                                  <TableCell>
                                    <Input
                                      value={row?.toString() || ''}
                                      onChange={(e) => {
                                        const newArray = [...tableData];
                                        newArray[index] = e.target.value;
                                        setData(prev => ({ ...prev, [tableName]: newArray }));
                                      }}
                                    />
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Button
                                    onClick={() => removeArrayItem(tableName, index)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
