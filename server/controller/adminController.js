const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Template = require("../model/templateModel");
const Blog = require("../model/blogModel");

exports.testAdmin = async (req, res) => {
  return res.status(200).json({
    status: "Success",
    message: "You are an admin !",
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const userIds = users.map((user) => user.userId);

    const orderCounts = await Order.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const orderCountMap = new Map(orderCounts.map((entry) => [entry._id, entry.count]));

    const usersWithOrderInfo = users.map((user) => ({
      ...user._doc,
      orderCount: orderCountMap.get(user.userId) || 0,
      reordered: (orderCountMap.get(user.userId) || 0) > 1,
    }));

    return res.status(200).json({
      status: "Success",
      users: usersWithOrderInfo,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      monthlyUsers,
      totalOrders,
      monthlyOrders,
      totalTemplates,
      monthlyTemplates,
      totalBlogs,
      monthlyBlogs,
      revenueAgg,
      monthlyRevenueAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Template.countDocuments(),
      Template.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Blog.countDocuments(),
      Blog.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "failed" } } },
        { $group: { _id: null, total: { $sum: "$orderAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            orderStatus: { $ne: "failed" },
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$orderAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

    return res.status(200).json({
      status: "Success",
      stats: {
        totalRevenue,
        monthlyRevenue,
        totalOrders,
        monthlyOrders,
        totalUsers,
        monthlyUsers,
        totalTemplates,
        monthlyTemplates,
        totalBlogs,
        monthlyBlogs,
        ordersPerUserRatio: totalUsers
          ? Number(((totalOrders / totalUsers) * 100).toFixed(1))
          : 0,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
