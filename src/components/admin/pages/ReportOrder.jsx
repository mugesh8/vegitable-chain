import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, Download } from 'lucide-react';
import { getAllOrders } from '../../../api/orderApi';
import { getOrderAssignment } from '../../../api/orderAssignmentApi';
import { getAllDrivers } from '../../../api/driverApi';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders and assignments on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Fetch drivers first
        const driversResponse = await getAllDrivers();
        if (driversResponse.success && driversResponse.data) {
          setDrivers(driversResponse.data);
        }

        const response = await getAllOrders();
        if (response.success && response.data) {
          // Sort orders by date (newest first)
          const sortedOrders = response.data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });
          setOrders(sortedOrders);

          // Fetch assignment data for each order
          const assignmentsData = {};
          for (const order of sortedOrders) {
            try {
              const assignmentResponse = await getOrderAssignment(order.oid);
              assignmentsData[order.oid] = assignmentResponse.data;
            } catch (err) {
              // If assignment doesn't exist, that's fine
              assignmentsData[order.oid] = null;
            }
          }
          setAssignments(assignmentsData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on date range and search query
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      // Date filter
      if (fromDate || toDate) {
        const orderDate = new Date(order.createdAt || order.order_received_date);
        if (fromDate && orderDate < new Date(fromDate)) return false;
        if (toDate) {
          const toDateTime = new Date(toDate);
          toDateTime.setHours(23, 59, 59, 999); // Include the entire end date
          if (orderDate > toDateTime) return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrderId = (order.order_auto_id || order.order_id || '').toLowerCase().includes(query);
        const matchesCustomer = (order.customer_name || '').toLowerCase().includes(query);
        return matchesOrderId || matchesCustomer;
      }

      return true;
    });
  }, [orders, fromDate, toDate, searchQuery]);

  // Calculate dynamic statistics
  const stats = React.useMemo(() => {
    const totalOrders = orders.length;

    // Count orders by assignment status
    const completedOrders = Object.values(assignments).filter(assignment =>
      assignment &&
      assignment.stage1_status === 'completed' &&
      assignment.stage2_status === 'completed' &&
      assignment.stage3_status === 'completed' &&
      assignment.stage4_status === 'completed'
    ).length;

    const inProgressOrders = Object.values(assignments).filter(assignment =>
      assignment && (
        assignment.stage1_status === 'completed' ||
        assignment.stage2_status === 'completed' ||
        assignment.stage3_status === 'completed' ||
        assignment.stage4_status === 'completed'
      ) && !(
        assignment.stage1_status === 'completed' &&
        assignment.stage2_status === 'completed' &&
        assignment.stage3_status === 'completed' &&
        assignment.stage4_status === 'completed'
      )
    ).length;

    const notStartedOrders = totalOrders - completedOrders - inProgressOrders;

    // Calculate total value
    const totalValue = orders.reduce((sum, order) => {
      if (order.items && Array.isArray(order.items)) {
        const orderTotal = order.items.reduce((itemSum, item) =>
          itemSum + (parseFloat(item.total_price) || 0), 0
        );
        return sum + orderTotal;
      }
      return sum;
    }, 0);

    // Format total value
    const formatValue = (value) => {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
      if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
      return `₹${value.toFixed(0)}`;
    };

    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return [
      {
        label: 'Total Orders',
        value: totalOrders.toString(),
        change: `${completionRate}% Complete`,
        color: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0]'
      },
      {
        label: 'Completed',
        value: completedOrders.toString(),
        change: `${completionRate}%`,
        color: 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]'
      },
      {
        label: 'Total Value',
        value: formatValue(totalValue),
        change: 'All Time',
        color: 'bg-gradient-to-r from-[#10B981] to-[#059669]'
      },
      {
        label: 'In Progress',
        value: inProgressOrders.toString(),
        change: 'Active',
        color: 'bg-gradient-to-r from-[#047857] to-[#065F46]'
      }
    ];
  }, [orders, assignments]);

  // Pagination calculations - use filteredOrders instead of orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '-';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status based on assignment stages - matching OrderAssignManagement logic
  const getAssignmentStatus = (orderId) => {
    const assignment = assignments[orderId];

    if (!assignment) {
      return { label: 'Pending', color: 'bg-yellow-500' };
    }

    // Check if all stages are completed
    if (
      assignment.stage1_status === 'completed' &&
      assignment.stage2_status === 'completed' &&
      assignment.stage3_status === 'completed' &&
      assignment.stage4_status === 'completed'
    ) {
      return { label: 'Completed', color: 'bg-[#4ED39A]' };
    }

    // Otherwise, it's pending
    return { label: 'Pending', color: 'bg-yellow-500' };
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Export filtered orders to Excel
  const handleExportFilteredExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [[
      { v: 'Order ID', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, font: { color: { rgb: 'FFFFFF' } } } },
      { v: 'Customer', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, font: { color: { rgb: 'FFFFFF' } } } },
      { v: 'Date', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, font: { color: { rgb: 'FFFFFF' } } } },
      { v: 'Items', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, font: { color: { rgb: 'FFFFFF' } } } },
      { v: 'Value (₹)', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, font: { color: { rgb: 'FFFFFF' } } } },
      { v: 'Status', s: { font: { bold: true }, fill: { fgColor: { rgb: '4472C4' } }, font: { color: { rgb: 'FFFFFF' } } } }
    ]];

    filteredOrders.forEach(order => {
      const orderTotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) || 0;
      const statusInfo = getAssignmentStatus(order.oid);
      data.push([
        order.order_auto_id || `ORD-${order.oid}`,
        order.customer_name || '-',
        formatDate(order.createdAt),
        order.items?.length || 0,
        orderTotal.toFixed(2),
        statusInfo.label
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export filtered orders to PDF
  const handleExportFilteredPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Orders Report', 105, 15, { align: 'center' });
    
    const tableData = filteredOrders.map(order => {
      const orderTotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) || 0;
      const statusInfo = getAssignmentStatus(order.oid);
      return [
        order.order_auto_id || `ORD-${order.oid}`,
        order.customer_name || '-',
        formatDate(order.createdAt),
        order.items?.length || 0,
        orderTotal.toFixed(2),
        statusInfo.label
      ];
    });

    doc.autoTable({
      startY: 25,
      head: [['Order ID', 'Customer', 'Date', 'Items', 'Value', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [68, 114, 196] }
    });

    doc.save(`Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export individual order to Excel with all stage details
  const handleExportOrderExcel = async (order) => {
    try {
      const assignment = assignments[order.oid];
      if (!assignment) {
        alert('No assignment data found for this order');
        return;
      }

      const workbook = XLSX.utils.book_new();
      const data = [];

      // Styling
      const headerStyle = {
        fill: { fgColor: { rgb: "4472C4" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      const cellStyle = {
        font: { sz: 10, name: "Calibri" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      const labelStyle = {
        font: { sz: 10, name: "Calibri", bold: true },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // ORDER INFORMATION
      data.push([{ v: 'ORDER INFORMATION', s: headerStyle }]);
      data.push([{ v: 'Order ID', s: labelStyle }, { v: order.order_auto_id || `ORD-${order.oid}`, s: cellStyle }]);
      data.push([{ v: 'Customer Name', s: labelStyle }, { v: order.customer_name || '-', s: cellStyle }]);
      data.push([{ v: 'Order Date', s: labelStyle }, { v: formatDate(order.createdAt), s: cellStyle }]);
      data.push([{ v: 'Total Items', s: labelStyle }, { v: order.items?.length || 0, s: cellStyle }]);
      data.push([]);

      // STAGE 1: PRODUCT COLLECTION
      data.push([{ v: 'STAGE 1: PRODUCT COLLECTION', s: headerStyle }]);

      const stage1Source = assignment.product_assignments || assignment.stage1_data;

      // Get Stage 4 data for quantities
      const stage4SourceForStage1 = assignment.stage4_data;
      let stage4ProductRows = [];
      if (stage4SourceForStage1) {
        let stage4Data = typeof stage4SourceForStage1 === 'string' ? JSON.parse(stage4SourceForStage1) : stage4SourceForStage1;
        stage4ProductRows = stage4Data.reviewData?.productRows || stage4Data.productRows || [];
      }

      // Get Stage 3 data as fallback
      const stage3SourceForStage1 = assignment.stage3_data;
      let stage3Products = [];
      if (stage3SourceForStage1) {
        let stage3Data = typeof stage3SourceForStage1 === 'string' ? JSON.parse(stage3SourceForStage1) : stage3SourceForStage1;
        stage3Products = stage3Data.products || [];
      }

      // Get Stage 2 data as another fallback
      const stage2SourceForStage1 = assignment.stage2_data;
      let stage2Assignments = [];
      if (stage2SourceForStage1) {
        let stage2Data = typeof stage2SourceForStage1 === 'string' ? JSON.parse(stage2SourceForStage1) : stage2SourceForStage1;
        stage2Assignments = stage2Data.productAssignments || stage2Data.stage2Assignments || stage2Data.assignments || [];
      }

      if (stage1Source) {
        let stage1Data = typeof stage1Source === 'string' ? JSON.parse(stage1Source) : stage1Source;

        // Stage1 saves as: { productAssignments: [...], deliveryRoutes: [...], summaryData: {...} }
        let stage1Assignments = stage1Data.productAssignments || stage1Data.assignments || (Array.isArray(stage1Data) ? stage1Data : []);

        if (stage1Assignments && stage1Assignments.length > 0) {
          data.push([
            { v: 'Product', s: headerStyle },
            { v: 'Entity Type', s: headerStyle },
            { v: 'Entity Name', s: headerStyle },
            { v: 'Assigned Qty (kg)', s: headerStyle },
            { v: 'Assigned Boxes', s: headerStyle },
            { v: 'Place', s: headerStyle }
          ]);

          stage1Assignments.forEach((item, index) => {
            const product = item.product || item.productName || item.product_name || '-';
            const entityType = item.entityType || item.entity_type || '-';
            const entityName = item.assignedTo || item.entityName || item.entity_name || '-';

            // Try to get quantity from multiple sources
            let qtyValue = parseFloat(item.assignedQty || item.assigned_qty || item.pickedQuantity || 0);

            // If assignedQty is 0, try Stage 4 first
            if (qtyValue === 0) {
              const stage4Product = stage4ProductRows.find(p4 =>
                (p4.product_name || p4.product || p4.productName) === product
              );
              if (stage4Product) {
                qtyValue = parseFloat(stage4Product.net_weight || stage4Product.quantity || stage4Product.assignedQty || 0);
              }
            }

            // If still 0, try Stage 3 gross weight
            if (qtyValue === 0) {
              const stage3Product = stage3Products.find(p3 =>
                (p3.product || p3.productName || p3.product_name) === product
              );
              if (stage3Product) {
                const grossWeightStr = stage3Product.grossWeight || stage3Product.gross_weight || '0';
                qtyValue = parseFloat(grossWeightStr.toString().replace(/[^0-9.]/g, '')) || 0;
              }
            }

            // If still 0, try Stage 2 picked quantity
            if (qtyValue === 0) {
              const stage2Product = stage2Assignments.find(p2 =>
                (p2.product || p2.productName || p2.product_name) === product
              );
              if (stage2Product) {
                qtyValue = parseFloat(stage2Product.pickedQuantity || stage2Product.picked_quantity || 0);
              }
            }

            const boxes = parseInt(item.assignedBoxes || item.assigned_boxes || item.pickedBoxes || 0);
            const place = item.place || (entityType === 'farmer' ? 'Farmer place' : '-');

            data.push([
              { v: product, s: cellStyle },
              { v: entityType, s: cellStyle },
              { v: entityName, s: cellStyle },
              { v: qtyValue, s: cellStyle },
              { v: boxes, s: cellStyle },
              { v: place, s: cellStyle }
            ]);
          });
        } else {
          data.push([{ v: 'No Stage 1 data available', s: cellStyle }]);
        }
      } else {
        data.push([{ v: 'No Stage 1 data available', s: cellStyle }]);
      }
      data.push([]);

      // STAGE 2: PACKAGING & QUALITY
      const stage2Source = assignment.stage2_data;
      if (stage2Source) {
        data.push([{ v: 'STAGE 2: PACKAGING & QUALITY', s: headerStyle }]);

        let stage2Data = typeof stage2Source === 'string' ? JSON.parse(stage2Source) : stage2Source;
        // Stage2 saves as: { productAssignments: [...], summaryData: {...} }
        let stage2Assignments = stage2Data.productAssignments || stage2Data.stage2Assignments || stage2Data.assignments || [];

        if (stage2Assignments && stage2Assignments.length > 0) {
          data.push([
            { v: 'Product', s: headerStyle },
            { v: 'Wastage (kg)', s: headerStyle },
            { v: 'Reuse (kg)', s: headerStyle },
            { v: 'Labour Assigned', s: headerStyle }
          ]);

          stage2Assignments.forEach(item => {
            const product = item.product || item.productName || item.product_name || '-';
            const wastage = parseFloat(item.wastage || 0);
            const reuse = parseFloat(item.reuse || 0);
            const labour = item.labourName || item.labourNames || item.labour || '-';

            data.push([
              { v: product, s: cellStyle },
              { v: wastage, s: cellStyle },
              { v: reuse, s: cellStyle },
              { v: labour, s: cellStyle }
            ]);
          });
        } else {
          data.push([{ v: 'No Stage 2 data available', s: cellStyle }]);
        }
        data.push([]);
      }

      // STAGE 3: DELIVERY ROUTES
      const stage3Source = assignment.stage3_data;
      if (stage3Source) {
        data.push([{ v: 'STAGE 3: DELIVERY ROUTES', s: headerStyle }]);

        let stage3Data = typeof stage3Source === 'string' ? JSON.parse(stage3Source) : stage3Source;

        // Stage3 saves as: { products: [...], summaryData: {...} }
        let deliveryData = stage3Data.products || [];
        let driverAssignments = stage3Data.summaryData?.driverAssignments || [];

        if (deliveryData && deliveryData.length > 0) {
          data.push([
            { v: 'Driver Name', s: headerStyle },
            { v: 'Product', s: headerStyle },
            { v: 'Gross Weight (kg)', s: headerStyle },
            { v: 'Labour Assigned', s: headerStyle },
            { v: 'CT', s: headerStyle },
            { v: 'No of Pkgs', s: headerStyle },
            { v: 'Airport Name', s: headerStyle },
            { v: 'Airport Location', s: headerStyle }
          ]);

          deliveryData.forEach((item, index) => {
            const product = item.product || item.productName || item.product_name || '-';

            if (index === 0) {
              console.log('=== STAGE 3 DRIVER DEBUG ===');
              console.log('First item:', item);
              console.log('Product:', product);
              console.log('stage3Data.summaryData:', stage3Data.summaryData);
              console.log('stage3Data.summaryData?.airportGroups:', stage3Data.summaryData?.airportGroups);
            }

            // Find driver from airportGroups by matching product
            let driverName = '';
            const airportGroups = stage3Data.summaryData?.airportGroups || {};

            // Search through all airport groups to find the product and its driver
            for (const [airportCode, airportData] of Object.entries(airportGroups)) {
              const productInGroup = airportData.products?.find(p =>
                (p.product || p.productName) === product
              );
              if (productInGroup) {
                driverName = productInGroup.driver || '';
                if (index === 0) {
                  console.log('Found product in airportGroup:', airportCode);
                  console.log('Product data:', productInGroup);
                  console.log('Driver name:', driverName);
                }
                break;
              }
            }

            // If not found in airportGroups, try driverAssignments as fallback
            if (!driverName && driverAssignments.length > 0) {
              const driverAssignment = driverAssignments.find(da =>
                da.assignments?.some(a =>
                  (a.product || a.productName) === product
                )
              );
              if (driverAssignment) {
                driverName = driverAssignment.driver || '';
              }
            }

            // If still no driver name, use selectedDriver ID to look up from drivers list
            if (!driverName && item.selectedDriver) {
              const driverId = parseInt(item.selectedDriver);

              if (index === 0) {
                console.log('=== DRIVER LOOKUP DEBUG ===');
                console.log('drivers array:', drivers);
                console.log('drivers length:', drivers.length);
                console.log('selectedDriver:', item.selectedDriver);
                console.log('driverId (parsed):', driverId);
                if (drivers.length > 0) {
                  console.log('First driver:', drivers[0]);
                  console.log('First driver.did:', drivers[0].did);
                  console.log('First driver.driver_name:', drivers[0].driver_name);
                }
              }

              const driver = drivers.find(d => d.did === driverId);

              if (index === 0) {
                console.log('Found driver:', driver);
              }

              if (driver) {
                driverName = driver.driver_name || driver.name || '';
                if (index === 0) {
                  console.log('Driver name:', driverName);
                }
              } else {
                driverName = `Driver Not Found (ID: ${item.selectedDriver})`;
                if (index === 0) {
                  console.log('Driver not found in drivers list, using ID:', item.selectedDriver);
                  console.log('Available driver IDs:', drivers.map(d => d.did));
                }
              }
            }

            if (index === 0 && !driverName) {
              console.log('No driver found for product:', product);
            }

            const grossWeightStr = item.grossWeight || item.gross_weight || '0';
            const grossWeight = parseFloat(grossWeightStr.toString().replace(/[^0-9.]/g, '')) || 0;
            const labour = item.labour || item.labourNames || item.labour_names || '-';
            const ct = item.ct || '-';
            const noOfPkgs = item.noOfPkgs || item.no_of_pkgs || 0;
            const airportName = item.airportName || item.airport_name || '-';
            const airportLocation = item.airportLocation || item.airport_location || '-';

            data.push([
              { v: driverName || '-', s: cellStyle },
              { v: product, s: cellStyle },
              { v: grossWeight.toFixed(2), s: cellStyle },
              { v: labour, s: cellStyle },
              { v: ct, s: cellStyle },
              { v: noOfPkgs, s: cellStyle },
              { v: airportName, s: cellStyle },
              { v: airportLocation, s: cellStyle }
            ]);
          });
        } else {
          data.push([{ v: 'No Stage 3 data available', s: cellStyle }]);
        }
        data.push([]);
      }

      // STAGE 4: PRICING
      const stage4Source = assignment.stage4_data;
      if (stage4Source) {
        data.push([{ v: 'STAGE 4: PRICING', s: headerStyle }]);

        let stage4Data = typeof stage4Source === 'string' ? JSON.parse(stage4Source) : stage4Source;
        let productRows = stage4Data.reviewData?.productRows || stage4Data.productRows || [];

        if (productRows && productRows.length > 0) {
          data.push([
            { v: 'Product', s: headerStyle },
            { v: 'Market Price (₹/kg)', s: headerStyle },
            { v: 'Final Price (₹/kg)', s: headerStyle },
            { v: 'Quantity (kg)', s: headerStyle },
            { v: 'Total Amount (₹)', s: headerStyle }
          ]);

          let grandTotal = 0;
          productRows.forEach(row => {
            const product = row.product_name || row.product || row.productName || '-';
            const marketPrice = parseFloat(row.marketPrice || row.market_price || 0);
            const finalPrice = parseFloat(row.price || row.final_price || 0);
            const quantity = parseFloat(row.net_weight || row.quantity || row.assignedQty || 0);
            const totalAmount = finalPrice * quantity;
            grandTotal += totalAmount;

            data.push([
              { v: product, s: cellStyle },
              { v: marketPrice, s: cellStyle },
              { v: finalPrice, s: cellStyle },
              { v: quantity.toFixed(2), s: cellStyle },
              { v: totalAmount.toFixed(2), s: cellStyle }
            ]);
          });

          // Grand Total Row
          const grandTotalStyle = {
            fill: { fgColor: { rgb: "10B981" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };

          data.push([
            { v: '', s: cellStyle },
            { v: '', s: cellStyle },
            { v: '', s: cellStyle },
            { v: 'GRAND TOTAL:', s: grandTotalStyle },
            { v: `₹${grandTotal.toFixed(2)}`, s: grandTotalStyle }
          ]);
        } else {
          data.push([{ v: 'No Stage 4 data available', s: cellStyle }]);
        }
      }

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(workbook, ws, 'Order Details');
      XLSX.writeFile(workbook, `Order_${order.order_auto_id || order.oid}_Detailed_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      console.error('Assignment data:', assignment);
      alert('Failed to export order details: ' + error.message);
    }
  };

  // Export individual order to PDF with all stage details
  const handleExportOrderPDF = async (order) => {
    try {
      const assignment = assignments[order.oid];
      if (!assignment) {
        alert('No assignment data found for this order');
        return;
      }

      // Helper function to extract English text from product names (remove Tamil characters)
      const cleanProductName = (productName) => {
        if (!productName) return '-';
        // Remove Tamil Unicode characters (U+0B80 to U+0BFF) and keep English text
        // Also remove parentheses that contained Tamil text
        return productName
          .replace(/[\u0B80-\u0BFF]/g, '') // Remove Tamil characters
          .replace(/\(\s*\)/g, '') // Remove empty parentheses
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
      };

      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Order Detailed Report', 105, yPos, { align: 'center' });
      yPos += 15;

      // Order Information
      doc.setFontSize(12);
      doc.text('Order Information', 14, yPos);
      yPos += 5;

      doc.autoTable({
        startY: yPos,
        head: [['Field', 'Value']],
        body: [
          ['Order ID', order.order_auto_id || `ORD-${order.oid}`],
          ['Customer Name', order.customer_name || '-'],
          ['Order Date', formatDate(order.createdAt)],
          ['Total Items', order.items?.length || 0]
        ],
        theme: 'grid',
        headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // STAGE 1: PRODUCT COLLECTION
      const stage1Source = assignment.product_assignments || assignment.stage1_data;

      // Get Stage 4 data for quantities
      const stage4SourceForPdfStage1 = assignment.stage4_data;
      let stage4ProductRowsForPdf = [];
      if (stage4SourceForPdfStage1) {
        let stage4DataPdf = typeof stage4SourceForPdfStage1 === 'string' ? JSON.parse(stage4SourceForPdfStage1) : stage4SourceForPdfStage1;
        stage4ProductRowsForPdf = stage4DataPdf.reviewData?.productRows || stage4DataPdf.productRows || [];
      }

      // Get Stage 3 data as fallback
      const stage3SourceForPdfStage1 = assignment.stage3_data;
      let stage3ProductsForPdf = [];
      if (stage3SourceForPdfStage1) {
        let stage3DataPdf = typeof stage3SourceForPdfStage1 === 'string' ? JSON.parse(stage3SourceForPdfStage1) : stage3SourceForPdfStage1;
        stage3ProductsForPdf = stage3DataPdf.products || [];
      }

      // Get Stage 2 data as another fallback
      const stage2SourceForPdfStage1 = assignment.stage2_data;
      let stage2AssignmentsForPdf = [];
      if (stage2SourceForPdfStage1) {
        let stage2DataPdf = typeof stage2SourceForPdfStage1 === 'string' ? JSON.parse(stage2SourceForPdfStage1) : stage2SourceForPdfStage1;
        stage2AssignmentsForPdf = stage2DataPdf.productAssignments || stage2DataPdf.stage2Assignments || stage2DataPdf.assignments || [];
      }

      if (stage1Source) {
        let stage1Data = typeof stage1Source === 'string' ? JSON.parse(stage1Source) : stage1Source;
        let stage1Assignments = stage1Data.productAssignments || stage1Data.assignments || (Array.isArray(stage1Data) ? stage1Data : []);

        if (stage1Assignments && stage1Assignments.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Stage 1: Product Collection', 14, yPos);
          yPos += 5;

          const stage1Body = stage1Assignments.map(item => {
            const product = item.product || item.productName || item.product_name || '-';

            // Try to get quantity from multiple sources
            let qtyValue = parseFloat(item.assignedQty || item.assigned_qty || item.pickedQuantity || 0);

            // If assignedQty is 0, try Stage 4 first
            if (qtyValue === 0) {
              const stage4Product = stage4ProductRowsForPdf.find(p4 =>
                (p4.product_name || p4.product || p4.productName) === product
              );
              if (stage4Product) {
                qtyValue = parseFloat(stage4Product.net_weight || stage4Product.quantity || stage4Product.assignedQty || 0);
              }
            }

            // If still 0, try Stage 3 gross weight
            if (qtyValue === 0) {
              const stage3Product = stage3ProductsForPdf.find(p3 =>
                (p3.product || p3.productName || p3.product_name) === product
              );
              if (stage3Product) {
                const grossWeightStr = stage3Product.grossWeight || stage3Product.gross_weight || '0';
                qtyValue = parseFloat(grossWeightStr.toString().replace(/[^0-9.]/g, '')) || 0;
              }
            }

            // If still 0, try Stage 2 picked quantity
            if (qtyValue === 0) {
              const stage2Product = stage2AssignmentsForPdf.find(p2 =>
                (p2.product || p2.productName || p2.product_name) === product
              );
              if (stage2Product) {
                qtyValue = parseFloat(stage2Product.pickedQuantity || stage2Product.picked_quantity || 0);
              }
            }

            return [
              cleanProductName(product),
              item.entityType || item.entity_type || '-',
              item.assignedTo || item.entityName || item.entity_name || '-',
              qtyValue.toFixed(2),
              parseInt(item.assignedBoxes || item.assigned_boxes || item.pickedBoxes || 0),
              item.place || (item.entityType === 'farmer' ? 'Farmer place' : '-')
            ];
          });

          doc.autoTable({
            startY: yPos,
            head: [['Product', 'Entity Type', 'Entity Name', 'Qty (kg)', 'Boxes', 'Place']],
            body: stage1Body,
            theme: 'grid',
            headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
            bodyStyles: { fontSize: 8, halign: 'center' },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 25 },
              2: { cellWidth: 30 },
              3: { cellWidth: 20 },
              4: { cellWidth: 20 },
              5: { cellWidth: 30 }
            },
            margin: { left: 14, right: 14 }
          });

          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      // STAGE 2: PACKAGING & QUALITY
      const stage2Source = assignment.stage2_data;
      if (stage2Source) {
        let stage2Data = typeof stage2Source === 'string' ? JSON.parse(stage2Source) : stage2Source;
        let stage2Assignments = stage2Data.productAssignments || stage2Data.stage2Assignments || stage2Data.assignments || [];

        if (stage2Assignments && stage2Assignments.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Stage 2: Packaging & Quality', 14, yPos);
          yPos += 5;

          const stage2Body = stage2Assignments.map(item => {
            const labour = item.labourName || item.labourNames || item.labour || '-';
            return [
              cleanProductName(item.product || item.productName || item.product_name || '-'),
              parseFloat(item.wastage || 0).toFixed(2),
              parseFloat(item.reuse || 0).toFixed(2),
              labour
            ];
          });

          doc.autoTable({
            startY: yPos,
            head: [['Product', 'Wastage (kg)', 'Reuse (kg)', 'Labour Assigned']],
            body: stage2Body,
            theme: 'grid',
            headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
            bodyStyles: { fontSize: 8, halign: 'center' },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 30 },
              2: { cellWidth: 30 },
              3: { cellWidth: 50 }
            },
            margin: { left: 14, right: 14 }
          });

          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      // STAGE 3: DELIVERY ROUTES
      const stage3Source = assignment.stage3_data;
      if (stage3Source) {
        let stage3Data = typeof stage3Source === 'string' ? JSON.parse(stage3Source) : stage3Source;
        let deliveryData = stage3Data.products || [];
        let driverAssignments = stage3Data.summaryData?.driverAssignments || [];

        if (deliveryData && deliveryData.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Stage 3: Delivery Routes', 14, yPos);
          yPos += 5;

          const stage3Body = deliveryData.map(item => {
            const product = item.product || item.productName || item.product_name || '-';

            // Find driver from airportGroups by matching product
            let driverName = '';
            const airportGroups = stage3Data.summaryData?.airportGroups || {};

            // Search through all airport groups to find the product and its driver
            for (const [airportCode, airportData] of Object.entries(airportGroups)) {
              const productInGroup = airportData.products?.find(p =>
                (p.product || p.productName) === product
              );
              if (productInGroup) {
                driverName = productInGroup.driver || '';
                break;
              }
            }

            // If not found in airportGroups, try driverAssignments as fallback
            if (!driverName && driverAssignments.length > 0) {
              const driverAssignment = driverAssignments.find(da =>
                da.assignments?.some(a =>
                  (a.product || a.productName) === product
                )
              );
              if (driverAssignment) {
                driverName = driverAssignment.driver || '';
              }
            }

            // If still no driver name, use selectedDriver ID to look up from drivers list
            if (!driverName && item.selectedDriver) {
              const driverId = parseInt(item.selectedDriver);
              const driver = drivers.find(d => d.did === driverId);
              if (driver) {
                driverName = driver.driver_name || driver.name || '';
              } else {
                driverName = `Driver Not Found (ID: ${item.selectedDriver})`;
              }
            }

            const grossWeightStr = item.grossWeight || item.gross_weight || '0';
            const grossWeight = parseFloat(grossWeightStr.toString().replace(/[^0-9.]/g, '')) || 0;
            const labour = item.labour || item.labourNames || item.labour_names || '-';
            const ct = item.ct || '-';
            const noOfPkgs = item.noOfPkgs || item.no_of_pkgs || 0;
            const airportName = item.airportName || item.airport_name || '-';
            const airportLocation = item.airportLocation || item.airport_location || '-';

            return [
              driverName || '-',
              cleanProductName(product),
              grossWeight.toFixed(2),
              labour,
              ct,
              noOfPkgs,
              airportName,
              airportLocation
            ];
          });

          doc.autoTable({
            startY: yPos,
            head: [['Driver', 'Product', 'Weight (kg)', 'Labour', 'CT', 'Pkgs', 'Airport', 'Location']],
            body: stage3Body,
            theme: 'grid',
            headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center' },
            bodyStyles: { fontSize: 7, halign: 'center' },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 35 },
              2: { cellWidth: 18 },
              3: { cellWidth: 25 },
              4: { cellWidth: 15 },
              5: { cellWidth: 15 },
              6: { cellWidth: 30 },
              7: { cellWidth: 22 }
            },
            margin: { left: 14, right: 14 }
          });

          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      // STAGE 4: PRICING
      const stage4Source = assignment.stage4_data;
      if (stage4Source) {
        let stage4Data = typeof stage4Source === 'string' ? JSON.parse(stage4Source) : stage4Source;
        let productRows = stage4Data.reviewData?.productRows || stage4Data.productRows || [];

        if (productRows && productRows.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Stage 4: Pricing', 14, yPos);
          yPos += 5;

          let grandTotal = 0;
          const stage4Body = productRows.map(row => {
            const product = row.product_name || row.product || row.productName || '-';
            const marketPrice = parseFloat(row.marketPrice || row.market_price || 0);
            const finalPrice = parseFloat(row.price || row.final_price || 0);
            const quantity = parseFloat(row.net_weight || row.quantity || row.assignedQty || 0);
            const totalAmount = finalPrice * quantity;
            grandTotal += totalAmount;

            return [
              cleanProductName(product),
              marketPrice.toFixed(2),
              finalPrice.toFixed(2),
              quantity.toFixed(2),
              totalAmount.toFixed(2)
            ];
          });

          // Add grand total row
          stage4Body.push(['', '', '', 'GRAND TOTAL:', `₹${grandTotal.toFixed(2)}`]);

          doc.autoTable({
            startY: yPos,
            head: [['Product', 'Market Price\n(₹/kg)', 'Final Price\n(₹/kg)', 'Qty\n(kg)', 'Total\n(₹)']],
            body: stage4Body,
            theme: 'grid',
            headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold', fontSize: 8, halign: 'center', valign: 'middle', minCellHeight: 12 },
            bodyStyles: { fontSize: 8, halign: 'center' },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 30 },
              2: { cellWidth: 30 },
              3: { cellWidth: 25 },
              4: { cellWidth: 30 }
            },
            footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
            margin: { left: 14, right: 14 }
          });
        }
      }

      doc.save(`Order_${order.order_auto_id || order.oid}_Detailed_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      console.error('Order:', order);
      alert('Failed to export order details: ' + error.message);
    }
  };


  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <button onClick={() => navigate('/reports')} className="flex items-center gap-2 text-[#0D5C4D] hover:text-[#0a6354] mb-6">
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Reports</span>
      </button>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-[#D0E0DB]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0D5C4D] mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D5C4D] mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D5C4D] mb-2">Search</label>
            <input
              type="text"
              placeholder="Order ID or Customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-[#D0E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D8568]"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleExportFilteredExcel}
              className="flex-1 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={handleExportFilteredPDF}
              className="flex-1 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2"
            >
              <FileDown size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-2xl p-6 ${index === 2 || index === 3 ? 'text-white' : 'text-[#0D5C4D]'}`}>
            <div className="text-sm font-medium mb-2 opacity-90">{stat.label}</div>
            <div className="text-4xl font-bold mb-2">{stat.value}</div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${index === 2 || index === 3 ? 'bg-white/20 text-white' : 'bg-white/60 text-[#0D5C4D]'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-[#D0E0DB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D4F4E8]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Value</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0D5C4D]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => {
                  const orderTotal = order.items?.reduce((sum, item) =>
                    sum + (parseFloat(item.total_price) || 0), 0
                  ) || 0;
                  const statusInfo = getAssignmentStatus(order.oid);

                  return (
                    <tr key={order.oid} className={`border-b border-[#D0E0DB] hover:bg-[#F0F4F3] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F0F4F3]/30'}`}>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">{order.order_auto_id || `ORD-${order.oid}`}</td>
                      <td className="px-6 py-4 font-semibold text-[#0D5C4D]">{order.customer_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-[#0D5C4D]">{order.items?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#0D5C4D]">{formatCurrency(orderTotal)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusInfo.color} text-white`}>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportOrderExcel(order)}
                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="Export to Excel"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleExportOrderPDF(order)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Export to PDF"
                          >
                            <FileDown size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#F0F4F3] border-t border-[#D0E0DB]">
            <div className="text-sm text-[#6B8782]">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B8782] hover:bg-[#D0E0DB]'}`}
              >
                &lt;
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#6B8782]">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                      ? 'bg-[#0D8568] text-white'
                      : 'text-[#6B8782] hover:bg-[#D0E0DB]'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#6B8782] hover:bg-[#D0E0DB]'}`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportOrder;
