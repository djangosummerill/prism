import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import { UserAvatar } from "@/components/user-avatar";
import { NavUserSkeleton } from "@/components/nav-user-skeleton";
import { NavUserAuthButtons } from "@/components/nav-user-auth-buttons";
import { LogoutDialog } from "@/components/logout-dialog";

export function NavUser() {
  const supabase = createClient();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser({
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          user.user_metadata?.displayName ||
          user.email ||
          "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
      });
      setLoading(false);
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) return <NavUserSkeleton />;
  if (!user) return <NavUserAuthButtons />;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar {...user} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <UserAvatar {...user} className="px-1 py-1.5 text-left text-sm" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconSettings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              variant="destructive"
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <LogoutDialog open={open} setOpen={setOpen} onConfirm={handleLogout} />
    </SidebarMenu>
  );
}
