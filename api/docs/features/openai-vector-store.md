# OpenAI Vector Store Setup

The document vector store module requires an OpenAI Vector Store ID. Follow these steps to create one:

1. Go to [platform.openai.com](https://platform.openai.com) and sign in.
2. Navigate to **Storage** → **Vector Stores** in the left sidebar.
3. Click **Create vector store**, give it a name, and save.
4. Copy the vector store ID (format: `vs_xxxxxxxxxx`) from the vector store detail page.
5. Add it to your `.env` file:

```
OPENAI_API_KEY=sk-...
OPENAI_VECTOR_STORE_ID=vs_xxxxxxxxxx
```

Alternatively, create one via the API:

```bash
curl https://api.openai.com/v1/vector_stores \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-vector-store"}'
```

The `id` field in the response is your `OPENAI_VECTOR_STORE_ID`.
