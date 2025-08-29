import { useState, useEffect } from "react";
import { 
  User, 
  Truck, 
  Package, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar({ activeTab, setActiveTab, userRole = "agent" }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      setUser(JSON.parse(authUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    window.location.href = "/";
  };

  const navigationTabs = [
    { id: "booking", label: "Booking", icon: Package },
    { id: "loading", label: "Loading Sheet", icon: FileText },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "abstract", label: "Abstract Daily Booking", icon: FileText },
    { id: "invoice", label: "Invoice", icon: FileText },
    { id: "search", label: "In Search", icon: Package }
  ];

  const adminTabs = [
    { id: "add-agent", label: "Add Agent", icon: User },
    { id: "manage-agents", label: "Manage Agents", icon: User },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "overview", label: "Overview", icon: BarChart3 }
  ];

  const tabs = userRole === "admin" ? adminTabs : navigationTabs;

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm min-h-screen flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-lg font-bold text-gray-800">BALAJI LORRY SERVICE</h1>
          <p className="text-xs text-gray-500">Logistics Management System</p>
          <p className="text-xs text-gray-400 mt-1">on track on time</p>
        </div>

        {/* User Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          {user && (
            <div className="text-sm">
              <span className="text-gray-600">welcome</span>
              <span className="ml-1 font-semibold text-gray-800">{user.name}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="pt-4 border-t border-gray-200 mt-auto">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

