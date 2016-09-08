interface FirebaseMock {
  child(str: string): any;
  set(val, cb): void;
  on(event, dataCb, errCb): void;
}

declare interface FirebaseRecipe {
  firebaseKey: string;
  URL: string;
}

declare interface CrawledRecipe {
  recipe: any;
  lunch: any;
}
