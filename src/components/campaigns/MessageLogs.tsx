import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MessageLog } from "@/integrations/supabase/types/message-logs";

interface MessageLogsProps {
  campaignId: string;
}

export function MessageLogs({ campaignId }: MessageLogsProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['message-logs', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_logs')
        .select(`
          *,
          contacts (
            name,
            phone_number
          )
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MessageLog[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Message SID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {log.contacts?.name || log.contacts?.phone_number}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    log.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : log.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {log.twilio_message_sid}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}