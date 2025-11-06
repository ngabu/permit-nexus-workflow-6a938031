import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change: number
  trend: "up" | "down"
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
  
  return (
    <Card className={cn(
      "hover:shadow-card transition-all duration-200 border-border/60 bg-card/95 backdrop-blur-sm", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <div className="w-5 h-5 text-primary-foreground">
              {icon}
            </div>
          </div>
          <h3 className="text-sm font-medium text-card-foreground">{title}</h3>
        </div>
        <Badge 
          variant={isPositive ? "default" : "destructive"}
          className={cn(
            "flex items-center space-x-1 font-semibold",
            isPositive 
              ? "bg-success text-success-foreground border-success hover:bg-success/90" 
              : "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
          )}
        >
          {isPositive ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          <span>{Math.abs(change)}%</span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-1">
          {prefix && <span className="text-lg text-card-foreground">{prefix}</span>}
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {suffix && <span className="text-lg text-card-foreground">{suffix}</span>}
        </div>
        <p className="text-xs text-card-foreground mt-1">
          {isPositive ? "↗" : "↘"} {Math.abs(change)}% from last month
        </p>
      </CardContent>
    </Card>
  )
}