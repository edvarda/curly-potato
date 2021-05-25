const defaultCode = '1234';
const programmingCode = '9999';
var code, state;

const states = {
  locked: {
    name: 'locked',
    isLocked: true,
    enteredDigits: '',
    getNextState: function (digit) {
      let candidateCode = this.enteredDigits.concat(digit);
      if (acceptInput(code, candidateCode)) {
        if (correctCode(code, candidateCode)) {
          return states.unlocked;
        } else {
          return { ...states.locked, enteredDigits: candidateCode };
        }
      } else if (this.enteredDigits.length > 1) {
        return { ...states.locked, enteredDigits: this.enteredDigits.substring(1) }.getNextState(
          digit,
        );
      } else {
        return { ...states.locked, enteredDigits: '' };
      }
    },
  },
  unlocked: {
    name: 'unlocked',
    isLocked: false,
    getNextState: function (digit) {
      if (acceptInput(programmingCode, digit)) {
        return { ...states.enteringProgrammingCode, enteredDigits: digit };
      } else {
        return states.locked;
      }
    },
  },
  enteringProgrammingCode: {
    name: 'enteringProgrammingCode',
    isLocked: true,
    enteredDigits: '',
    getNextState: function (digit) {
      let candidateCode = this.enteredDigits.concat(digit);
      if (acceptInput(programmingCode, candidateCode)) {
        if (correctCode(programmingCode, candidateCode)) {
          return states.programming;
        } else {
          return { ...states.enteringProgrammingCode, enteredDigits: candidateCode };
        }
      } else {
        return states.locked;
      }
    },
  },
  programming: {
    name: 'programming',
    isLocked: true,
    enteredDigits: '',
    getNextState: function (digit) {
      const candidateCode = this.enteredDigits.concat(digit);

      if (candidateCode.length < code.length) {
        return { ...states.programming, enteredDigits: candidateCode };
      } else {
        if (validLockCode(candidateCode)) {
          return {
            ...states.locked,
            onEnter: () => {
              setNewCode(candidateCode);
            },
          };
        }
        return states.locked;
      }
    },
  },
};

const acceptInput = (code, candidateCode) =>
  code.substring(0, candidateCode.length) === candidateCode;

const validLockCode = (candidateCode) => candidateCode != programmingCode;

const correctCode = (code, candidateCode) => code === candidateCode;

const triggerTransitionEffect = (state) => ('onEnter' in state ? state.onEnter() : null);

const transitionState = (digit) => {
  state = state.getNextState(digit);
  triggerTransitionEffect(state);
};

const setNewCode = (newCode) => (code = newCode);

const typeDigit = (digit) => transitionState(digit);

const initialState = states.locked;
const status = () => state.name;
const isLocked = () => state.isLocked;
const lock = () => setState(initialState);
const init = () => {
  code = defaultCode;
  state = initialState;
};

init();

module.exports = {
  isLocked,
  typeDigit,
  status,
  lock,
  setNewCode,
  init,
  defaultCode,
  programmingCode,
  code,
};
