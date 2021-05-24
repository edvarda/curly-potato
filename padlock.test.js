const { expect, test } = require('@jest/globals');
const { type } = require('os');
const { reset } = require('yargs');
var lock = require('./padlock');

function typeSequence(digitString) {
  for (const digit of digitString) {
    lock.typeDigit(digit);
  }
}

function resetAndUnlock() {
  lock.init((debug = true));
  expect(lock.status()).toBe('locked');
  typeSequence(lock.defaultCode);
  expect(lock.status()).toBe('unlocked');
  expect(lock.isLocked()).toBe(false);
}

function enterProgrammingMode() {
  resetAndUnlock();
  typeSequence(lock.programmingCode);
  expect(lock.status()).toBe('programming');
  expect(lock.isLocked()).toBe(true);
}

describe('padlock unit tests', function () {
  beforeEach(function () {
    jest.resetModules();
    lock = require('./padlock');
  });
  describe('lock mechanism', function () {
    test('invalid code', () => {
      expect(lock.isLocked()).toBe(true);
      typeSequence('4321');
      expect(lock.isLocked()).toBe(true);
    });

    test('valid code', function () {
      expect(lock.isLocked()).toBe(true);
      typeSequence('1234');
      expect(lock.isLocked()).toBe(false);
    });

    test('valid code in longer sequence', function () {
      expect(lock.isLocked()).toBe(true);
      typeSequence('432131234');
      expect(lock.isLocked()).toBe(false);
    });

    test('valid code with other digit mixed in', function () {
      expect(lock.isLocked()).toBe(true);
      typeSequence('12234');
      expect(lock.isLocked()).toBe(true);
    });

    test('code with repetition', () => {
      lock.setNewCode('1313');
      expect(lock.isLocked()).toBe(true);
      typeSequence('1313');
      expect(lock.isLocked()).toBe(false);
    });

    test('end of incorrect input matches start of correct input ', () => {
      lock.setNewCode('1312');
      expect(lock.isLocked()).toBe(true);
      typeSequence('1313');
      expect(lock.isLocked()).toBe(true);
      typeSequence('12');
      expect(lock.isLocked()).toBe(false);
    });
  });

  describe('programming function', () => {
    test('When open, lock listens for programming code, and locks on first digit.', () => {
      resetAndUnlock();
      expect(lock.isLocked()).toBe(false);
      typeSequence(lock.programmingCode[0]);
      expect(lock.status()).toBe('enteringProgrammingCode');
    });

    test('When open, entering a digit that is not the start of the programming code enters the locked state', () => {
      resetAndUnlock();
      expect(lock.isLocked()).toBe(false);
      typeSequence(lock.programmingCode[0] + 1);
      expect(lock.isLocked()).toBe(true);
      expect(lock.status()).toBe('locked');
    });

    test('Entering the programming code correctly enters programming mode', () => {
      resetAndUnlock();
      expect(lock.isLocked()).toBe(false);
      typeSequence(lock.programmingCode);
      expect(lock.status()).toBe('programming');
      expect(lock.isLocked()).toBe(true);
    });

    test('Entering the programming code incorrectly enters the locked state', () => {
      const incorrectCode = (Number(lock.programmingCode) + 1).toString();
      resetAndUnlock();
      expect(lock.isLocked()).toBe(false);
      typeSequence(incorrectCode);
      expect(lock.isLocked()).toBe(true);
      expect(lock.status()).toBe('locked');
    });

    test('Programming a new code enters the locked state with new code working', () => {
      const newCode = '5678';
      enterProgrammingMode();

      typeSequence(newCode);
      expect(lock.isLocked()).toBe(true);
      expect(lock.status()).toBe('locked');
      typeSequence(newCode);
      expect(lock.isLocked()).toBe(false);
      expect(lock.status()).toBe('unlocked');
    });

    test('Trying to set the new code to the programming code enters locked state without changing the code', () => {
      enterProgrammingMode();
      typeSequence(lock.programmingCode);
      expect(lock.isLocked()).toBe(true);
      expect(lock.status()).toBe('locked');
      typeSequence(lock.defaultCode);
      expect(lock.isLocked()).toBe(false);
      expect(lock.status()).toBe('unlocked');
    });
  });
});
