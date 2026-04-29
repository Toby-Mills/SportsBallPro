import { Injectable } from '@angular/core';
import { Hex, SHA256 } from 'crypto-es';

@Injectable({
  providedIn: 'root'
})
export class MatchKeyService {

  constructor() { }

  generateKey(gameId: string): string {

    const hash = this.getHash(gameId);
    return `${hash}${gameId}`;
  }

  readKey(key: string): string {
    const hash = key.slice(0, 8);
    const gameId = key.slice(8);

    let testHash = this.getHash(gameId);
    if (hash == testHash) {
      return gameId;
    } else {
      return '';
    }
  }

  private getHash(gameId: string) {
    let hash = SHA256(gameId).toString(Hex);
    return hash.slice(0, 8);
  }
}
