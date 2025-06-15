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
import { Dialog, DialogTrigger } from "./ui/dialog";
import { SettingsDialog } from "./settings-dialog";

const USER_CACHE_KEY = "navUserCache";

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Try to load cached user immediately
  useEffect(() => {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      setUser(JSON.parse(cached));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
        setLoading(false);
        return;
      }
      const userData = {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          user.user_metadata?.displayName ||
          user.email ||
          "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
      };
      setUser(userData);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
      setLoading(false);
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(USER_CACHE_KEY);
    router.refresh();
  };

  // Only show skeleton if no cached user and loading
  if (loading && !user) return <NavUserSkeleton />;
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
              <DropdownMenuItem
                onClick={() => {
                  setSettingsOpen(true);
                }}
              >
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
      <SettingsDialog open={settingsOpen} setOpen={setSettingsOpen} />
    </SidebarMenu>
  );
}
