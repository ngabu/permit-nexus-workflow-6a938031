import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, MapPin, Calendar, Building2 } from "lucide-react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"

interface IntentRegistration {
  id: string
  activity_description: string
  activity_level: string
  project_site_address: string | null
  status: string
  created_at: string
  entity?: {
    name: string
  }
}

export function IntentsListReadOnly() {
  const [intents, setIntents] = useState<IntentRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIntents = async () => {
      try {
        const { data, error } = await supabase
          .from('intent_registrations')
          .select(`
            id,
            activity_description,
            activity_level,
            project_site_address,
            status,
            created_at,
            entity:entities(name)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setIntents(data || [])
      } catch (error) {
        console.error('Error fetching intents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIntents()
  }, [])

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
      case 'rejected':
        return 'bg-red-500'
      case 'under_review':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {intents?.map((intent) => (
        <Card key={intent.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg line-clamp-2">{intent.activity_description}</CardTitle>
              </div>
              <Badge className={getStatusColor(intent.status || '')}>{intent.status}</Badge>
            </div>
            {intent.project_site_address && (
              <CardDescription className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                {intent.project_site_address}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {intent.activity_level && (
              <div className="text-sm">
                <span className="font-medium">Level:</span> {intent.activity_level}
              </div>
            )}
            {intent.entity?.name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{intent.entity.name}</span>
              </div>
            )}
            {intent.created_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Submitted: {format(new Date(intent.created_at), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
