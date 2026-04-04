import { prisma } from "@/config/db";

export const getDashboardStats = async () => {
    const [
        totalUsers, totalProducts, totalOrders, totalRevenue,
        recentOrders, topProducts, ordersByStatus,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } },
        }),
        prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 5,
        }),
        prisma.order.groupBy({
            by: ["status"],
            _count: { _all: true },
        }),
    ]);

    return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentOrders,
        topProducts,
        ordersByStatus,
    };
};

export const getRevenueByMonth = async () => {
    // Raw query for monthly revenue aggregation
    const result = await prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
    SELECT 
      TO_CHAR(o."createdAt", 'YYYY-MM') AS month,
      SUM(p.amount) AS revenue
    FROM "Order" o
    JOIN "Payment" p ON p."orderId" = o.id
    WHERE p.status = 'PAID'
    GROUP BY month
    ORDER BY month ASC
    LIMIT 12
  `;
    return result;
};
