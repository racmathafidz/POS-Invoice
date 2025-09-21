import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductSearch from "./ProductSearch";
import { createInvoice } from "../../features/invoices/invoiceSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchRevenue,
  setAutoScroll,
} from "../../features/revenue/revenueSlice";
import { useToast } from "@/hooks/use-toast";

const Schema = z.object({
  date: z.string().min(1, "Date is required"),
  customerName: z.string().min(1, "Customer name is required"),
  salespersonName: z.string().min(1, "Salesperson is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number(),
        name: z.string(),
        priceCents: z.number(),
        qty: z.number().min(1),
      })
    )
    .min(1, "Add at least one product"),
});

type FormValues = z.infer<typeof Schema>;

export default function InvoiceForm() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { granularity } = useAppSelector((s) => s.revenue);

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const today = `${yyyy}-${mm}-${dd}`;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues: {
      date: today,
      customerName: "",
      salespersonName: "",
      notes: "",
      items: [],
    },
  });

  const items = watch("items");
  const total = items.reduce((s, it) => s + it.priceCents * it.qty, 0);

  function addProduct(p: { id: number; name: string; priceCents: number }) {
    const found = items.find((i) => i.productId === p.id);
    if (found) {
      setValue(
        "items",
        items.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + 1 } : i)),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue(
        "items",
        [
          ...items,
          { productId: p.id, name: p.name, priceCents: p.priceCents, qty: 1 },
        ],
        { shouldValidate: true, shouldDirty: true }
      );
    }
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      date: values.date,
      customerName: values.customerName,
      salespersonName: values.salespersonName,
      notes: values.notes,
      items: values.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    };

    const res: any = await dispatch(createInvoice(payload));
    if (res.meta.requestStatus === "fulfilled") {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      dispatch(setAutoScroll(true));
      dispatch(fetchRevenue({ granularity }));
      reset({
        date: today,
        customerName: "",
        salespersonName: "",
        notes: "",
        items: [],
      });
    } else {
      const msg =
        res?.payload?.error?.message ||
        res?.payload?.error ||
        "Failed to create invoice";
      toast({ title: "Failed", description: msg });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm">Date</span>
              <input type="date" {...field} className="rounded-xl border p-2" />
              {errors.date && (
                <span className="text-xs text-red-600">
                  {errors.date.message}
                </span>
              )}
            </label>
          )}
        />
        <Controller
          name="customerName"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm">Customer Name</span>
              <input {...field} className="rounded-xl border p-2" />
              {errors.customerName && (
                <span className="text-xs text-red-600">
                  {errors.customerName.message}
                </span>
              )}
            </label>
          )}
        />
        <Controller
          name="salespersonName"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-1">
              <span className="text-sm">Salesperson Name</span>
              <input {...field} className="rounded-xl border p-2" />
              {errors.salespersonName && (
                <span className="text-xs text-red-600">
                  {errors.salespersonName.message}
                </span>
              )}
            </label>
          )}
        />
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <label className="flex flex-col gap-1 md:col-span-1">
              <span className="text-sm">Notes (optional)</span>
              <textarea {...field} className="rounded-xl border p-2" />
            </label>
          )}
        />
      </div>

      <div className="">
        <span className="text-sm">Products</span>
        <ProductSearch onSelect={(p) => addProduct(p)} />

        {errors.items && (
          <div className="text-xs text-red-600">
            {errors.items.message as string}
          </div>
        )}

        <div className="rounded-xl ">
          {items.map((it, idx) => (
            <div
              key={it.productId}
              className="grid grid-cols-12 items-center gap-2 border-b p-2 last:border-none"
            >
              <div className="col-span-5">{it.name}</div>
              <div className="col-span-2">
                Rp {it.priceCents.toLocaleString("id-ID")}
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border px-2"
                  onClick={() => {
                    const curr = items[idx];
                    if (!curr) return;
                    if (curr.qty > 1) {
                      // decrement
                      setValue(
                        "items",
                        items.map((x, i) =>
                          i === idx ? { ...x, qty: x.qty - 1 } : x
                        ),
                        { shouldValidate: true, shouldDirty: true }
                      );
                    } else {
                      // qty === 1 → remove the row
                      setValue(
                        "items",
                        items.filter((_, i) => i !== idx),
                        { shouldValidate: true, shouldDirty: true }
                      );
                    }
                  }}
                  title={it.qty === 1 ? "Remove item" : "Decrease quantity"}
                >
                  -
                </button>

                <span>{it.qty}</span>
                <button
                  type="button"
                  className="rounded-full border px-2"
                  onClick={() =>
                    setValue(
                      "items",
                      items.map((x, i) =>
                        i === idx ? { ...x, qty: x.qty + 1 } : x
                      ),
                      { shouldValidate: true, shouldDirty: true }
                    )
                  }
                >
                  +
                </button>
                <button
                  type="button"
                  className="ml-2 text-sm text-red-600"
                  onClick={() =>
                    setValue(
                      "items",
                      items.filter((_, i) => i !== idx),
                      { shouldValidate: true, shouldDirty: true }
                    )
                  }
                >
                  Remove
                </button>
              </div>
              <div className="col-span-2 text-right">
                Rp {(it.priceCents * it.qty).toLocaleString("id-ID")}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end text-lg font-semibold pt-2">
          Total: Rp {total.toLocaleString("id-ID")}
        </div>
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={isSubmitting || !isValid}
        title={!isValid ? "Lengkapi field wajib & tambahkan produk" : undefined}
      >
        Submit Invoice
      </button>
    </form>
  );
}
