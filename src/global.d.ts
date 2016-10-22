declare interface FirebaseMock {
  child(str: string): any;
  on(event, dataCb, errCb): void;
  set(val, cb): void;
}

declare type FirebaseTest = {
  firebaseKey: string;
}

declare type FirebaseRecipe = {
  firebaseKey: string;
  URL: string;
}

declare type ExtractedLunch = {
  lunch: {};
  recipe: any;
}
