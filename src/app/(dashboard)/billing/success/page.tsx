import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="size-12 text-green-600" />
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your tokens will be credited shortly. This usually takes just a few seconds.
          </p>
          <Button asChild>
            <a href="/">Back to Chat</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
