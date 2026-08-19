import { EComponentExampleStatus } from "./ComponentExamplesTable.enums";
import type { IComponentExampleRow } from "./ComponentExamplesTable.interfaces";

export const COMPONENT_EXAMPLES_TABLE_PAGE_SIZE = 5;

export const COMPONENT_EXAMPLES_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: EComponentExampleStatus.ACTIVE, label: "Active" },
  { value: EComponentExampleStatus.PENDING, label: "Pending" },
  { value: EComponentExampleStatus.ARCHIVED, label: "Archived" },
] as const;

export const COMPONENT_EXAMPLES_MOCK_ROWS: IComponentExampleRow[] = [
  {
    id: "1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "Editor",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-01-12",
  },
  {
    id: "2",
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "Admin",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-02-03",
  },
  {
    id: "3",
    name: "Alan Turing",
    email: "alan@example.com",
    role: "Viewer",
    status: EComponentExampleStatus.PENDING,
    createdAt: "2026-02-18",
  },
  {
    id: "4",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Editor",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-03-01",
  },
  {
    id: "5",
    name: "Donald Knuth",
    email: "donald@example.com",
    role: "Viewer",
    status: EComponentExampleStatus.ARCHIVED,
    createdAt: "2026-03-14",
  },
  {
    id: "6",
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    role: "Admin",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-04-02",
  },
  {
    id: "7",
    name: "Barbara Liskov",
    email: "barbara@example.com",
    role: "Editor",
    status: EComponentExampleStatus.PENDING,
    createdAt: "2026-04-21",
  },
  {
    id: "8",
    name: "Tim Berners-Lee",
    email: "tim@example.com",
    role: "Viewer",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-05-09",
  },
  {
    id: "9",
    name: "Linus Torvalds",
    email: "linus@example.com",
    role: "Admin",
    status: EComponentExampleStatus.ARCHIVED,
    createdAt: "2026-05-28",
  },
  {
    id: "10",
    name: "Radia Perlman",
    email: "radia@example.com",
    role: "Editor",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-06-11",
  },
  {
    id: "11",
    name: "Ken Thompson",
    email: "ken@example.com",
    role: "Viewer",
    status: EComponentExampleStatus.PENDING,
    createdAt: "2026-06-30",
  },
  {
    id: "12",
    name: "Frances Allen",
    email: "frances@example.com",
    role: "Admin",
    status: EComponentExampleStatus.ACTIVE,
    createdAt: "2026-07-08",
  },
];
