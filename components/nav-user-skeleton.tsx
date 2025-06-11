import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" disabled>
          <div className="animate-pulse h-8 w-8 bg-muted rounded-lg mr-2" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-muted rounded w-24" />
            <div className="h-2 bg-muted rounded w-16" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
