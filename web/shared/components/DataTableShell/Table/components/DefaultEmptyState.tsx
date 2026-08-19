export const DefaultEmptyState = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="py-16 text-center text-base text-muted-foreground">
      No data available
    </td>
  </tr>
);
