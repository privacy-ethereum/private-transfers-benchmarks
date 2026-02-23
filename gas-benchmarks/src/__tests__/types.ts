export interface AddressEntry {
  name: string;
  comment: string;
  file: string;
}

export interface EventsEntry {
  name: string;
  comment: string;
  file: string;
  arrayEventCount: number;
  emitsEventCount: number;
}

export interface Entry {
  addresses: AddressEntry[];
  events: EventsEntry[];
  filePath: string;
}
