import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import type { WalletTransaction } from "@shared/schema";

interface WalletListProps {
  contractAddress: string;
  timeRange: [Date, Date];
}

export function WalletList({ contractAddress, timeRange }: WalletListProps) {
  const { data: transactions, isLoading } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/transactions", contractAddress, timeRange],
    enabled: !!contractAddress,
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Wallet Address</TableHead>
          <TableHead>Transaction Hash</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions?.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-mono">{tx.walletAddress}</TableCell>
            <TableCell className="font-mono">{tx.transactionHash}</TableCell>
            <TableCell>{tx.value}</TableCell>
            <TableCell>
              {new Date(tx.timestamp).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
