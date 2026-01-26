
export interface UserData {
  heightFt?: number;
  heightIn?: number;
  weight?: number;
  age?: number;
  insulinSelections: { type: string; brand: string }[];
}
