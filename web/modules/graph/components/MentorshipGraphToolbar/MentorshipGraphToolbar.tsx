import { GRAPH_TITLE } from "./MentorshipGraphToolbar.constants";

const MentorshipGraphToolbar = () => (
  <header className="flex h-13 shrink-0 items-center gap-3 border-b bg-background px-5">
    <h1 className="text-sm font-medium">{GRAPH_TITLE}</h1>
  </header>
);

export default MentorshipGraphToolbar;
