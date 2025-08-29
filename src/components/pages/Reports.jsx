import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, Package } from "lucide-react";

export default function Reports() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    fromLocation: "all",
    toLocation: "all",
    agentName: "",
    status: "all"
  });

  // Available locations
  const locations = ["Hyderabad", "Chennai", "Bangalore", "Kerala", "Mumbai"];
  const statuses = ["all", "pending", "confirmed", "delivered", "cancelled"];

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        setFilteredBookings(data);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.dateFrom) {
      filtered = filtered.filter(booking => 
        new Date(booking.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(booking => 
        new Date(booking.createdAt) <= new Date(filters.dateTo)
      );
    }

    if (filters.fromLocation && filters.fromLocation !== "all") {
      filtered = filtered.filter(booking => 
        booking.fromLocation === filters.fromLocation
      );
    }

    if (filters.toLocation && filters.toLocation !== "all") {
      filtered = filtered.filter(booking => 
        booking.toLocation === filters.toLocation
      );
    }

    if (filters.agentName) {
      filtered = filtered.filter(booking => 
        booking.agentName?.toLowerCase().includes(filters.agentName.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(booking => 
        booking.status === filters.status
      );
    }

    setFilteredBookings(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      fromLocation: "all",
      toLocation: "all",
      agentName: "",
      status: "all"
    });
    setFilteredBookings(bookings);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "LR Number", "Date", "Agent", "From Location", "To Location", 
      "Sender Company", "Sender Mobile", "Sender GST", "Receiver Company", "Receiver Mobile", "Receiver GST",
      "Material", "Goods Condition", "Quantity", "Weight", "Freight", "Invoice", "Invoice Value",
      "LR Charge", "Handling", "Pickup", "Door Delivery", "Others", "Total Amount", "Status"
    ];

    const csvData = filteredBookings.map(booking => [
      booking.lrNumber || "N/A",
      new Date(booking.createdAt).toLocaleDateString(),
      booking.agentName || "N/A",
      booking.fromLocation || "N/A",
      booking.toLocation || "N/A",
      booking.senderCompany || "N/A",
      booking.senderMobile || "N/A",
      booking.senderGST || "N/A",
      booking.receiverCompany || "N/A",
      booking.receiverMobile || "N/A",
      booking.receiverGST || "N/A",
      booking.material || "N/A",
      booking.goodsCondition || "N/A",
      booking.qty || "N/A",
      booking.weight || "N/A",
      booking.freight || "N/A",
      booking.invoice || "N/A",
      booking.invoiceValue || "N/A",
      booking.lrCharge || "N/A",
      booking.handling || "N/A",
      booking.pickup || "N/A",
      booking.doorDelivery || "N/A",
      booking.others || "N/A",
      booking.total || "N/A",
      booking.status || "pending"
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Load bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600 mt-2">View and analyze all booking data from agents</p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
            <CardDescription>
              Filter bookings by date, location, agent, and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">From Location</Label>
                <Select
                  value={filters.fromLocation}
                  onValueChange={(value) => setFilters({...filters, fromLocation: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">To Location</Label>
                <Select
                  value={filters.toLocation}
                  onValueChange={(value) => setFilters({...filters, toLocation: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Agent Name</Label>
                <Input
                  type="text"
                  placeholder="Search by agent"
                  value={filters.agentName}
                  onChange={(e) => setFilters({...filters, agentName: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
              <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{filteredBookings.reduce((sum, booking) => sum + (parseFloat(booking.total) || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">₹</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(filteredBookings.map(b => b.agentName).filter(Boolean)).size}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👤</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Freight</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{filteredBookings.length > 0 ? 
                      (filteredBookings.reduce((sum, booking) => sum + (parseFloat(booking.freight) || 0), 0) / filteredBookings.length).toFixed(0) : 
                      0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">📦</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bookings Report</CardTitle>
            <CardDescription>
              Showing {filteredBookings.length} of {bookings.length} total bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No bookings found matching the current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">LR Number</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Agent</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">From → To</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Sender</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Receiver</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Material</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Qty/Weight</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Freight</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Charges</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {booking.lrNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {booking.agentName || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {booking.fromLocation || "N/A"} → {booking.toLocation || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-32 truncate">
                          <div className="text-xs">
                            <div className="font-medium">{booking.senderCompany || "N/A"}</div>
                            <div>{booking.senderMobile || "N/A"}</div>
                            <div>{booking.senderGST || "N/A"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-32 truncate">
                          <div className="text-xs">
                            <div className="font-medium">{booking.receiverCompany || "N/A"}</div>
                            <div>{booking.receiverMobile || "N/A"}</div>
                            <div>{booking.receiverGST || "N/A"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-24 truncate">
                          <div className="text-xs">
                            <div>{booking.material || "N/A"}</div>
                            <div className="text-gray-500">{booking.goodsCondition || "N/A"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="text-xs">
                            <div>Qty: {booking.qty || "N/A"}</div>
                            <div>Wt: {booking.weight || "N/A"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="text-xs">
                            <div>₹{parseFloat(booking.freight || 0).toLocaleString()}</div>
                            <div className="text-gray-500">Invoice: {booking.invoice || "N/A"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="text-xs space-y-1">
                            <div>LR: ₹{parseFloat(booking.lrCharge || 0).toLocaleString()}</div>
                            <div>Handling: ₹{parseFloat(booking.handling || 0).toLocaleString()}</div>
                            <div>Pickup: ₹{parseFloat(booking.pickup || 0).toLocaleString()}</div>
                            <div>Door: ₹{parseFloat(booking.doorDelivery || 0).toLocaleString()}</div>
                            <div>Others: ₹{parseFloat(booking.others || 0).toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          ₹{parseFloat(booking.total || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
