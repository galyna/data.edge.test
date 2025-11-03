import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MultiSourceTable from "@/components/MultiSourceTable";
import LineMovementChart from "@/components/LineMovementChart";
import ValueRadar from "@/components/ValueRadar";
import SourceStatus from "@/components/SourceStatus";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      {/* Sidebar */}
      <Sidebar activeSection="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-3 overflow-auto">
          <div className="max-w-[2000px] mx-auto space-y-3">
            
            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 gap-3">
              {/* Multi-Source Odds Comparison - Full Width */}
              <div className="col-span-12">
                <MultiSourceTable />
              </div>

              {/* Line Movement Chart - 8 columns */}
              <div className="col-span-8">
                <LineMovementChart />
              </div>

              {/* Value Radar - 4 columns */}
              <div className="col-span-4 flex flex-col gap-3">
                <ValueRadar />
                <SourceStatus />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
