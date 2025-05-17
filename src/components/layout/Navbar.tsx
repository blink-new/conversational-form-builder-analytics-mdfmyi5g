import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useIsMobile } from '../../hooks/use-mobile';
import Sidebar from './Sidebar';

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="border-b border-border bg-white py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5 text-midnight" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}
          <Link to="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-midnight"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span className="text-xl font-heading font-semibold text-midnight hidden md:block">FormFolio</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/builder/new">
            <Button className="bg-teal hover:bg-teal/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="text-slate">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-midnight text-white text-sm">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Navbar;