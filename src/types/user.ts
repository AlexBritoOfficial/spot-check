export type Profile = {
  firstName: string;
  lastName: string;
  stance: string;
  profileImage: string;
  age: string;
  yearsSkating: number;
  filmer: boolean;
};

export type Bookmark = {
  spotId: number;
  savedAt: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  homecity: string;
  bookmarkedSpots: Bookmark[];
  myprofile: Profile;
};
