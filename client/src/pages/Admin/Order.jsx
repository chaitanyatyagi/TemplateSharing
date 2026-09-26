import { useEffect, useState } from "react"
import Table from "../../components/Table"
import OrderIcon from "../../assets/order-page.png"
import Amount from "../../assets/amount.png"
import OrderService from "../../api/order";

const isThisMonth = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

const Order = () => {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    monthlyOrders: 0,
    totalAmount: 0,
    monthlyAmount: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const response = await OrderService.getAllOrders();

        if (response.status === "Success") {
          const orders = response.orders || [];
          const cols = ["DATE", "NAME", "EMAIL", "QUANTITY", "PRICE", "STATUS"];

          const orderData = orders.map((order) => ({
            DATE: new Date(order.createdAt || order.orderDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            NAME: order.userName,
            EMAIL: order.userEmail,
            QUANTITY: (order.items || []).reduce((sum, item) => sum + item.quantity, 0),
            PRICE: `Rs ${order.orderAmount}`,
            STATUS: order.orderStatus,
          }));

          const totalAmount = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
          const monthlyOrders = orders.filter((o) => isThisMonth(o.createdAt || o.orderDate));
          const monthlyAmount = monthlyOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);

          setSummary({
            totalOrders: orders.length,
            monthlyOrders: monthlyOrders.length,
            totalAmount,
            monthlyAmount,
          });
          setHeaders(cols);
          setData(orderData);
        } else {
          setError(response.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders");
      }
    };

    fetchOrders();
  }, []);

  return (
  <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
    {error && (
      <div className="mb-4 p-3 bg-[#F4DEDA] text-likeRed rounded-md text-sm">{error}</div>
    )}
    {/* ======= Top Stats Cards ======= */}
    <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch gap-4">
      {/* Card 1: Orders */}
      <div className="flex flex-row justify-between items-center border-2 border-ink rounded-md min-w-[250px] sm:min-w-[230px] min-h-[110px] p-4 flex-1 bg-paper shadow-sm">
        <div className="flex flex-col gap-2 px-2 flex-grow">
          <p className="text-muted2 text-sm">Total Orders</p>
          <div className="flex flex-row gap-2 items-center">
            <img src={OrderIcon} alt="Order" className="w-5 h-5" />
            <p className="text-ink text-lg font-semi">{summary.totalOrders}</p>
          </div>
        </div>
        <div className="hidden sm:block min-h-[80px] border-r-2 border-ink mx-2"></div>
        <div className="flex flex-col gap-2 px-2 text-right">
          <p className="text-muted2 text-sm">Monthly Orders</p>
          <p className="text-ink text-lg font-semi">{summary.monthlyOrders}</p>
        </div>
      </div>

      {/* Card 2: Amount */}
      <div className="flex flex-row justify-between items-center border-2 border-ink rounded-md min-w-[250px] sm:min-w-[230px] min-h-[110px] p-4 flex-1 bg-paper shadow-sm">
        <div className="flex flex-col gap-2 px-2 flex-grow">
          <p className="text-muted2 text-sm">Total Amount</p>
          <div className="flex flex-row gap-2 items-center">
            <img src={Amount} alt="Amount" className="w-5 h-5" />
            <p className="text-ink text-lg font-semi">Rs {summary.totalAmount}</p>
          </div>
        </div>
        <div className="hidden sm:block min-h-[80px] border-r-2 border-ink mx-2"></div>
        <div className="flex flex-col gap-2 px-2 text-right">
          <p className="text-muted2 text-sm">Monthly Amount</p>
          <p className="text-ink text-lg font-semi">Rs {summary.monthlyAmount}</p>
        </div>
      </div>
    </div>

    {/* ======= Header Row (Recent Orders Section) ======= */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 shadow-sm p-4 rounded-md bg-paper">
      <p className="text-muted2 font-semibold text-base mb-2 sm:mb-0">
        Recent Orders
      </p>
    </div>

    {/* ======= Responsive Table ======= */}
    <div className="mt-4">
      <Table headers={headers} data={data} />
    </div>
  </div>
);
}

export default Order;
