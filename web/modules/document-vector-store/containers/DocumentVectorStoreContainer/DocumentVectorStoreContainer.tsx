import { Search } from "lucide-react";

import QueryDocumentForm from "@/modules/document-vector-store/components/QueryDocumentForm";
import UploadDocumentForm from "@/modules/document-vector-store/components/UploadDocumentForm";

const DocumentVectorStoreContainer = () => (
  <div className="container py-8 max-w-4xl">
    <h1 className="text-3xl font-bold mb-8">Document Vector Store</h1>

    <div className="space-y-8">
      <UploadDocumentForm />

      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Query Documents
        </h2>
        <QueryDocumentForm />
      </section>
    </div>
  </div>
);

export default DocumentVectorStoreContainer;
