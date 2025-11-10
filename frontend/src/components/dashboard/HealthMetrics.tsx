import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Droplet, Wind, TrendingUp, TrendingDown } from "lucide-react";

const metrics = [
  {
    title: "Heart Rate",
    value: "72",
    unit: "bpm",
    icon: Heart,
    trend: "down",
    change: "-2%",
    status: "normal",
  },
  {
    title: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    icon: Activity,
    trend: "stable",
    change: "0%",
    status: "normal",
  },
  {
    title: "Blood Sugar",
    value: "95",
    unit: "mg/dL",
    icon: Droplet,
    trend: "up",
    change: "+3%",
    status: "normal",
  },
  {
    title: "Oxygen Level",
    value: "98",
    unit: "%",
    icon: Wind,
    trend: "stable",
    change: "0%",
    status: "normal",
  },
];

export const HealthMetrics = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className="hover:shadow-glow transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className="bg-primary/10 p-2 rounded-lg">
              <metric.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold mb-1">
                  {metric.value}
                  <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-accent" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-primary" />
                  ) : null}
                  <span className={metric.trend === "up" ? "text-accent" : "text-primary"}>
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground">vs last week</span>
                </div>
              </div>
            </div>

            <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  metric.status === "normal" ? "bg-primary" : "bg-destructive"
                }`}
                style={{ width: "75%" }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
