import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/Sidebar";
import { Package, FileText, Calendar, Truck, BarChart3, Search, MapPin, AlertTriangle } from "lucide-react";

export default function Agent() {
  const [activeTab, setActiveTab] = useState("booking");
  const [agentLocation, setAgentLocation] = useState(""); // Will be fetched from user profile
  const [loading, setLoading] = useState(true);

  // Delivery Dashboard State
  const [lrList, setLrList] = useState([
    { id: 1, lrNo: "LR001", status: "pending", vehicleNumber: "TN01BT3543", deliveryPerson: "" },
    { id: 2, lrNo: "LR002", status: "pending", vehicleNumber: "TN01BC5525", deliveryPerson: "" },
    { id: 3, lrNo: "LR003", status: "pending", vehicleNumber: "TN01BT3543", deliveryPerson: "" }
  ]);

  // Generate next LR number using state to ensure proper updates
  const [lrCounter, setLrCounter] = useState(1000); // Will be updated based on database
  
  const generateLRNumber = useCallback(() => {
    const nextLR = lrCounter;
    setLrCounter(prev => prev + 1);
    return `LR${nextLR}`;
  }, [lrCounter]);
  
  const handleDeliveryUpdate = (lrId, field, value) => {
    setLrList(prev => prev.map(lr => 
      lr.id === lrId ? { ...lr, [field]: value } : lr
    ));
  };

  // Abstract Daily Booking State
  const [abstractData, setAbstractData] = useState({
    fromBranch: "ALL",
    toBranch: "ALL",
    dateFrom: "",
    dateTo: "",
    includeLRDetails: false
  });

  // Invoice State

  // In Search State
  const [searchData, setSearchData] = useState({
    searchType: "lrNumber",
    searchValue: "",
    waybillNumber: ""
  });

  // Booking Form State
  const [bookingData, setBookingData] = useState({
    lrNumber: "",
    senderCompany: "",
    senderMobile: "",
    senderGST: "",
    receiverCompany: "",
    receiverMobile: "",
    receiverGST: "",
    material: "",
    qty: "",
    weight: "",
    freight: "",
    invoice: "",
    invoiceValue: "",
    goodsCondition: "",
    lrCharge: "",
    handling: "",
    pickup: "",
    doorDelivery: "",
    others: "",
    total: "",
    toLocation: "",
  });

  // Use ref to track if initial LR has been set
  const initialLRSet = useRef(false);
  
  // Fetch the highest LR number from database and set counter
  const fetchHighestLRNumber = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings');
      if (response.ok) {
        const bookings = await response.json();
        if (bookings.length > 0) {
          // Extract numbers from LR numbers (LR1000 -> 1000)
          const lrNumbers = bookings
            .map(booking => booking.lrNumber)
            .filter(lr => lr && lr.startsWith('LR'))
            .map(lr => parseInt(lr.replace('LR', '')))
            .filter(num => !isNaN(num));
          
          if (lrNumbers.length > 0) {
            const highestLR = Math.max(...lrNumbers);
            setLrCounter(highestLR + 1); // Start from next number
          } else {
            setLrCounter(1000); // Default if no valid LR numbers found
          }
        } else {
          setLrCounter(1000); // Default if no bookings exist
        }
      } else {
        setLrCounter(1000); // Fallback to default
      }
    } catch {
      setLrCounter(1000); // Fallback to default
    }
  };
  
  // Set initial LR number when component mounts (only once)
  useEffect(() => {
    if (!initialLRSet.current) {
      // First fetch the highest LR number, then set the initial LR
      fetchHighestLRNumber().then(() => {
        // This will trigger another useEffect when lrCounter changes
      });
    }
  }, []);
  
  // Set initial LR number when lrCounter is updated
  useEffect(() => {
    if (lrCounter > 1000 && !initialLRSet.current) {
      const initialLR = `LR${lrCounter}`;
      setBookingData(prev => ({
        ...prev,
        lrNumber: initialLR
      }));
      initialLRSet.current = true;
    }
  }, [lrCounter]);



  // Calculate total of additional charges only (memoized to prevent infinite re-renders)
  const currentTotal = useMemo(() => {
    const lrCharge = parseFloat(bookingData.lrCharge) || 0;
    const handling = parseFloat(bookingData.handling) || 0;
    const pickup = parseFloat(bookingData.pickup) || 0;
    const doorDelivery = parseFloat(bookingData.doorDelivery) || 0;
    const others = parseFloat(bookingData.others) || 0;
    
    // Calculate total of additional charges only
    const total = lrCharge + handling + pickup + doorDelivery + others;
    
    return total.toFixed(2);
  }, [bookingData.lrCharge, bookingData.handling, bookingData.pickup, bookingData.doorDelivery, bookingData.others]);
  


  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Get current user info
    const authUser = localStorage.getItem("auth_user");
    const user = authUser ? JSON.parse(authUser) : null;
    
    // Prepare booking data with agent info and calculated total
    const bookingDataWithAgent = {
      ...bookingData,
      lrNumber: bookingData.lrNumber, // Ensure LR number is included
      total: currentTotal, // Use calculated total
      agentName: user?.name || "Unknown Agent",
      fromLocation: agentLocation,
      toLocation: bookingData.toLocation,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDataWithAgent),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Booking saved:', result);
        alert('Booking confirmed and saved!');
        // Reset form and generate new LR number
        const newLRNumber = generateLRNumber();
        
        const resetData = {
          lrNumber: newLRNumber,
          senderCompany: "",
          senderMobile: "",
          senderGST: "",
          receiverCompany: "",
          receiverMobile: "",
          receiverGST: "",
          material: "",
          qty: "",
          weight: "",
          freight: "",
          invoice: "",
          invoiceValue: "",
          goodsCondition: "",
          lrCharge: "",
          handling: "",
          pickup: "",
          doorDelivery: "",
          others: "",
          total: "",
          toLocation: "",
        };
        
        setBookingData(resetData);
      } else {
        alert('Error saving booking');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving booking. Please check if the backend server is running.');
    }
  };

  // Fetch agent location from user profile
  useEffect(() => {
    const fetchAgentLocation = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.location) {
            setAgentLocation(data.user.location);
          }
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching agent location:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentLocation();
  }, []);

  // Loading Sheet State
  const [loadingData, setLoadingData] = useState({
    bookingBranch: "",
    deliveryBranch: "",
    vehicleNumber: "",
    driverName: "",
    driverMobile: "",
    selectedLRs: [],
    lrRows: [
      { lrNo: "", bDate: "", payment: "TOPAY", sender: "", receiver: "", articles: "", freight: "" },
    ],
    totalFreight: "",
    doorDelivery: "",
    pickup: "",
    handling: "",
  });

  const handleLoadingChange = (e) => {
    setLoadingData({ ...loadingData, [e.target.name]: e.target.value });
  };

  const handleLRRowChange = (index, e) => {
    const rows = [...loadingData.lrRows];
    rows[index][e.target.name] = e.target.value;
    setLoadingData({ ...loadingData, lrRows: rows });
  };

  const addLRRow = () => {
    setLoadingData({
      ...loadingData,
      lrRows: [
        ...loadingData.lrRows,
        { lrNo: "", bDate: "", payment: "TOPAY", sender: "", receiver: "", articles: "", freight: "" },
      ],
    });
  };

  const handleLoadingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/loading-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loadingData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Loading Sheet saved:', result);
        alert('Loading Sheet confirmed and saved!');
        // Reset form
        setLoadingData({
          bookingBranch: "",
          deliveryBranch: "",
          vehicleNumber: "",
          driverName: "",
          driverMobile: "",
          selectedLRs: [],
          lrRows: [
            { lrNo: "", bDate: "", payment: "TOPAY", sender: "", receiver: "", articles: "", freight: "" },
          ],
          totalFreight: "",
          doorDelivery: "",
          pickup: "",
          handling: "",
        });
      } else {
        alert('Error saving loading sheet');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving loading sheet. Please check if the backend server is running.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Unified Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole="agent" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">Home {'>>'} {activeTab} {'>>'} List</p>
        </div>

        

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between bg-blue-600 text-white p-3 rounded-md">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            {loading ? (
              <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-full">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="text-xs">Loading...</span>
              </div>
            ) : agentLocation ? (
              <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-medium">{agentLocation}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">No Location</span>
              </div>
            )}
          </div>

          {/* TO Location Selector */}
          {agentLocation && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">TO:</span>
              <select 
                className="bg-blue-700 text-white text-xs px-2 py-1 rounded border-0 focus:ring-0 focus:outline-none"
                value={bookingData.toLocation || ""}
                onChange={(e) => setBookingData({...bookingData, toLocation: e.target.value})}
              >
                <option value="">Select Destination</option>
                <option value="HYDERABAD">HYDERABAD</option>
                <option value="CHENNAI">CHENNAI</option>
                <option value="BANGALORE">BANGALORE</option>
                <option value="MUMBAI">MUMBAI</option>
                <option value="DELHI">DELHI</option>
                <option value="KOLKATA">KOLKATA</option>
                <option value="PUNE">PUNE</option>
                <option value="AHMEDABAD">AHMEDABAD</option>
                <option value="JAIPUR">JAIPUR</option>
                <option value="LUCKNOW">LUCKNOW</option>
              </select>
            </div>
          )}
        </div>

                {/* Tab Content */}
        {activeTab === "booking" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* LR Number Section */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">LR Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">LR Number</Label>
                    <Input
                      type="text"
                      name="lrNumber"
                      value={bookingData.lrNumber}
                      className="h-8 text-sm mt-1 bg-gray-100"
                      readOnly
                    />

                  </div>
                </div>
              </div>

              {/* Sender and Receiver Section */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Sender & Receiver Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Sender Company</Label>
                    <Input
                    type="text"
                    name="senderCompany"
                      placeholder="Enter company name"
                    value={bookingData.senderCompany}
                    onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Receiver Company</Label>
                    <Input
                      type="text"
                      name="receiverCompany"
                      placeholder="Enter company name"
                      value={bookingData.receiverCompany}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Sender Mobile</Label>
                    <Input
                    type="text"
                    name="senderMobile"
                      placeholder="Enter mobile number"
                    value={bookingData.senderMobile}
                    onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Receiver Mobile</Label>
                    <Input
                      type="text"
                      name="receiverMobile"
                      placeholder="Enter mobile number"
                      value={bookingData.receiverMobile}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Sender GST</Label>
                    <Input
                    type="text"
                    name="senderGST"
                      placeholder="Enter GST number"
                    value={bookingData.senderGST}
                    onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                    <Label className="text-xs font-medium text-gray-600">Receiver GST</Label>
                    <Input
                    type="text"
                    name="receiverGST"
                      placeholder="Enter GST number"
                    value={bookingData.receiverGST}
                    onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                  />
                  </div>
                </div>
              </div>

              {/* Material Section */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Material Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Material</Label>
                    <Input
                  type="text"
                  name="material"
                      placeholder="Enter material description"
                  value={bookingData.material}
                  onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Quantity</Label>
                    <Input
                  type="number"
                  name="qty"
                      placeholder="Enter quantity"
                  value={bookingData.qty}
                  onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Weight</Label>
                    <Input
                  type="number"
                  name="weight"
                      placeholder="Enter weight"
                  value={bookingData.weight}
                  onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                />
                  </div>
                </div>
              </div>

              {/* Freight and Invoice Section */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Freight & Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Freight</Label>
                    <Input
                  type="number"
                  name="freight"
                      placeholder="Enter freight amount"
                  value={bookingData.freight}
                  onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Invoice Number</Label>
                    <Input
                  type="text"
                  name="invoice"
                      placeholder="Enter invoice number"
                  value={bookingData.invoice}
                  onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Invoice Value</Label>
                    <Input
                      type="text"
                      name="invoiceValue"
                      placeholder="Enter invoice value"
                      value={bookingData.invoiceValue}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                      required
                />
              </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Goods Condition</Label>
                    <Input
                  type="text"
                  name="goodsCondition"
                      placeholder="Enter goods condition"
                  value={bookingData.goodsCondition}
                  onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Charges Section */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Charges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">LR Charge</Label>
                    <Input
                      type="number"
                      name="lrCharge"
                      placeholder="Enter LR charge"
                      value={bookingData.lrCharge}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Handling</Label>
                    <Input
                      type="number"
                      name="handling"
                      placeholder="Enter handling charge"
                      value={bookingData.handling}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Pickup</Label>
                    <Input
                      type="number"
                      name="pickup"
                      placeholder="Enter pickup charge"
                      value={bookingData.pickup}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Door Delivery</Label>
                    <Input
                      type="number"
                      name="doorDelivery"
                      placeholder="Enter door delivery charge"
                      value={bookingData.doorDelivery}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Others</Label>
                    <Input
                      type="number"
                      name="others"
                      placeholder="Enter other charges"
                      value={bookingData.others}
                      onChange={handleBookingChange}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Total (Charges Only)</Label>
                    <Input
                      type="number"
                      name="total"
                      placeholder="Auto-calculated"
                      value={currentTotal}
                      className="h-8 text-sm mt-1 font-bold bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button 
                type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm"
              >
                  CONFIRM BOOKING
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Sheet Tab */}
        {activeTab === "loading" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Loading Sheet</h3>
              {agentLocation && (
                <div className="text-sm text-gray-600">
                  📍 Location: <span className="font-medium text-blue-600">{agentLocation}</span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleLoadingSubmit} className="space-y-6">
                {/* Branch & Vehicle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                    <Label className="text-xs font-medium text-gray-600">Booking Branch</Label>
                    <Input
                  type="text"
                  name="bookingBranch"
                  placeholder="Select Booking Branch"
                  value={loadingData.bookingBranch}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Delivery Branch</Label>
                    <Input
                  type="text"
                  name="deliveryBranch"
                  placeholder="Select Delivery Branch"
                  value={loadingData.deliveryBranch}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Vehicle Number</Label>
                    <Input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Vehicle Number"
                  value={loadingData.vehicleNumber}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Driver Name</Label>
                    <Input
                  type="text"
                  name="driverName"
                  placeholder="Driver Name"
                  value={loadingData.driverName}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs font-medium text-gray-600">Driver Mobile</Label>
                    <Input
                  type="text"
                  name="driverMobile"
                  placeholder="Driver Mobile"
                  value={loadingData.driverMobile}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
              </div>

              {/* LR Rows */}
              <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Loaded LRs</h4>
                {loadingData.lrRows.map((row, index) => (
                    <div key={index} className="grid grid-cols-7 gap-2 mb-2 border-b pb-2">
                      <Input
                      type="text"
                      name="lrNo"
                      placeholder="LR No"
                      value={row.lrNo}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs"
                    />
                      <Input
                      type="date"
                      name="bDate"
                      value={row.bDate}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs"
                    />
                    <select
                      name="payment"
                      value={row.payment}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs border border-gray-300 rounded px-2"
                    >
                      <option value="TOPAY">TOPAY</option>
                      <option value="PAID">PAID</option>
                      <option value="ON ACC">ON ACC</option>
                    </select>
                      <Input
                      type="text"
                      name="sender"
                      placeholder="Sender"
                      value={row.sender}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs"
                    />
                      <Input
                      type="text"
                      name="receiver"
                      placeholder="Receiver"
                      value={row.receiver}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs"
                    />
                      <Input
                      type="number"
                      name="articles"
                      placeholder="Articles"
                      value={row.articles}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs"
                    />
                      <Input
                      type="number"
                      name="freight"
                      placeholder="Freight"
                      value={row.freight}
                      onChange={(e) => handleLRRowChange(index, e)}
                        className="h-8 text-xs"
                    />
                  </div>
                ))}
                  <Button
                  type="button"
                  onClick={addLRRow}
                    variant="outline"
                    className="h-8 px-3 text-xs"
                >
                  + Add LR
                  </Button>
              </div>

              {/* Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Total Freight</Label>
                    <Input
                  type="number"
                  name="totalFreight"
                  placeholder="Total Freight"
                  value={loadingData.totalFreight}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Door Delivery</Label>
                    <Input
                  type="number"
                  name="doorDelivery"
                  placeholder="Door Delivery"
                  value={loadingData.doorDelivery}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Pickup</Label>
                    <Input
                  type="number"
                  name="pickup"
                  placeholder="Pickup"
                  value={loadingData.pickup}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Handling Charges</Label>
                    <Input
                  type="number"
                  name="handling"
                  placeholder="Handling Charges"
                  value={loadingData.handling}
                  onChange={handleLoadingChange}
                      className="h-8 text-sm mt-1"
                />
                  </div>
              </div>

              {/* Submit */}
                <div className="flex justify-end">
                  <Button
                type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm"
              >
                Confirm Load Sheet
                  </Button>
                </div>
            </form>
          </div>
        )}

        {/* Delivery Dashboard Tab */}
        {activeTab === "delivery" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold text-sm">DELIVERY</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800">DASH BOARD</h3>
            </div>
            
            <div className="text-center mb-6">
              <h4 className="text-sm font-medium text-gray-700">ALL LRS RECEIVED FROM KTD - {agentLocation.toUpperCase()}</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">LR NO</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">UPDATE DELIVERY</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">VEHICLE NUMBER</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">DELIVERY TAKEN PERSON DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {lrList.map((lr) => (
                    <tr key={lr.id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{lr.lrNo}</td>
                      <td className="px-4 py-2">
                        <select
                          value={lr.status}
                          onChange={(e) => handleDeliveryUpdate(lr.id, 'status', e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="pending">Pending</option>
                          <option value="delivered">Delivered</option>
                          <option value="inTransit">In Transit</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">{lr.vehicleNumber}</td>
                      <td className="px-4 py-2">
                        <Input
                          type="text"
                          placeholder="Enter person details"
                          value={lr.deliveryPerson}
                          onChange={(e) => handleDeliveryUpdate(lr.id, 'deliveryPerson', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold text-sm">REPORTS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Reports</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div>DAILY BOOKING REG</div>
                  <div>DAILY DELIVERY REG</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">DOWNLOAD</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div>PDF</div>
                  <div>EXCEL</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Abstract Daily Booking Tab */}
        {activeTab === "abstractDailyBooking" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold text-sm">ABSTRACT DAILY BOOKING</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">FROM :- ALL</Label>
                  <Input
                    type="text"
                    placeholder="SELECT BRANCH"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600">TO ALL</Label>
                  <Input
                    type="text"
                    placeholder="SELECT BRANCH"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600">DATE FROM TO</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      type="date"
                      className="h-8 text-xs"
                    />
                    <Input
                      type="date"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={abstractData.includeLRDetails}
                      onChange={(e) => setAbstractData({...abstractData, includeLRDetails: e.target.checked})}
                    />
                    <span className="text-xs text-gray-600">ALONG WITH LR DETAILS</span>
                  </label>
                </div>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm">
                Generate Report
              </Button>
            </div>
          </div>
        )}

        {/* Invoice Tab */}
        {activeTab === "invoice" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold text-sm">INVOICE</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700">ON ACCOUNT INVOICE</div>
              <div className="text-sm font-medium text-gray-700">PAID BOOKING INVOICE</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Customer Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter customer name"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-600">Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                
          <div>
                  <Label className="text-xs font-medium text-gray-600">Date</Label>
                  <Input
                    type="date"
                    className="h-8 text-sm mt-1"
                  />
                </div>
              </div>
              
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm">
                Generate Invoice
              </Button>
            </div>
          </div>
        )}

        {/* In Search Tab */}
        {activeTab === "inSearch" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold text-sm">IN SEARCH</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div>BY LR NUMBER</div>
                  <div>BY L SHEET NUMBER</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Search Type</Label>
                    <select
                      value={searchData.searchType}
                      onChange={(e) => setSearchData({...searchData, searchType: e.target.value})}
                      className="w-full h-8 text-xs border border-gray-300 rounded px-2 mt-1"
                    >
                      <option value="lrNumber">LR Number</option>
                      <option value="lSheetNumber">L Sheet Number</option>
                    </select>
                  </div>
                  
          <div>
                    <Label className="text-xs font-medium text-gray-600">Search Value</Label>
                    <Input
                      type="text"
                      placeholder="Enter search value"
                      value={searchData.searchValue}
                      onChange={(e) => setSearchData({...searchData, searchValue: e.target.value})}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                </div>
                
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm">
                  Search
                </Button>
              </div>
              
              {/* Waybill Tracking Section */}
              <div className="border-t pt-6">
                <div className="text-center mb-4">
                  <div className="bg-black text-white px-6 py-2 rounded inline-block text-sm">
                    Track Way bill Number : KTD-001
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Booking</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Station: HYK(HYDERABAD KATTENDAN)</div>
                      <div>Name: MANJUSHREE POLYMERS PVT LTD</div>
                      <div>Mobile : 9391522251</div>
                      <div>Booking Amount: 35000</div>
                      <div>Commodity Type: POLY BAG</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Station: MDUH(MADURAI)</div>
                      <div>Name: PATWARI BAKERS PVT LTD</div>
                      <div>Mobile: 9391522251</div>
                      <div>Delivery Type: Door Delivery</div>
                      <div>Quantity : 193</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Position</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Booked at HYK(HYDERABAD</div>
                      <div>Loaded to(CHENNAI)(TN01BT3543)</div>
                      <div>unloaded at(CHENNAI) (TN01BT3543)</div>
                      <div>Delivered On: <span className="text-green-600 font-medium">DELIVERED</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Date & Time</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>29-Mar-25</div>
                      <div>3/29/2025 20:41</div>
                      <div>3/30/2025 05:40:37 AM</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">DESCRIPTION of Payments</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>CASH 30000 GIVEN TO VEHICLE RENT</div>
                    <div>TN01BC5525 BALANCE 5000/- GIVEN TO</div>
                    <div>AYYPPA ANNA THROUGH P PAY</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === "upcoming" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming</h3>
            <p className="text-sm text-gray-600">Upcoming consignments will be shown here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
