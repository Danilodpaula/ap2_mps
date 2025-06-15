export interface User {
    id: number;
    username: string;
  }
  
  export interface Post {
    id: number;
    userId: number;
    content: string;
    createdAt: number;
    likes?: Like[];
    comments?: Comment[];
    retweets?: Retweet[];
    user?: User;            // via ?_expand=user
  }
  
  export interface Like     { id: number; postId: number; userId: number; }
  export interface Comment  { id: number; postId: number; userId: number; text: string; createdAt: number; }
  export interface Retweet  { id: number; postId: number; userId: number; createdAt: number; }
  