import { useApprovedPermits } from "@/hooks/useApprovedPermits"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, MapPin, Building2 } from "lucide-react"

export function PermitsListReadOnly() {
  const { permits, loading } = useApprovedPermits()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500'
      case 'expired':
        return 'bg-red-500'
      case 'active':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {permits?.map((permit) => (
        <Card key={permit.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg line-clamp-1">{permit.title}</CardTitle>
              </div>
              <Badge className={getStatusColor(permit.status || '')}>{permit.status}</Badge>
            </div>
            {permit.permit_number && (
              <CardDescription className="text-xs font-mono">
                {permit.permit_number}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {permit.entity_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{permit.entity_name}</span>
              </div>
            )}
            {permit.permit_type && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Type:</span> {permit.permit_type}
              </div>
            )}
            {permit.activity_level && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Level:</span> {permit.activity_level}
              </div>
            )}
            {permit.coordinates && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{permit.coordinates.lat.toFixed(4)}, {permit.coordinates.lng.toFixed(4)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
