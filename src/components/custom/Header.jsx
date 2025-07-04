import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useUser } from "@/context/UserContext";
import logo from "@/assets/logo.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 0);
  };

  return (
    <div className="px-5 flex justify-between shadow-md items-center bg-white">
      <Link to="/">
        <div className="flex justify-center align-middle items-center gap-3">
          <img src={logo} alt="Logo" className="h-16 w-27 object-contain p-1" />
          <span id="headingTitle">
            <span id=""></span>
          </span>
        </div>
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to={"/dashboard"}>
              <Button variant={"dashboard"} className="rounded-full">
                Dashboard
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="rounded-full px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Confirm Logout
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-2 text-foreground">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Link to={"/dashboard"}>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105">
              Get Started
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
