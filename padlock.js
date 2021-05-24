/*
Mindes KMP-automaterna från skolan.Tänkte att jag skulle börja innan jag läste nåt.
Först började jag skriva en FSM. Jag började snabbt googla på module pattern i JS.
Efter en stund tyckte jag att det kändes oklart att ha ett tillstånd för varje korrekt inmatad siffra, 
samt motsvarande för del 2. Då läste jag wikipedia för FSM, och insåg att det kallades för en acceptor det jag gjorde.
Sen bestämde jag mig för att inte teorisera mer utan bara skriva nåt som funkar.
*/
const defaultCode = '1234';
const programmingCode = '9999';
var code, state;

const states = {
  locked: {
    name: 'locked',
    isLocked: true,
    digitToCheck: 0, // TODO refactor
    transition: function (digit) {
      if (this.acceptInput(digit)) {
        if (this.onLastDigit()) {
          setState(states.unlocked);
        } else {
          setState(states.locked, { digitToCheck: this.digitToCheck + 1 });
        }
      } else if (this.digitToCheck != 0) {
        this.digitToCheck = 0;
        this.transition(digit);
      } else {
        setState(states.locked);
      }
    },
    onLastDigit: function () {
      return this.digitToCheck >= code.length - 1;
    },
    acceptInput: function (digit) {
      return code[this.digitToCheck] == digit;
    },
  },
  unlocked: {
    name: 'unlocked',
    isLocked: false,
    transition: function (digit) {
      if (this.acceptInput(digit)) {
        setState(states.enteringProgrammingCode);
      } else {
        setState(states.locked);
      }
    },
    acceptInput: function (digit) {
      return programmingCode[0] == digit;
    },
  },
  enteringProgrammingCode: {
    name: 'enteringProgrammingCode',
    isLocked: true,
    digitToCheck: 1, // TODO refactor
    transition: function (digit) {
      if (this.acceptInput(digit)) {
        if (this.onLastDigit()) {
          setState(states.programming);
        } else {
          setState(states.enteringProgrammingCode, { digitToCheck: this.digitToCheck + 1 });
        }
      } else {
        setState(states.locked);
      }
    },
    acceptInput: function (digit) {
      return programmingCode[this.digitToCheck] == digit;
    },
    onLastDigit: function () {
      return this.digitToCheck >= code.length - 1;
    },
  },
  programming: {
    name: 'programming',
    isLocked: true,
    newCode: '',
    transition: function (digit) {
      let newCode = this.newCode.concat(digit);

      if (this.digitsLeftToEnter(newCode)) {
        setState(states.programming, { newCode });
      } else {
        if (this.acceptInput(newCode)) {
          setNewCode(newCode);
        }
        setState(states.locked);
      }
    },
    acceptInput: function (newCode) {
      return newCode != programmingCode;
    },
    digitsLeftToEnter: function (newCode) {
      return code.length - newCode.length;
    },
  },
};

const setState = (newState, subState = {}) => {
  newState != undefined ? (state = { ...newState, ...subState }) : setState(initialState);
};

const setNewCode = (newCode) => {
  code = newCode;
};

const typeDigit = (digit) => {
  state.transition(digit);
};

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
