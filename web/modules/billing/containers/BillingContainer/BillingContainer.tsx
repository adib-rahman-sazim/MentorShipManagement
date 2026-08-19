import { PaymentsTable } from "@/modules/billing/components/PaymentsTable";
import { SubscriptionStatusCard } from "@/modules/billing/components/SubscriptionStatusCard";

export const BillingContainer = () => (
  <div className="container mx-auto space-y-8 py-8">
    <div>
      <h1 className="text-3xl font-bold">Billing</h1>
      <p className="text-muted-foreground">Manage your subscription and payment history</p>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <SubscriptionStatusCard />
    </div>

    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Payment History</h2>
        <p className="text-sm text-muted-foreground">All your past payments</p>
      </div>
      <PaymentsTable />
    </section>
  </div>
);
