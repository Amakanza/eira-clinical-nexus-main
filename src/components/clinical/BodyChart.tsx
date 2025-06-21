
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
  // Head and Neck
  { id: 'head', label: 'Head', x: 50, y: 8, frontView: true, backView: true },
  { id: 'neck', label: 'Neck', x: 50, y: 15, frontView: true, backView: true },
  
  // Upper Extremities
  { id: 'left-shoulder', label: 'L Shoulder', x: 35, y: 22, frontView: true, backView: true },
  { id: 'right-shoulder', label: 'R Shoulder', x: 65, y: 22, frontView: true, backView: true },
  { id: 'left-upper-arm', label: 'L Upper Arm', x: 28, y: 32, frontView: true, backView: true },
  { id: 'right-upper-arm', label: 'R Upper Arm', x: 72, y: 32, frontView: true, backView: true },
  { id: 'left-elbow', label: 'L Elbow', x: 25, y: 42, frontView: true, backView: true },
  { id: 'right-elbow', label: 'R Elbow', x: 75, y: 42, frontView: true, backView: true },
  { id: 'left-forearm', label: 'L Forearm', x: 22, y: 52, frontView: true, backView: true },
  { id: 'right-forearm', label: 'R Forearm', x: 78, y: 52, frontView: true, backView: true },
  { id: 'left-wrist', label: 'L Wrist', x: 20, y: 62, frontView: true, backView: true },
  { id: 'right-wrist', label: 'R Wrist', x: 80, y: 62, frontView: true, backView: true },
  { id: 'left-hand', label: 'L Hand', x: 18, y: 68, frontView: true, backView: true },
  { id: 'right-hand', label: 'R Hand', x: 82, y: 68, frontView: true, backView: true },

  // Trunk
  { id: 'chest', label: 'Chest', x: 50, y: 30, frontView: true, backView: false },
  { id: 'upper-back', label: 'Upper Back', x: 50, y: 30, frontView: false, backView: true },
  { id: 'abdomen', label: 'Abdomen', x: 50, y: 45, frontView: true, backView: false },
  { id: 'lower-back', label: 'Lower Back', x: 50, y: 45, frontView: false, backView: true },
  { id: 'pelvis', label: 'Pelvis', x: 50, y: 55, frontView: true, backView: true },

  // Lower Extremities
  { id: 'left-hip', label: 'L Hip', x: 42, y: 58, frontView: true, backView: true },
  { id: 'right-hip', label: 'R Hip', x: 58, y: 58, frontView: true, backView: true },
  { id: 'left-thigh', label: 'L Thigh', x: 42, y: 68, frontView: true, backView: true },
  { id: 'right-thigh', label: 'R Thigh', x: 58, y: 68, frontView: true, backView: true },
  { id: 'left-knee', label: 'L Knee', x: 42, y: 78, frontView: true, backView: true },
  { id: 'right-knee', label: 'R Knee', x: 58, y: 78, frontView: true, backView: true },
  { id: 'left-calf', label: 'L Calf', x: 42, y: 88, frontView: true, backView: true },
  { id: 'right-calf', label: 'R Calf', x: 58, y: 88, frontView: true, backView: true },
  { id: 'left-ankle', label: 'L Ankle', x: 42, y: 94, frontView: true, backView: true },
  { id: 'right-ankle', label: 'R Ankle', x: 58, y: 94, frontView: true, backView: true },
  { id: 'left-foot', label: 'L Foot', x: 42, y: 98, frontView: true, backView: true },
  { id: 'right-foot', label: 'R Foot', x: 58, y: 98, frontView: true, backView: true }
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

  const getVisibleAreas = () => {
    return bodyAreas.filter(area => 
      view === 'front' ? area.frontView : area.backView
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Body Chart - Pain/Symptom Locations</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={view === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('front')}
            >
              Front View
            </Button>
            <Button
              type="button"
              variant={view === 'back' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('back')}
            >
              Back View
            </Button>
            {!readonly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAll}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="relative w-60 h-[500px] border rounded-lg bg-gray-50 mx-auto">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
              {/* Enhanced body outline */}
              {view === 'front' ? (
                <>
                  {/* Head */}
                  <ellipse cx="50" cy="10" rx="6" ry="8" fill="none" stroke="#ddd" strokeWidth="1" />
                  {/* Neck */}
                  <rect x="48" y="17" width="4" height="6" fill="none" stroke="#ddd" strokeWidth="1" />
                  {/* Torso */}
                  <path d="M 42 23 Q 35 25 35 35 L 35 55 Q 35 60 42 60 L 58 60 Q 65 60 65 55 L 65 35 Q 65 25 58 23 Z" 
                        fill="none" stroke="#ddd" strokeWidth="1" />
                  {/* Arms */}
                  <line x1="35" y1="25" x2="20" y2="65" stroke="#ddd" strokeWidth="2" />
                  <line x1="65" y1="25" x2="80" y2="65" stroke="#ddd" strokeWidth="2" />
                  {/* Legs */}
                  <line x1="42" y1="60" x2="42" y2="100" stroke="#ddd" strokeWidth="3" />
                  <line x1="58" y1="60" x2="58" y2="100" stroke="#ddd" strokeWidth="3" />
                </>
              ) : (
                <>
                  {/* Head (back) */}
                  <ellipse cx="50" cy="10" rx="6" ry="8" fill="none" stroke="#ddd" strokeWidth="1" />
                  {/* Neck */}
                  <rect x="48" y="17" width="4" height="6" fill="none" stroke="#ddd" strokeWidth="1" />
                  {/* Back torso */}
                  <path d="M 42 23 Q 35 25 35 35 L 35 55 Q 35 60 42 60 L 58 60 Q 65 60 65 55 L 65 35 Q 65 25 58 23 Z" 
                        fill="none" stroke="#ddd" strokeWidth="1" />
                  {/* Arms (back) */}
                  <line x1="35" y1="25" x2="20" y2="65" stroke="#ddd" strokeWidth="2" />
                  <line x1="65" y1="25" x2="80" y2="65" stroke="#ddd" strokeWidth="2" />
                  {/* Legs (back) */}
                  <line x1="42" y1="60" x2="42" y2="100" stroke="#ddd" strokeWidth="3" />
                  <line x1="58" y1="60" x2="58" y2="100" stroke="#ddd" strokeWidth="3" />
                  {/* Spine indication */}
                  <line x1="50" y1="20" x2="50" y2="60" stroke="#ddd" strokeWidth="1" strokeDasharray="2,2" />
                </>
              )}
              
              {/* Clickable areas for current view */}
              {getVisibleAreas().map((area) => (
                <circle
                  key={area.id}
                  cx={area.x}
                  cy={area.y}
                  r="3"
                  fill={markedAreas.includes(area.id) ? "#ef4444" : "#94a3b8"}
                  stroke={markedAreas.includes(area.id) ? "#dc2626" : "#64748b"}
                  strokeWidth="1"
                  className={readonly ? "cursor-default" : "cursor-pointer hover:fill-red-400 hover:r-4 transition-all"}
                  onClick={() => handleAreaClick(area.id)}
                />
              ))}
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Marked Areas ({view} view):</h4>
              <div className="flex flex-wrap gap-1">
                {markedAreas.length === 0 ? (
                  <span className="text-gray-500 text-sm">No areas marked</span>
                ) : (
                  markedAreas
                    .filter(areaId => {
                      const area = bodyAreas.find(a => a.id === areaId);
                      return area && (view === 'front' ? area.frontView : area.backView);
                    })
                    .map((areaId) => {
                      const area = bodyAreas.find(a => a.id === areaId);
                      return (
                        <Badge key={areaId} variant="destructive" className="text-xs">
                          {area?.label || areaId}
                        </Badge>
                      );
                    })
                )}
              </div>
              {markedAreas.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Switch between front/back views to see all marked areas
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {readonly 
                ? 'View marked pain/symptom locations' 
                : 'Click on body areas to mark pain/symptom locations. Use front/back view buttons to access all body regions.'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
