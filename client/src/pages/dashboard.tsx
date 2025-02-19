import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChartView } from "@/components/ChartView";
import { WalletList } from "@/components/WalletList";
import { Filters } from "@/components/Filters";
import { useToast } from "@/hooks/use-toast";
import { isValidSolanaAddress } from "@/lib/web3";

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState("");
  const { toast } = useToast();
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Date, Date]>([
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date()
  ]);

  const handleSearch = () => {
    if (!isValidSolanaAddress(contractAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Solana contract address",
        variant: "destructive"
      });
      return;
    }
    // Trigger data fetching
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Enter contract address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {contractAddress && (
          <>
            <div className="grid lg:grid-cols-[300px,1fr] gap-6">
              <Filters
                onFiltersChange={(filters) => {
                  console.log("Filters changed:", filters);
                }}
              />
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <ChartView
                      contractAddress={contractAddress}
                      timeRange={selectedTimeRange}
                      onTimeRangeChange={setSelectedTimeRange}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <WalletList
                      contractAddress={contractAddress}
                      timeRange={selectedTimeRange}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
