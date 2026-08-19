# Query Params Management with Nuqs

We use [`nuqs`](https://github.com/47ng/nuqs) for query params management throughout the project. This library provides a simple and type-safe way to read and write query parameters in Next.js apps.

## Example Usage

Below is an example of how we use Nuqs to manage query parameters for a counter, text input, and coordinates:

```tsx
import { useQueryState, parseAsInteger, useQueryStates, parseAsFloat } from "nuqs";

export default function NuqsDemoComponent() {
  const [count, setCount] = useQueryState("count", parseAsInteger.withDefault(0));
  const [text, setText] = useQueryState("text", { defaultValue: "" });
  const [coordinates, setCoordinates] = useQueryStates(
    {
      latitude: parseAsFloat.withDefault(45.18),
      longitude: parseAsFloat.withDefault(5.72),
    },
    {
      urlKeys: {
        latitude: "lat",
        longitude: "lng",
      },
    },
  );

  // ...component logic and UI...
}
```

- Changing the values will update the URL automatically.
- You can also manually change the `count`, `text`, `lat`, or `lng` parameters in the URL and see the component update.

**Note:** If you need to manage query params in a new feature, always use Nuqs for consistency and type safety.
