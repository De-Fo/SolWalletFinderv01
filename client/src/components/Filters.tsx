
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
import { useEffect } from "react";

interface FiltersProps {
  onFiltersChange: (filters: any) => void;
}

export function Filters({ onFiltersChange }: FiltersProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      marketCapMin: "",
      marketCapMax: "",
      timeStart: "",
      timeEnd: "",
      valueMin: "",
      valueMax: "",
      maxTransactionsPerMinute: 60
    },
    mode: "onChange"
  });

  const onSubmit = (values: any) => {
    onFiltersChange(values);
  };

  const watchedValues = watch();

  useEffect(() => {
    onFiltersChange(watchedValues);
  }, [watchedValues, onFiltersChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Market Cap Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min"
                {...register("marketCapMin")}
              />
              <Input
                placeholder="Max"
                {...register("marketCapMax")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Transaction Value Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min"
                {...register("valueMin")}
              />
              <Input
                placeholder="Max"
                {...register("valueMax")}
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
                setValue("maxTransactionsPerMinute", value, { shouldDirty: true });
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
