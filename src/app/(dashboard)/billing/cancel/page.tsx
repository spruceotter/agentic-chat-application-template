import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <XCircle className="size-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Purchase Cancelled</h1>
          <p className="text-muted-foreground">
            Your purchase was cancelled. No charges were made.
          </p>
          <Button asChild variant="outline">
            <a href="/billing">Back to Billing</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
