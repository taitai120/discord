import { NavigationSideBar } from "@/components/navigation/navigation-sidebar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSideBar />
      </div>
      <section className="md:pl-[72px] h-full">{children}</section>
    </main>
  );
};

export default MainLayout;
