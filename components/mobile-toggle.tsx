import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { ServerSideBar } from "@/components/server/server-sidebar";
import NavigationSideBar from "@/components/navigation/navigation-sidebar";

interface MobileToggleProps {
  serverId: string;
}

const MobileToggle = ({ serverId }: MobileToggleProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden flex">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex gap-0 p-0">
        <div className="w-[72px]">
          <NavigationSideBar />
        </div>
        <ServerSideBar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileToggle;
