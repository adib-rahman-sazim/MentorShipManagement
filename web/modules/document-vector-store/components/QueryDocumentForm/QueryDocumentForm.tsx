import { Loader2 } from "lucide-react";

import QueryDocumentResults from "@/modules/document-vector-store/components/QueryDocumentResults";
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

import { QUERY_MAX_RESULTS_MAX, QUERY_MAX_RESULTS_MIN } from "./QueryDocumentForm.constants";
import { useQueryDocumentForm } from "./QueryDocumentForm.hooks";

const QueryDocumentForm = () => {
  const { form, onSubmit, isLoading, results, hasSearched } = useQueryDocumentForm({});

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex gap-4 items-start">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="sr-only">Search query</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your search query..." disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Max results</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={QUERY_MAX_RESULTS_MIN}
                    max={QUERY_MAX_RESULTS_MAX}
                    disabled={isLoading}
                    className="w-24"
                    title="Max results (1–20)"
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="shrink-0">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Search
          </Button>
        </form>
      </Form>
      <QueryDocumentResults results={results} isLoading={isLoading} hasSearched={hasSearched} />
    </>
  );
};

export default QueryDocumentForm;
