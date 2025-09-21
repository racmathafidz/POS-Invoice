import InvoiceForm from "../components/form/InvoiceForm";

export default function CreateInvoicePage() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Create Invoice</h1>
      <InvoiceForm />
    </div>
  );
}
