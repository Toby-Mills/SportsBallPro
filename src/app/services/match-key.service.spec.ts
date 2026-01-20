import { TestBed } from '@angular/core/testing';
import { MatchKeyService } from './match-key.service';
import * as CryptoJS from 'crypto-js';

describe('MatchKeyService', () => {
  let service: MatchKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateKey', () => {
    it('should generate a key with hash prefix and gameId suffix', () => {
      const gameId = 'game123';
      const key = service.generateKey(gameId);
      
      // Key should be hash (8 chars) + gameId
      expect(key.length).toBe(8 + gameId.length);
      expect(key.endsWith(gameId)).toBe(true);
    });

    it('should generate consistent keys for the same gameId', () => {
      const gameId = 'testgame456';
      const key1 = service.generateKey(gameId);
      const key2 = service.generateKey(gameId);
      
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different gameIds', () => {
      const key1 = service.generateKey('game123');
      const key2 = service.generateKey('game456');
      
      expect(key1).not.toBe(key2);
    });

    it('should use SHA256 hash for key generation', () => {
      const gameId = 'game789';
      const key = service.generateKey(gameId);
      
      // Calculate expected hash manually
      const expectedHash = CryptoJS.SHA256(gameId).toString(CryptoJS.enc.Hex).slice(0, 8);
      const expectedKey = `${expectedHash}${gameId}`;
      
      expect(key).toBe(expectedKey);
    });

    it('should handle empty string gameId', () => {
      const key = service.generateKey('');
      
      // Should still generate a hash for empty string
      expect(key.length).toBe(8); // Just the hash
      expect(key).toBeTruthy();
    });

    it('should handle special characters in gameId', () => {
      const gameId = 'game-123_test!@#';
      const key = service.generateKey(gameId);
      
      expect(key.endsWith(gameId)).toBe(true);
      expect(key.length).toBe(8 + gameId.length);
    });

    it('should handle very long gameIds', () => {
      const gameId = 'a'.repeat(1000);
      const key = service.generateKey(gameId);
      
      expect(key.endsWith(gameId)).toBe(true);
      expect(key.length).toBe(8 + gameId.length);
    });
  });

  describe('readKey', () => {
    it('should successfully read a valid key', () => {
      const gameId = 'game123';
      const key = service.generateKey(gameId);
      const result = service.readKey(key);
      
      expect(result).toBe(gameId);
    });

    it('should return empty string for invalid hash', () => {
      const gameId = 'game123';
      const key = service.generateKey(gameId);
      
      // Corrupt the hash portion
      const corruptedKey = '00000000' + gameId;
      const result = service.readKey(corruptedKey);
      
      expect(result).toBe('');
    });

    it('should return empty string for tampered gameId', () => {
      const gameId = 'game123';
      const key = service.generateKey(gameId);
      
      // Extract hash and replace gameId with different value
      const hash = key.slice(0, 8);
      const tamperedKey = hash + 'game456';
      const result = service.readKey(tamperedKey);
      
      expect(result).toBe('');
    });

    it('should handle keys shorter than 8 characters', () => {
      const result = service.readKey('short');
      
      // Hash will be 'short'.slice(0, 8) = 'short'
      // GameId will be 'short'.slice(8) = ''
      expect(result).toBe('');
    });

    it('should handle empty key', () => {
      const result = service.readKey('');
      
      expect(result).toBe('');
    });

    it('should validate round-trip for various gameIds', () => {
      const gameIds = [
        'game123',
        'match456',
        'test-game_789',
        'a',
        'very-long-game-id-12345678901234567890'
      ];
      
      gameIds.forEach(gameId => {
        const key = service.generateKey(gameId);
        const result = service.readKey(key);
        expect(result).toBe(gameId);
      });
    });

    it('should fail validation when hash is modified', () => {
      const gameId = 'game123';
      const key = service.generateKey(gameId);
      
      // Flip one character in the hash
      const modifiedKey = key.charAt(0) === 'a' 
        ? 'b' + key.slice(1)
        : 'a' + key.slice(1);
      
      const result = service.readKey(modifiedKey);
      expect(result).toBe('');
    });

    it('should fail validation when gameId is partially modified', () => {
      const gameId = 'game123';
      const key = service.generateKey(gameId);
      
      // Modify last character of gameId
      const modifiedKey = key.slice(0, -1) + 'x';
      const result = service.readKey(modifiedKey);
      
      expect(result).toBe('');
    });
  });

  describe('security validation', () => {
    it('should not accept keys with matching hash but different gameId', () => {
      const gameId1 = 'game123';
      const gameId2 = 'game456';
      
      const key1 = service.generateKey(gameId1);
      const hash1 = key1.slice(0, 8);
      
      // Try to use hash from gameId1 with gameId2
      const fakeKey = hash1 + gameId2;
      const result = service.readKey(fakeKey);
      
      expect(result).toBe('');
    });

    it('should validate integrity of entire key', () => {
      const key = service.generateKey('originalGame');
      
      // Any modification should fail validation
      const modifications = [
        key.slice(0, 4) + 'xxxx' + key.slice(8), // Modify hash
        key.slice(0, 8) + 'modified', // Replace gameId
        key + 'extra', // Append extra data
        key.slice(0, -1), // Remove last char
      ];
      
      modifications.forEach(modifiedKey => {
        const result = service.readKey(modifiedKey);
        expect(result).toBe('');
      });
    });

    it('should use first 8 characters of SHA256 hash', () => {
      const gameId = 'testgame';
      const key = service.generateKey(gameId);
      
      const fullHash = CryptoJS.SHA256(gameId).toString(CryptoJS.enc.Hex);
      const expectedHashPrefix = fullHash.slice(0, 8);
      
      expect(key.startsWith(expectedHashPrefix)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle numeric gameIds', () => {
      const gameId = '123456789';
      const key = service.generateKey(gameId);
      const result = service.readKey(key);
      
      expect(result).toBe(gameId);
    });

    it('should handle unicode characters', () => {
      const gameId = 'game🎮123';
      const key = service.generateKey(gameId);
      const result = service.readKey(key);
      
      expect(result).toBe(gameId);
    });

    it('should handle whitespace in gameIds', () => {
      const gameId = 'game 123 test';
      const key = service.generateKey(gameId);
      const result = service.readKey(key);
      
      expect(result).toBe(gameId);
    });

    it('should distinguish between similar gameIds', () => {
      const keys = [
        service.generateKey('game123'),
        service.generateKey('game124'),
        service.generateKey('Game123'),
        service.generateKey('game123 ')
      ];
      
      // All keys should be unique
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
      
      // All should round-trip correctly
      expect(service.readKey(keys[0])).toBe('game123');
      expect(service.readKey(keys[1])).toBe('game124');
      expect(service.readKey(keys[2])).toBe('Game123');
      expect(service.readKey(keys[3])).toBe('game123 ');
    });
  });
});
