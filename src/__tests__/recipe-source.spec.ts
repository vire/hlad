jest.mock('fs');
import { recipes$ } from '../recipe-source';

describe('RecipeSource', () => {
  it('pushes recipes to subscriber', () => {
    recipes$.subscribe(
      val => expect(val).toEqual('{\n  "name": "Foo place",\n  "content": ""\n}\n')
    )
  })
});
