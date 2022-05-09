const createStore = (reducer) => {
  let state = undefined;
  const listeners = [];
  return {
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.push(listener);
    },

    getState() {
      return state;
    },
  };
};

const initState = {
  divistionCount: 1,
  createBox: false,
  imageRect: { x: 0, y: 0, width: 0, height: 0 },
  offset: { left: 0, top: 0 },
  scale: 1,
  apiCount: 0,
  mode: "none",
  lines: [],
};

export const actiontype = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
  SCALE: "SCALE",
  CREATBOX: "CREATBOX",
  BORDER: "BORDER",
  INITSTATE: "INITSTATE",
  OFFSET: "OFFSET",
  APICALLCOUNT: "APICALLCOUNT",
  MODE: "MODE",
  ADDLINE: "ADDLINE",
  LINEPOSITION: "LINEPOSITION",
};

const reducer = (state = initState, action) => {
  if (action.type === actiontype.INCREASE) {
    return { ...state, divistionCount: state.divistionCount + 1 };
  } else if (action.type === actiontype.DECREASE) {
    return { ...state, divistionCount: state.divistionCount - 1 };
  } else if (action.type === actiontype.SCALE) {
    return { ...state, scale: action.payload };
  } else if (action.type === actiontype.CREATBOX) {
    return { ...state, createBox: action.payload };
  } else if (action.type === actiontype.OFFSET) {
    return { ...state, offset: action.payload };
  } else if (action.type === actiontype.APICALLCOUNT) {
    return { ...state, apiCount: action.payload };
  } else if (action.type === actiontype.MODE) {
    return { ...state, mode: action.payload };
  } else if (action.type === actiontype.BORDER) {
    return { ...state, imageRect: action.payload };
  } else if (action.type === actiontype.INITSTATE) {
    return initState;
  } else if (action.type === actiontype.ADDLINE) {
    const lines = [...state.lines, action.payload];
    return { ...state, lines };
  } else if (action.type === actiontype.LINEPOSITION) {
    console.log(state.lines);
    const lines = state.lines.splice(0, state.lines.length - 1);
    console.log(lines);
    return { ...state, lines: [...lines, action.payload] };
  }
};

export const store = createStore(reducer);
