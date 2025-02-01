import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { useUser } from "@/context/UserContext"
import { useTheme } from "@/context/ThemeContext"
import { Moon, Sun } from "lucide-react"
import logo from "@/assets/logo.png" 

const Header = () => {
    const { user } = useUser();
    const { theme, toggleTheme } = useTheme();
    
    return (
      <div className="px-5 flex justify-between shadow-md items-center">
          <Link to='/'>
            <div className="flex justify-center align-middle items-center gap-3">
              <img 
                src={logo} 
                alt="Logo"
                className="h-16 w-27 object-contain p-1" 
              />
              <span id="headingTitle">
                <span id=""></span>
              </span>
            </div>
          </Link>
          
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="w-12 h-10 !border-[2px] !border-solid !border-black dark:!border-white rounded-lg p-3 m-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? 
                <Moon className="h-5 w-5" /> : 
                <Sun className="h-5 w-5" />
              }
            </Button>
            
            {user ? 
              <Link to={'/dashboard'}>
                <Button variant={'dashboard'}>Dashboard</Button>
              </Link>
              : 
              <Link to={'/dashboard'}>
                <Button>Get Started</Button>
              </Link>
            }
          </div>
      </div>
    )
}

export default Header
