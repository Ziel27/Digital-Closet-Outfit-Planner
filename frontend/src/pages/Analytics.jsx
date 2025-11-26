import { useState, useEffect } from "react";
import axios from "../utils/api.js";
import logger from "../utils/logger.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  FiTrendingUp,
  FiPackage,
  FiGrid,
  FiCalendar,
  FiStar,
  FiBarChart2,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Color palette for charts
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("/api/analytics");
      setAnalytics(response.data);
    } catch (error) {
      logger.error("Error fetching analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div>Error loading analytics</div>;
  }

  const { overview, distributions, insights } = analytics;

  // Prepare data for charts
  const categoryData = Object.entries(distributions.categories || {})
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const colorData = Object.entries(distributions.colors || {})
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const mostUsedData = (insights.mostUsedOutfits || []).map((outfit) => ({
    name:
      outfit.name.length > 20
        ? outfit.name.substring(0, 20) + "..."
        : outfit.name,
    fullName: outfit.name,
    count: outfit.count,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Analytics
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Insights into your wardrobe and outfit usage
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FiPackage className="h-4 w-4 mr-2" />
              Total Clothing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalClothing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FiGrid className="h-4 w-4 mr-2" />
              Total Outfits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totalOutfits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FiStar className="h-4 w-4 mr-2" />
              Favorite Outfits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.favoriteOutfits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FiCalendar className="h-4 w-4 mr-2" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview.scheduledOutfits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.upcomingOutfits} upcoming
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Bar Chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiBarChart2 className="h-5 w-5 mr-2" />
              Category Distribution
            </CardTitle>
            <CardDescription>Your clothing items by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Color Distribution Pie Chart */}
      {colorData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Color Distribution</CardTitle>
            <CardDescription>Most common colors in your closet</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={colorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colorData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Most Used Outfits Bar Chart */}
      {mostUsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FiTrendingUp className="h-5 w-5 mr-2" />
              Most Used Outfits
            </CardTitle>
            <CardDescription>
              Your most frequently scheduled outfits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={mostUsedData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  width={120}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">
                            {payload[0].payload.fullName}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: payload[0].color }}
                          >
                            Used:{" "}
                            <span className="font-semibold">
                              {payload[0].value}
                            </span>{" "}
                            time{payload[0].value > 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your activity in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">
                {insights.recentActivity.clothingAdded}
              </div>
              <p className="text-sm text-muted-foreground">Items added</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {insights.recentActivity.outfitsCreated}
              </div>
              <p className="text-sm text-muted-foreground">Outfits created</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
