import ComponentExamplesForm from "@/modules/component-examples/components/ComponentExamplesForm";
import ComponentExamplesTable from "@/modules/component-examples/components/ComponentExamplesTable";

const ComponentExamplesContainer = () => (
  <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-16 px-4 py-12 md:px-6">
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Component examples</h2>
        <p className="max-w-2xl text-muted-foreground">
          Interactive showcase of shared form controls wired through react-hook-form, zod, and
          sonner toasts.
        </p>
      </div>
      <ComponentExamplesForm />
    </section>

    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Data table example</h2>
        <p className="max-w-2xl text-muted-foreground">
          Local search, page size, and pagination over mock rows using DataTableShell and Table.
        </p>
      </div>
      <ComponentExamplesTable />
    </section>
  </div>
);

export default ComponentExamplesContainer;
