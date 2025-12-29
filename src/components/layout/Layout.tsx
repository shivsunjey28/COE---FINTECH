


interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen w-full flex text-foreground">
            {/* Main Content Area - Centered and full width */}
            <main className="flex-1 p-4 md:p-6 transition-all duration-300 overflow-x-hidden">
                <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};
