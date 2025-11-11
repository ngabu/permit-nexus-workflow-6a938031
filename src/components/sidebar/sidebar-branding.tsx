
import pngEmblem from "@/assets/png-emblem.png"

interface SidebarBrandingProps {
  collapsed: boolean
  unitName: string
}

export function SidebarBranding({ collapsed, unitName }: SidebarBrandingProps) {
  return (
    <div className="">
      {!collapsed ? (
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 flex items-center justify-center">
            <img src={pngEmblem} alt="PNG Emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground text-xl tracking-tight">PNG Conservation</h2>
            <p className="text-sm text-sidebar-foreground/70 font-medium mt-0.5">
              {unitName}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-12 h-12 flex items-center justify-center mx-auto">
          <img src={pngEmblem} alt="PNG Emblem" className="w-full h-full object-contain" />
        </div>
      )}
    </div>
  )
}
