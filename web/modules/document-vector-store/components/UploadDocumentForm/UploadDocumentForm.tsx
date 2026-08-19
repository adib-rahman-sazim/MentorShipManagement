import { Loader2, Upload } from "lucide-react";

import { Button } from "@/shared/components/shadui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import { Input } from "@/shared/components/shadui/input";

import { useUploadDocumentForm } from "./UploadDocumentForm.hooks";

const UploadDocumentForm = () => {
  const { form, onSubmit } = useUploadDocumentForm();
  const isSubmitting = form.formState.isSubmitting;

  return (
    <section className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Upload Document
      </h2>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex gap-4 items-start">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value: _value, ...field } }) => (
              <FormItem>
                <FormLabel className="sr-only">File</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="file"
                    accept=".pdf"
                    disabled={isSubmitting}
                    onChange={(e) => onChange(e.target.files?.[0] ?? undefined)}
                    className="text-sm text-muted-foreground
                      file:mr-4 file:py-1 file:px-3
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Upload
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default UploadDocumentForm;
