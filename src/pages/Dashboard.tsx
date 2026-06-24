import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, FileCode2, Activity, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({ runs: 0, snippets: 0, flowReadings: 0, commReadings: 0 });
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const runs = await db.test_runs.toArray();
      const snippets = await db.code_snippets.toArray();
      const flowReadings = await db.flow_readings.toArray();
      const commReadings = await db.comm_readings.toArray();
      setStats({ runs: runs.length, snippets: snippets.length, flowReadings: flowReadings.length, commReadings: commReadings.length });
      setRecentRuns(runs.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5));
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/runs")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Test Runs</CardTitle>
            <FlaskConical className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.runs}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/code")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Code Snippets</CardTitle>
            <FileCode2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.snippets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flow Readings</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.flowReadings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comm Readings</CardTitle>
            <Radio className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.commReadings}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No test runs yet. Create one from the{" "}
              <button className="text-primary hover:underline" onClick={() => navigate("/runs")}>
                Test Runs
              </button>{" "}
              page.
            </p>
          ) : (
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => navigate(`/runs/${run.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">{run.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(run.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${run.run_type === "communication" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                      {run.run_type === "communication" ? "Comm" : "Flow"}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${run.status === "completed" ? "bg-green-600/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
