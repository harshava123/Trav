import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/layout/Sidebar";
import Reports from "@/components/pages/Reports";
import { User, Users, BarChart3, FileText } from "lucide-react";

export default function Admin() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add-agent");

  // Form state for adding new agent
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "agent"
  });

  // Available locations
  const locations = ["Hyderabad", "Chennai", "Bangalore", "Kerala", "Mumbai"];

  // Fetch all agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new agent
  const handleAddAgent = async (e) => {
    e.preventDefault();
    
    if (!newAgent.name || !newAgent.email || !newAgent.password || !newAgent.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgent),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Agent added:', result);
        alert('Agent added successfully!');
        
        // Reset form
        setNewAgent({
          name: "",
          email: "",
          password: "",
          location: "",
          role: "agent"
        });
        
        // Refresh agents list
        fetchAgents();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      alert('Error adding agent. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Update agent status
  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchAgents(); // Refresh the list
        alert(`Agent ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      } else {
        alert('Error updating agent status');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Error updating agent status');
    }
  };

  // Delete agent
  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAgents(); // Refresh the list
        alert('Agent deleted successfully!');
      } else {
        alert('Error deleting agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  // Load agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Unified Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole="admin" />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage agents and system settings</p>
          </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "add-agent", label: "Add Agent", icon: User },
                { id: "manage-agents", label: "Manage Agents", icon: Users },
                { id: "reports", label: "Reports", icon: FileText },
                { id: "overview", label: "Overview", icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2 inline" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "add-agent" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Add New Agent</CardTitle>
              <CardDescription>
                Create a new agent account with location allocation. Note: Agents cannot change their assigned location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAgent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Agent Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter agent name"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={newAgent.password}
                      onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Location *
                    </Label>
                    <Select
                      value={newAgent.location}
                      onValueChange={(value) => setNewAgent({ ...newAgent, location: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

    <div>
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Role
                    </Label>
                    <Select
                      value={newAgent.role}
                      onValueChange={(value) => setNewAgent({ ...newAgent, role: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                  >
                    {loading ? "Adding..." : "Add Agent"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "manage-agents" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Manage Agents</CardTitle>
              <CardDescription>
                View, edit, and manage existing agents. Location assignments are fixed and cannot be changed by agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading agents...</p>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No agents found. Add your first agent above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Location</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Created</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {agents.map((agent) => (
                        <tr key={agent._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{agent.name}</td>
                          <td className="px-4 py-3 text-gray-600">{agent.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {agent.location}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              agent.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {agent.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              agent.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(agent.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={agent.isActive ? "destructive" : "default"}
                                onClick={() => handleToggleStatus(agent._id, agent.isActive)}
                                className="text-xs"
                              >
                                {agent.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteAgent(agent._id)}
                                className="text-xs"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "reports" && <Reports />}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
                <p className="text-xs text-gray-600 mt-1">Registered agents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {agents.filter(agent => agent.isActive).length}
                </div>
                <p className="text-xs text-gray-600 mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
                <p className="text-xs text-gray-600 mt-1">Available locations</p>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
