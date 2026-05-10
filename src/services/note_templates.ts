import pb from '@/lib/pocketbase/client'

export interface NoteTemplate {
  id: string
  name: string
  content: string
  created_by: string
  created: string
  updated: string
}

export const getNoteTemplates = () =>
  pb.collection('note_templates').getFullList<NoteTemplate>({ sort: '-updated' })
export const createNoteTemplate = (data: Partial<NoteTemplate>) =>
  pb.collection('note_templates').create<NoteTemplate>(data)
export const updateNoteTemplate = (id: string, data: Partial<NoteTemplate>) =>
  pb.collection('note_templates').update<NoteTemplate>(id, data)
export const deleteNoteTemplate = (id: string) => pb.collection('note_templates').delete(id)
