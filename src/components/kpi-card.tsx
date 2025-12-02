import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change?: number
  trend?: "up" | "down"
  icon: React.ReactNode
  prefix?: string
  suffix?: string
  className?: string
}

export function KPICard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  prefix = "", 
  suffix = "",
  className 
}: KPICardProps) {
  const isPositive = trend === "up"
  const showTrend = change !== undefined && trend !== undefined
  
  return (
    <Card className={cn(
      "hover:shadow-card transition-all duration-200 border-border/60 bg-card/95 backdrop-blur-sm", 
      className
    )}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 sm:pb-3 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg shrink-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground">
              {icon}
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-card-foreground truncate">{title}</h3>
        </div>
        {showTrend && (
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className={cn(
              "flex items-center space-x-1 font-semibold shrink-0 self-start sm:self-auto",
              isPositive 
                ? "bg-success text-success-foreground border-success hover:bg-success/90" 
                : "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
            )}
          >
            {isPositive ? (
              <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            ) : (
              <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            )}
            <span className="text-xs">{Math.abs(change!)}%</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-baseline space-x-1">
          {prefix && <span className="text-base sm:text-lg text-card-foreground">{prefix}</span>}
          <p className="text-2xl sm:text-3xl font-bold text-card-foreground truncate">{value}</p>
          {suffix && <span className="text-base sm:text-lg text-card-foreground">{suffix}</span>}
        </div>
        {showTrend && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {isPositive ? "↗" : "↘"} {Math.abs(change!)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}