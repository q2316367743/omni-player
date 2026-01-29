export interface Partner {
  id: string
  name: string
  avatar: string
  description: string
  personality: string
}

export interface Memo {
  id: string
  authorName: string
  authorAvatar: string
  content: string
  mood: string
  time: string
  atPartner: Partner | null
  aiComment: {
    name: string
    avatar: string
    content: string
  } | null
  comments: number
}
