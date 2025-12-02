import { useEntities } from "@/hooks/useEntities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, MapPin, Mail, Phone } from "lucide-react"

export function EntitiesListReadOnly() {
  const { entities, loading } = useEntities()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entities?.map((entity) => (
        <Card key={entity.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{entity.name}</CardTitle>
              </div>
              <Badge variant="secondary">{entity.entity_type}</Badge>
            </div>
            <CardDescription className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {entity.province || "Not specified"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {entity.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{entity.email}</span>
              </div>
            )}
            {entity.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{entity.phone}</span>
              </div>
            )}
            {entity.registration_number && (
              <div className="text-xs text-muted-foreground">
                Reg: {entity.registration_number}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
