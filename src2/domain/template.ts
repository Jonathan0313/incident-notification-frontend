export interface Template {
  id?: string;
  typeTemplate: string;
  name: string;
  messageTemplate: string;
  createdAt?: string;
}

export interface CreateTemplateRequest {
  typeTemplate: string;
  name: string;
  messageTemplate: string;
}