"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SimpleQuickTourCreator() {
  const handleCreateTour = () => {
    alert("Quick Tour Creator button clicked! This will create sample orders.")
    // In the future, this will create:
    // - 1 Purchase Order (5 SKUs, random quantities 1-25)
    // - 10 Multi-item Batch Orders (2-4 SKUs each, max 2 units per SKU)
    // - 10 Single-item Batch Orders (1 SKU each)
    // - 25 Bulk Ship Orders (identical orders)
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">🚀 Quick Tour Creator</h2>
        <p className="text-muted-foreground">Create a complete tour with sample orders instantly</p>
        
        <Button 
          size="lg" 
          className="px-6 py-6 text-lg"
          onClick={handleCreateTour}
        >
          Create Sample Tour
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>1 Purchase Order (5 SKUs, random quantities 1-25)</li>
            <li>10 Multi-item Batch Orders (2-4 SKUs each, max 2 units per SKU)</li>
            <li>10 Single-item Batch Orders (1 SKU each)</li>
            <li>25 Bulk Ship Orders (identical orders)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
