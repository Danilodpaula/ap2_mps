export interface User {
    id: number;
    username: string;
  }
  
  export interface Post {
    id: number;
    userId: number;
    content: string;
    createdAt: number;
    mediaUrl?: string; // Adicione esta
    mediaType?: 'image' | 'video'; // E esta
    likes?: Like[];
    comments?: Comment[];
    retweets?: Retweet[];
    user?: User;
  }
  
  export interface Like     { id: number; postId: number; userId: number; }
  export interface Comment  { 
    id: number; 
    postId: number; 
    userId: number; 
    text: string; 
    createdAt: number;
    mediaUrl?: string;  
    mediaType?: 'image' | 'video';
  }

  export interface SubComment  { 
    id: number; 
    postId: number; 
    userId: number; 
    text: string; 
    createdAt: number;
    mediaUrl?: string;   
    mediaType?: 'image' | 'video'; 
  }

  export interface Retweet  { id: number; postId: number; userId: number; createdAt: number; }
  