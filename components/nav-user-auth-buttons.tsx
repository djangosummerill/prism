import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export function NavUserAuthButtons() {
  const router = useRouter();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In
          </Button>
          <Button
            variant="default"
            className="w-full"
            onClick={() => router.push("/auth/signup")}
          >
            Sign Up
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
