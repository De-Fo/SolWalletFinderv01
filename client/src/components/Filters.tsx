import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { filterSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FiltersProps {
  onFiltersChange: (filters: any) => void;
}

export function Filters({ onFiltersChange }: FiltersProps) {
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      marketCapMin: "",
      marketCapMax: "",
      timeStart: "",
      timeEnd: "",
      valueMin: "",
      valueMax: "",
      maxTransactionsPerMinute: 60
    }
  });

  const onSubmit = (values: any) => {
    onFiltersChange(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Market Cap Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min"
                {...form.register("marketCapMin")}
              />
              <Input
                placeholder="Max"
                {...form.register("marketCapMax")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Transaction Value Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min"
                {...form.register("valueMin")}
              />
              <Input
                placeholder="Max"
                {...form.register("valueMax")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Transactions per Minute</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              defaultValue={[60]}
              onValueChange={([value]) => {
                form.setValue("maxTransactionsPerMinute", value);
              }}
            />
          </div>

          <Button type="submit" className="w-full">
            Apply Filters
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
