import { makeAutoObservable } from 'mobx';
import { WithQuery } from './withQuery';

type User = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

export class Store {
  constructor() {
    makeAutoObservable(this);
  }

  users = new WithQuery<User[]>(() =>
    fetch('https://jsonplaceholder.typicode.com/posts').then((res) =>
      res.json()
    )
  );
}
