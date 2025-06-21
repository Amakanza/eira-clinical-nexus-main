
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BodyChartProps {
  markedAreas: string[];
  onAreasChange: (areas: string[]) => void;
  readonly?: boolean;
}

const bodyAreas = [
  { id: 'head', label: 'Head', x: 50, y: 8 },
  { id: 'neck', label: 'Neck', x: 50, y: 15 },
  { id: 'left-shoulder', label: 'L Shoulder', x: 35, y: 22 },
  { id: 'right-shoulder', label: 'R Shoulder', x: 65, y: 22 },
  { id: 'chest', label: 'Chest', x: 50, y: 30 },
  { id: 'left-arm', label: 'L Arm', x: 25, y: 35 },
  { id: 'right-arm', label: 'R Arm', x: 75, y: 35 },
  { id: 'abdomen', label: 'Abdomen', x: 50, y: 45 },
  { id: 'lower-back', label: 'Lower Back', x: 50, y: 52 },
  { id: 'left-hip', label: 'L Hip', x: 42, y: 58 },
  { id: 'right-hip', label: 'R Hip', x: 58, y: 58 },
  { id: 'left-thigh', label: 'L Thigh', x: 42, y: 68 },
  { id: 'right-thigh', label: 'R Thigh', x: 58, y: 68 },
  { id: 'left-knee', label: 'L Knee', x: 42, y: 78 },
  { id: 'right-knee', label: 'R Knee', x: 58, y: 78 },
  { id: 'left-calf', label: 'L Calf', x: 42, y: 88 },
  { id: 'right-calf', label: 'R Calf', x: 58, y: 88 },
  { id: 'left-foot', label: 'L Foot', x: 42, y: 95 },
  { id: 'right-foot', label: 'R Foot', x: 58, y: 95 }
];

export const BodyChart = ({ markedAreas, onAreasChange, readonly = false }: BodyChartProps) => {
  const [view, setView] = useState<'front' | 'back'>('front');

  const handleAreaClick = (areaId: string) => {
    if (readonly) return;
    
    if (markedAreas.includes(areaId)) {
      onAreasChange(markedAreas.filter(id => id !== areaId));
    } else {
      onAreasChange([...markedAreas, areaId]);
    }
  };

  const clearAll = () => {
    if (!readonly) {
      onAreasChange([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Body Chart</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={view === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('front')}
            >
              Front
            </Button>
            <Button
              type="button"
              variant={view === 'back' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('back')}
            >
              Back
            </Button>
            {!readonly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAll}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="relative w-48 h-96 border rounded-lg bg-gray-50 mx-auto">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
              {/* Simple body outline */}
              <ellipse cx="50" cy="12" rx="8" ry="10" fill="none" stroke="#ddd" strokeWidth="1" />
              <line x1="50" y1="20" x2="50" y2="60" stroke="#ddd" strokeWidth="2" />
              <line x1="50" y1="25" x2="30" y2="45" stroke="#ddd" strokeWidth="2" />
              <line x1="50" y1="25" x2="70" y2="45" stroke="#ddd" strokeWidth="2" />
              <line x1="50" y1="60" x2="45" y2="95" stroke="#ddd" strokeWidth="2" />
              <line x1="50" y1="60" x2="55" y2="95" stroke="#ddd" strokeWidth="2" />
              
              {/* Clickable areas */}
              {bodyAreas.map((area) => (
                <circle
                  key={area.id}
                  cx={area.x}
                  cy={area.y}
                  r="4"
                  fill={markedAreas.includes(area.id) ? "#ef4444" : "#94a3b8"}
                  stroke={markedAreas.includes(area.id) ? "#dc2626" : "#64748b"}
                  strokeWidth="1"
                  className={readonly ? "cursor-default" : "cursor-pointer hover:fill-red-400"}
                  onClick={() => handleAreaClick(area.id)}
                />
              ))}
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Marked Areas:</h4>
              <div className="flex flex-wrap gap-1">
                {markedAreas.length === 0 ? (
                  <span className="text-gray-500 text-sm">No areas marked</span>
                ) : (
                  markedAreas.map((areaId) => {
                    const area = bodyAreas.find(a => a.id === areaId);
                    return (
                      <Badge key={areaId} variant="destructive" className="text-xs">
                        {area?.label || areaId}
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {readonly ? 'View marked areas' : 'Click on body areas to mark symptoms/pain locations'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
