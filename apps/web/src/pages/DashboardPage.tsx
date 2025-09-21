import InvoiceList from "../components/invoices/InvoiceList";
import RevenueChart from "../components/charts/RevenueChart";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4">
      <h2 className="text-2xl font-bold">Revenue</h2>
      <RevenueChart />
      <h1 className="text-2xl font-bold pt-8">Invoices</h1>
      <InvoiceList />
    </div>
  );
}
