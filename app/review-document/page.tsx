"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const [leftPaneWidth, setLeftPaneWidth] = useState(50); // Percentage
  const [topPaneHeight, setTopPaneHeight] = useState(60); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const [isVerticalDragging, setIsVerticalDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const verticalContainerRef = useRef<HTMLDivElement>(null);

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

  // Resizable pane handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedPercentage = Math.min(80, Math.max(20, percentage));
    setLeftPaneWidth(constrainedPercentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Vertical resizable pane handlers
  const handleVerticalMouseDown = useCallback(() => {
    setIsVerticalDragging(true);
  }, []);

  const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
    if (!isVerticalDragging || !verticalContainerRef.current) return;
    
    const containerRect = verticalContainerRef.current.getBoundingClientRect();
    const percentage = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    // Constrain between 30% and 80%
    const constrainedPercentage = Math.min(80, Math.max(30, percentage));
    setTopPaneHeight(constrainedPercentage);
  }, [isVerticalDragging]);

  const handleVerticalMouseUp = useCallback(() => {
    setIsVerticalDragging(false);
  }, []);

  // Add global mouse events for vertical dragging
  useEffect(() => {
    if (isVerticalDragging) {
      document.addEventListener('mousemove', handleVerticalMouseMove);
      document.addEventListener('mouseup', handleVerticalMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      if (!isDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
      if (!isDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isVerticalDragging, handleVerticalMouseMove, handleVerticalMouseUp, isDragging]);

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

        {/* Main Content with Vertical Divider */}
        <div ref={verticalContainerRef} className="flex flex-col h-[800px]">
          {/* Top Section - Document and Form Panes */}
          <div style={{ height: `${topPaneHeight}%` }} className="mb-0">
            <div ref={containerRef} className="flex gap-0 h-full">
              {/* Document Pane (Left) */}
              <Card className="flex flex-col" style={{ width: `${leftPaneWidth}%` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
              {data.document_url ? (
                <div className="space-y-4 h-full">
                  <iframe
                    src={data.document_url}
                    className="w-full h-[90%] border rounded-lg"
                    title="Document Viewer"
                  />
                  <div className="text-sm text-gray-600">
                    <Label>Document URL:</Label>
                    <p className="break-all mt-1">{data.document_url}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                  <p className="text-gray-500">No document URL provided</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resizable Divider */}
          <div 
            className="w-2 cursor-col-resize relative group transition-colors mx-1"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-2 -right-2 group-hover:bg-gray-400 group-hover:bg-opacity-20 rounded"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-500 rounded group-hover:bg-gray-600"></div>
          </div>

          {/* Form Pane (Right) */}
          <Card className="flex flex-col" style={{ width: `${100 - leftPaneWidth}%` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                Form Fields
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto">
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
        </div>

        {/* Horizontal Divider */}
        <div 
          className={`h-2 w-full bg-gray-300 hover:bg-gray-400 cursor-row-resize relative group transition-colors my-1 ${
            isVerticalDragging ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleVerticalMouseDown}
        >
          <div className="absolute inset-x-0 -top-2 -bottom-2 group-hover:bg-gray-400 group-hover:bg-opacity-20 rounded"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-gray-500 rounded group-hover:bg-gray-600"></div>
        </div>

        {/* Bottom Section - Table Pane */}
        <div style={{ height: `${100 - topPaneHeight}%` }} className="flex flex-col">
          {/* Table Pane (Bottom) */}
          {Object.keys(tabularData).length === 0 ? (
            <Card className="flex-1">
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
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                Tabular Data
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
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
      </div>
    </div>
  );
}
