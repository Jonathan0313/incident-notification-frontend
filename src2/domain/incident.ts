// src/domain/incident.ts
export interface AffectedService {
  code: string;
  nameService: string;
  status: string;
  startTime: string;
  endTime: string;
}

export interface Comment {
  sequence: number;
  content: string;
}

export interface Incident {
  id: string; // Es un UUID (string)
  name: string; // Mapea al campo "name" del JSON
  impact: string;
  jira?: string;
  partnerCase?: string;
  affectedComponent: string;
  description: string;
  resolution?: string;
  affectedServices: AffectedService[];
  comments: Comment[];
  status: string;
}