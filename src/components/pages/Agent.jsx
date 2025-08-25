import { useState } from "react";

export default function Agent() {
  const [activeTab, setActiveTab] = useState("booking");

  // Delivery Dashboard State

  const [lrList, setLrList] = useState([
    { id: 1, lrNo: "LR001", status: "pending", vehicleNumber: "TN01BT3543", deliveryPerson: "" },
    { id: 2, lrNo: "LR002", status: "pending", vehicleNumber: "TN01BC5525", deliveryPerson: "" },
    { id: 3, lrNo: "LR003", status: "pending", vehicleNumber: "TN01BT3543", deliveryPerson: "" }
  ]);

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
  });

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Booking saved:', result);
        alert('Booking confirmed and saved!');
        // Reset form
        setBookingData({
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
        });
      } else {
        alert('Error saving booking');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving booking. Please check if the backend server is running.');
    }
  };

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <h2 className="text-xl font-bold p-4 border-b border-gray-700">
          BALAJI LORRY SERVICE
        </h2>
        {[
          "booking", 
          "loading", 
          "upcoming", 
          "delivery", 
          "reports", 
          "abstractDailyBooking", 
          "invoice", 
          "inSearch"
        ].map((tab) => (
          <button
            key={tab}
            className={`p-4 text-left hover:bg-gray-700 ${
              activeTab === tab ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "abstractDailyBooking" ? "Abstract Daily Booking" :
             tab === "inSearch" ? "In Search" :
             tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
        {/* Delivery Dashboard Tab */}
        {activeTab === "delivery" && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold">DELIVERY</span>
              </div>
              <h2 className="text-2xl font-bold">DASH BOARD</h2>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">ALL LRS RECEIVED FROM KTD</h3>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">LR NO</th>
                    <th className="px-4 py-3 text-left font-semibold">UPDATE DELIVERY</th>
                    <th className="px-4 py-3 text-left font-semibold">VEHICLE NUMBER</th>
                    <th className="px-4 py-3 text-left font-semibold">DELIVERY TAKEN PERSON DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {lrList.map((lr) => (
                    <tr key={lr.id} className="border-b">
                      <td className="px-4 py-3">{lr.lrNo}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lr.status}
                          onChange={(e) => handleDeliveryUpdate(lr.id, 'status', e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="delivered">Delivered</option>
                          <option value="inTransit">In Transit</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">{lr.vehicleNumber}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Enter person details"
                          value={lr.deliveryPerson}
                          onChange={(e) => handleDeliveryUpdate(lr.id, 'deliveryPerson', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
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
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold">REPORTS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Daily Reports</h3>
                <div className="space-y-2 text-gray-700">
                  <div>DAILY BOOKING REG</div>
                  <div>DAILY DELIVERY REG</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">DOWNLOAD</h3>
                <div className="space-y-2 text-gray-700">
                  <div>PDF</div>
                  <div>EXCEL</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Abstract Daily Booking Tab */}
        {activeTab === "abstractDailyBooking" && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold">ABSTRACT DAILY BOOKING</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FROM :- ALL</label>
                  <input
                    type="text"
                    placeholder="SELECT BRANCH"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TO ALL</label>
                  <input
                    type="text"
                    placeholder="SELECT BRANCH"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DATE FROM TO</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="date"
                      className="border rounded px-3 py-2"
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
                    <span className="text-sm text-gray-700">ALONG WITH LR DETAILS</span>
                  </label>
                </div>
              </div>
              
              <button className="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                Generate Report
              </button>
            </div>
          </div>
        )}

        {/* Invoice Tab */}
        {activeTab === "invoice" && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold">INVOICE</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700">ON ACCOUNT INVOICE</div>
                <div className="text-lg font-semibold text-gray-700">PAID BOOKING INVOICE</div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                
                <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In Search Tab */}
        {activeTab === "inSearch" && (
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-green-200 px-4 py-2 rounded mr-4">
                <span className="text-green-800 font-bold">IN SEARCH</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <div className="space-y-2 text-gray-700 mb-4">
                  <div>BY LR NUMBER</div>
                  <div>BY L SHEET NUMBER</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
                    <select
                      value={searchData.searchType}
                      onChange={(e) => setSearchData({...searchData, searchType: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="lrNumber">LR Number</option>
                      <option value="lSheetNumber">L Sheet Number</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Value</label>
                    <input
                      type="text"
                      placeholder="Enter search value"
                      value={searchData.searchValue}
                      onChange={(e) => setSearchData({...searchData, searchValue: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                
                <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                  Search
                </button>
              </div>
              
              {/* Waybill Tracking Section */}
              <div className="border-t pt-6">
                <div className="text-center mb-4">
                  <div className="bg-black text-white px-6 py-2 rounded inline-block">
                    Track Way bill Number : KTD-001
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Booking</h4>
                    <div className="space-y-1 text-sm">
                      <div>Station: HYK(HYDERABAD KATTENDAN)</div>
                      <div>Name: MANJUSHREE POLYMERS PVT LTD</div>
                      <div>Mobile : 9391522251</div>
                      <div>Booking Amount: 35000</div>
                      <div>Commodity Type: POLY BAG</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Delivery</h4>
                    <div className="space-y-1 text-sm">
                      <div>Station: MDUH(MADURAI)</div>
                      <div>Name: PATWARI BAKERS PVT LTD</div>
                      <div>Mobile: 9391522251</div>
                      <div>Delivery Type: Door Delivery</div>
                      <div>Quantity : 193</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Current Position</h4>
                    <div className="space-y-1 text-sm">
                      <div>Booked at HYK(HYDERABAD</div>
                      <div>Loaded to(CHENNAI)(TN01BT3543)</div>
                      <div>unloaded at(CHENNAI) (TN01BT3543)</div>
                      <div>Delivered On: <span className="text-green-600 font-semibold">DELIVERED</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Date & Time</h4>
                    <div className="space-y-1 text-sm">
                      <div>29-Mar-25</div>
                      <div>3/29/2025 20:41</div>
                      <div>3/30/2025 05:40:37 AM</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">DESCRIPTION of Payments</h4>
                  <div className="space-y-1 text-sm">
                    <div>CASH 30000 GIVEN TO VEHICLE RENT</div>
                    <div>TN01BC5525 BALANCE 5000/- GIVEN TO</div>
                    <div>AYYPPA ANNA THROUGH P PAY</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Tab */}
        {activeTab === "booking" && (
          <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">BOOKING</h2>
                <div className="text-lg">LR TYPE</div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-lg font-semibold">FROM- HYD</div>
                <div className="text-lg font-semibold">TO CHENNAI</div>
              </div>
            </div>

            <form
              onSubmit={handleBookingSubmit}
              className="bg-white p-6 rounded-lg shadow-lg space-y-6"
            >
              {/* Sender & Receiver */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">SENDER / CONSIGNOR</h3>
                  <input
                    type="text"
                    name="senderCompany"
                    placeholder="COMPAY NAME"
                    value={bookingData.senderCompany}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded mb-2"
                  />
                  <input
                    type="text"
                    name="senderMobile"
                    placeholder="MOBILE NUMBER"
                    value={bookingData.senderMobile}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded mb-2"
                  />
                  <input
                    type="text"
                    name="senderGST"
                    placeholder="GST NUMBER"
                    value={bookingData.senderGST}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">RECEIVER/ CONSIGNEE</h3>
                  <input
                    type="text"
                    name="receiverCompany"
                    placeholder="COMPAY NAME"
                    value={bookingData.receiverCompany}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded mb-2"
                  />
                  <input
                    type="text"
                    name="receiverMobile"
                    placeholder="MOBILE NUMBER"
                    value={bookingData.receiverMobile}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded mb-2"
                  />
                  <input
                    type="text"
                    name="receiverGST"
                    placeholder="GST NUMBER"
                    value={bookingData.receiverGST}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                </div>
              </div>

              {/* Material Description */}
              <div>
                <h3 className="font-semibold mb-2">MATERIAL DISCRIPTATION</h3>
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="material"
                    placeholder="BOX"
                    value={bookingData.material}
                    onChange={handleBookingChange}
                    className="col-span-2 border-2 border-black p-2 rounded"
                  />
                  <input
                    type="number"
                    name="qty"
                    placeholder="QTY/ ARTICLS"
                    value={bookingData.qty}
                    onChange={handleBookingChange}
                    className="border-2 border-black p-2 rounded"
                  />
                  <input
                    type="number"
                    name="weight"
                    placeholder="WEIGHT"
                    value={bookingData.weight}
                    onChange={handleBookingChange}
                    className="border-2 border-black p-2 rounded"
                  />
                </div>
              </div>

              {/* Freight */}
              <div>
                <h3 className="font-semibold mb-2">FRIEGT</h3>
                <input
                  type="number"
                  name="freight"
                  placeholder="FREIGHT"
                  value={bookingData.freight}
                  onChange={handleBookingChange}
                  className="w-1/4 border-2 border-black p-2 rounded"
                />
              </div>

              {/* Invoice and Goods Condition */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    name="invoice"
                    placeholder="INVOICE"
                    value={bookingData.invoice}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded mb-2"
                  />
                  <input
                    type="text"
                    name="invoiceValue"
                    placeholder="INVOICE VALUE"
                    value={bookingData.invoiceValue}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="goodsCondition"
                    placeholder="GOODS CONDITION"
                    value={bookingData.goodsCondition}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                </div>
              </div>

              {/* Charges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <input
                    type="number"
                    name="lrCharge"
                    placeholder="LR CHARGE"
                    value={bookingData.lrCharge}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                  <input
                    type="number"
                    name="handling"
                    placeholder="HANDILING"
                    value={bookingData.handling}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                  <input
                    type="number"
                    name="pickup"
                    placeholder="PICKUP/ DCC"
                    value={bookingData.pickup}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                </div>
                <div className="space-y-4">
                  <input
                    type="number"
                    name="doorDelivery"
                    placeholder="DOOR DELIVERY"
                    value={bookingData.doorDelivery}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                  <input
                    type="number"
                    name="others"
                    placeholder="OTHERS"
                    value={bookingData.others}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                  <input
                    type="number"
                    name="total"
                    placeholder="TOTAL"
                    value={bookingData.total}
                    onChange={handleBookingChange}
                    className="w-full border-2 border-black p-2 rounded"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600"
                >
                  CONFIRM BOOKING
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading Sheet Tab */}
        {activeTab === "loading" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Loading Sheet</h2>
            <form
              onSubmit={handleLoadingSubmit}
              className="bg-white p-6 rounded-lg shadow-lg space-y-6"
            >
              {/* Branch & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="bookingBranch"
                  placeholder="Select Booking Branch"
                  value={loadingData.bookingBranch}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="deliveryBranch"
                  placeholder="Select Delivery Branch"
                  value={loadingData.deliveryBranch}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Vehicle Number"
                  value={loadingData.vehicleNumber}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="driverName"
                  placeholder="Driver Name"
                  value={loadingData.driverName}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="driverMobile"
                  placeholder="Driver Mobile"
                  value={loadingData.driverMobile}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded col-span-2"
                />
              </div>

              {/* LR Rows */}
              <div>
                <h3 className="font-semibold mb-2">Loaded LRs</h3>
                {loadingData.lrRows.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-7 gap-2 mb-2 border-b pb-2"
                  >
                    <input
                      type="text"
                      name="lrNo"
                      placeholder="LR No"
                      value={row.lrNo}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="date"
                      name="bDate"
                      value={row.bDate}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    />
                    <select
                      name="payment"
                      value={row.payment}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    >
                      <option value="TOPAY">TOPAY</option>
                      <option value="PAID">PAID</option>
                      <option value="ON ACC">ON ACC</option>
                    </select>
                    <input
                      type="text"
                      name="sender"
                      placeholder="Sender"
                      value={row.sender}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      name="receiver"
                      placeholder="Receiver"
                      value={row.receiver}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      name="articles"
                      placeholder="Articles"
                      value={row.articles}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      name="freight"
                      placeholder="Freight"
                      value={row.freight}
                      onChange={(e) => handleLRRowChange(index, e)}
                      className="border p-2 rounded"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLRRow}
                  className="bg-gray-600 text-white px-4 py-1 rounded"
                >
                  + Add LR
                </button>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="totalFreight"
                  placeholder="Total Freight"
                  value={loadingData.totalFreight}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="doorDelivery"
                  placeholder="Door Delivery"
                  value={loadingData.doorDelivery}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="pickup"
                  placeholder="Pickup"
                  value={loadingData.pickup}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="handling"
                  placeholder="Handling Charges"
                  value={loadingData.handling}
                  onChange={handleLoadingChange}
                  className="border p-2 rounded"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Confirm Load Sheet
              </button>
            </form>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === "upcoming" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
            <p>Upcoming consignments will be shown here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
