import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Droplet, Heart, Wind } from "lucide-react";
import type { HealthMetric } from "@/types/api";

interface HealthMetricsProps {
  metrics: HealthMetric[];
}

export const HealthMetrics = ({ metrics }: HealthMetricsProps) => {
  if (!metrics.length) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-muted-foreground">No health metrics available yet. Measurements will appear here once recorded.</p>
      </div>
    );
  }

  const latestMetric = metrics[0];

  const metricCards = [
    {
      title: "Heart Rate",
      value: latestMetric.heartRate ? `${latestMetric.heartRate}` : "N/A",
      unit: latestMetric.heartRate ? "bpm" : "",
      icon: Heart,
    },
    {
      title: "Blood Pressure",
      value:
        latestMetric.systolicBloodPressure && latestMetric.diastolicBloodPressure
          ? `${latestMetric.systolicBloodPressure}/${latestMetric.diastolicBloodPressure}`
          : "N/A",
      unit: latestMetric.systolicBloodPressure && latestMetric.diastolicBloodPressure ? "mmHg" : "",
      icon: Activity,
    },
    {
      title: "Blood Sugar",
      value: latestMetric.bloodSugarMgDl ? `${latestMetric.bloodSugarMgDl}` : "N/A",
      unit: latestMetric.bloodSugarMgDl ? "mg/dL" : "",
      icon: Droplet,
    },
    {
      title: "Oxygen Level",
      value: latestMetric.oxygenSaturation ? `${latestMetric.oxygenSaturation}` : "N/A",
      unit: latestMetric.oxygenSaturation ? "%" : "",
      icon: Wind,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric) => (
        <Card key={metric.title} className="hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <div className="bg-primary/10 p-2 rounded-lg">
              <metric.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {metric.value}
              <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Last recorded on {new Date(latestMetric.recordedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
